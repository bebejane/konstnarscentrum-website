import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { buildClient } from '@datocms/cma-client';
import regions from '../../regions.json';
import { hasFortnoxCredentials } from '../fortnox/auth';
import { listCustomers } from '../fortnox/customers';
import { sanitizeText } from '../fortnox/sync';
import type { FortnoxCustomer } from '../fortnox/customers';

/**
 * Import `address` + `postal_code` (optionally `city`) from Fortnox customers
 * into DatoCMS members.
 *
 * Safety model:
 *  - Fortnox is only ever read (`listCustomers`). Nothing is written there.
 *  - `main` and `dev` are never written to. Writes go to a *new* environment
 *    forked from `main` by this script (`--fork`), or to an existing
 *    `address-import-*` environment (`--target`).
 *  - Dry run by default: the plan CSV is always written, nothing else happens.
 *  - A member is only imported when its identity matches the Fortnox customer
 *    (`ExternalReference` === member id, or name + email match). A stored
 *    `fortnox_customer_number` alone is not trusted: some members point at
 *    another person's customer.
 *  - Members that already have an address are left alone unless `--overwrite`.
 *
 * Usage:
 *   npx tsx --tsconfig ./tsconfig.node.json lib/scripts/import-fortnox-addresses.ts [flags]
 *
 *   --plan (default)        read Fortnox + source env, write the CSV plan
 *   --fork                  create a new env forked from --source (default main)
 *   --name <env>            name of the new env (default address-import-<date>)
 *   --target <env>          write into an existing address-import-* env
 *   --apply                 perform the writes (requires --fork or --target)
 *   --source <env>          environment to fork from (default main)
 *   --region <slug>         Fortnox region (default ost)
 *   --include-review        also import name-only / email-only matches
 *   --include-city          also fill an empty `city` from Fortnox
 *   --overwrite             replace addresses the member already has
 *   --limit <n>             only write the first n members
 *   --out <csv>             plan/report file (default docs/fortnox-address-import.csv)
 *
 * Example:
 *   pnpm importaddress                                  # plan only
 *   pnpm importaddress --fork --apply                   # new env + writes
 */

type Member = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	address?: string;
	postal_code?: string;
	city?: string;
	region?: string | { id?: string };
	fortnox_customer_number?: string;
	[key: string]: any;
};

type MatchType = 'external-reference' | 'both' | 'name' | 'email' | 'none';

type Status =
	| 'import'
	| 'review'
	| 'mismatch'
	| 'shared-number'
	| 'missing-customer'
	| 'no-customer-number'
	| 'no-address'
	| 'existing';

type PlanRow = {
	member: Member;
	customer?: FortnoxCustomer;
	matchType?: MatchType;
	status: Status;
	newAddress?: string;
	newPostalCode?: string;
	newCity?: string;
	notes: string;
	result?: string;
};

const argv = process.argv.slice(2);
const argOf = (name: string): string | undefined => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 ? argv[i + 1] : undefined;
};
const has = (name: string) => argv.includes(`--${name}`);

const SOURCE_ENV = argOf('source') ?? 'main';
const TARGET_FLAG = argOf('target');
const FORK = has('fork');
const APPLY = has('apply');
const INCLUDE_REVIEW = has('include-review');
const INCLUDE_CITY = has('include-city');
const OVERWRITE = has('overwrite');
const LIMIT = Number(argOf('limit') ?? 0) || 0;
const REGION = argOf('region') ?? 'ost';
const OUT_FILE = argOf('out') ?? 'docs/fortnox-address-import.csv';
const ENV_NAME = argOf('name') ?? `address-import-${new Date().toISOString().slice(0, 10)}`;

/** Environments the script must never write to. */
const PROTECTED_ENVS = new Set(['main', 'dev']);
/** Prefix of environments this script is allowed to write into. */
const TARGET_PREFIX = 'address-import-';

const die = (message: string): never => {
	console.error(`\n✖ ${message}\n`);
	process.exit(1);
};

const normEmail = (value?: string) => (value ?? '').trim().toLowerCase();
const normName = (value?: string) => (sanitizeText(value) ?? '').toLowerCase();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fullName = (member: Member) =>
	sanitizeText([member.first_name, member.last_name].filter(Boolean).join(' ')) ?? '';
const customerNumber = (member: Member) => (member.fortnox_customer_number ?? '').trim();
const regionIdOf = (member: Member) =>
	typeof member.region === 'string' ? member.region : member.region?.id;

/**
 * Swedish postal codes are five digits. Fortnox has them both as `12345` and
 * `123 45`; anything that is not exactly five digits is reported, not written.
 */
const normalizePostalCode = (value?: string): { value?: string; problem?: string } => {
	const raw = (value ?? '').trim();
	if (!raw) return {};
	const digits = raw.replace(/[^\d]/g, '');
	if (digits.length !== 5) return { problem: `postal code "${raw}" is not 5 digits (skipped)` };
	return { value: `${digits.slice(0, 3)} ${digits.slice(3)}` };
};

// ---------------------------------------------------------------------------
// guards
// ---------------------------------------------------------------------------

if (!process.env.GRAPHQL_API_TOKEN_FULL && !process.env.DATOCMS_API_TOKEN)
	die('GRAPHQL_API_TOKEN_FULL / DATOCMS_API_TOKEN missing from .env');

if (FORK && TARGET_FLAG) die('use either --fork or --target, not both');

if (TARGET_FLAG) {
	if (!TARGET_FLAG.startsWith(TARGET_PREFIX))
		die(`--target must be an existing ${TARGET_PREFIX}* environment`);
	if (PROTECTED_ENVS.has(TARGET_FLAG))
		die(`refusing to write to the protected environment "${TARGET_FLAG}"`);
	if (!APPLY) die('--target only makes sense together with --apply');
}

if (APPLY && !FORK && !TARGET_FLAG)
	die(`--apply needs a place to write to: add --fork (new ${TARGET_PREFIX}* env) or --target <env>`);

if (APPLY && PROTECTED_ENVS.has(ENV_NAME)) die(`refusing to create/write "${ENV_NAME}"`);

if (!regions.some((r) => r.slug === REGION)) die(`unknown region "${REGION}"`);

const regionRecord = regions.find((r) => r.slug === REGION)!;

const apiToken = (process.env.GRAPHQL_API_TOKEN_FULL ?? process.env.DATOCMS_API_TOKEN) as string;

// ---------------------------------------------------------------------------
// load data
// ---------------------------------------------------------------------------

/** Read every member of the region from an environment (never writes). */
const loadMembers = async (environment: string): Promise<Member[]> => {
	const client = buildClient({ apiToken, environment });
	const members: Member[] = [];
	for await (const record of client.items.listPagedIterator({
		filter: { type: 'member', fields: { region: { eq: regionRecord.id } } },
	})) {
		members.push(record as unknown as Member);
	}

	// Defensive: if the link filter ever comes back empty, filter client-side.
	if (!members.length) {
		for await (const record of client.items.listPagedIterator({ filter: { type: 'member' } })) {
			const member = record as unknown as Member;
			if (regionIdOf(member) === regionRecord.id) members.push(member);
		}
	}
	return members;
};

const describeCustomer = (customer?: FortnoxCustomer) =>
	customer
		? `#${customer.CustomerNumber} "${(customer.Name ?? '').trim()}" <${(customer.Email ?? '').trim()}>`
		: '—';

/** Classify the member's link to the customer by identity, strongest first. */
const matchType = (customer: FortnoxCustomer, member: Member): MatchType => {
	if ((customer.ExternalReference ?? '').trim() === member.id) return 'external-reference';
	const nameMatches = !!normName(customer.Name) && normName(customer.Name) === normName(fullName(member));
	const emailMatches = !!normEmail(customer.Email) && normEmail(customer.Email) === normEmail(member.email);
	if (nameMatches && emailMatches) return 'both';
	if (nameMatches) return 'name';
	if (emailMatches) return 'email';
	return 'none';
};

const buildPlan = (members: Member[], customers: FortnoxCustomer[]): PlanRow[] => {
	const byNumber = new Map<string, FortnoxCustomer>();
	for (const customer of customers) byNumber.set(String(customer.CustomerNumber).trim(), customer);

	// Two members pointing at the same customer is a broken link, not data.
	const numberUsage = new Map<string, number>();
	for (const member of members) {
		const number = customerNumber(member);
		if (number) numberUsage.set(number, (numberUsage.get(number) ?? 0) + 1);
	}

	return members.map((member): PlanRow => {
		const number = customerNumber(member);
		const customer = number ? byNumber.get(number) : undefined;
		const notes: string[] = [];

		if (!number) return { member, status: 'no-customer-number', notes: 'no fortnox_customer_number' };
		if (!customer) return { member, status: 'missing-customer', notes: `customer #${number} not found in Fortnox` };
		if ((numberUsage.get(number) ?? 0) > 1)
			return {
				member,
				customer,
				status: 'shared-number',
				notes: `#${number} is linked to ${numberUsage.get(number)} members`,
			};

		const type = matchType(customer, member);

		const address = sanitizeText(customer.Address1) ?? sanitizeText(customer.Address2);
		const postal = normalizePostalCode(customer.ZipCode);
		const city = sanitizeText(customer.City);

		if (postal.problem) notes.push(postal.problem);
		if (!address) notes.push('no street address in Fortnox');
		if (!postal.value) notes.push('no postal code in Fortnox');

		if (type === 'none')
			return {
				member,
				customer,
				matchType: type,
				status: 'mismatch',
				notes: 'customer belongs to another person — not imported',
			};

		if (!address && !postal.value) return { member, customer, matchType: type, status: 'no-address', notes: notes.join('; ') };

		const memberHasAddress = !!sanitizeText(member.address) || !!sanitizeText(member.postal_code);
		if (memberHasAddress && !OVERWRITE)
			return {
				member,
				customer,
				matchType: type,
				status: 'existing',
				notes: 'member already has an address (use --overwrite to replace)',
			};

		const review = type === 'name' || type === 'email';
		if (review && !INCLUDE_REVIEW) {
			notes.push(`${type} match only — use --include-review to import`);
			return { member, customer, matchType: type, status: 'review', notes: notes.join('; ') };
		}

		if (!postal.value && !address) notes.push('nothing to import');

		return {
			member,
			customer,
			matchType: type,
			status: 'import',
			newAddress: address,
			newPostalCode: postal.value,
			newCity: INCLUDE_CITY ? city : undefined,
			notes: notes.join('; '),
		};
	});
};

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const writeReport = (rows: PlanRow[], environment?: string) => {
	const header = [
		'Status',
		'Match',
		'MemberID',
		'Member',
		'MemberEmail',
		'CustomerNumber',
		'Customer',
		'CustomerEmail',
		'FortnoxAddress',
		'FortnoxZip',
		'FortnoxCity',
		'MemberAddress',
		'MemberZip',
		'MemberCity',
		'NewAddress',
		'NewPostalCode',
		'NewCity',
		'Notes',
		'Result',
		'Environment',
	];

	const lines = rows.map((row) =>
		[
			row.status,
			row.matchType ?? '',
			row.member.id,
			fullName(row.member),
			row.member.email ?? '',
			row.customer?.CustomerNumber ?? '',
			(row.customer?.Name ?? '').trim(),
			(row.customer?.Email ?? '').trim(),
			(row.customer?.Address1 ?? '').trim(),
			(row.customer?.ZipCode ?? '').trim(),
			(row.customer?.City ?? '').trim(),
			(row.member.address ?? '').trim(),
			(row.member.postal_code ?? '').trim(),
			(row.member.city ?? '').trim(),
			row.newAddress ?? '',
			row.newPostalCode ?? '',
			row.newCity ?? '',
			row.notes,
			row.result ?? '',
			environment ?? '',
		]
			.map(escapeCsv)
			.join(','),
	);

	fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
	fs.writeFileSync(OUT_FILE, '\uFEFF' + [header.join(','), ...lines].join('\r\n'), 'utf8');
	return path.resolve(OUT_FILE);
};

const summarize = (rows: PlanRow[], label: string) => {
	const counts = new Map<Status, number>();
	for (const row of rows) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
	const order: Status[] = [
		'import',
		'review',
		'mismatch',
		'shared-number',
		'missing-customer',
		'no-customer-number',
		'no-address',
		'existing',
	];
	console.log(`\n${label} (${rows.length} members):`);
	for (const status of order) {
		const count = counts.get(status) ?? 0;
		if (count) console.log(`  ${status.padEnd(18)} ${count}`);
	}
};

// ---------------------------------------------------------------------------
// environment handling
// ---------------------------------------------------------------------------

const waitForEnvironment = async (environment: string, timeoutMs = 5 * 60 * 1000) => {
	const client = buildClient({ apiToken, environment: 'main' });
	const deadline = Date.now() + timeoutMs;
	let lastStatus = '';
	while (Date.now() < deadline) {
		const found = (await client.environments.list()).find((env) => env.id === environment);
		if (!found) die(`environment "${environment}" disappeared while waiting for the fork`);
		const status = found.meta?.status;
		if (status === 'ready') return;
		if (status !== lastStatus) {
			console.log(`  … ${environment}: ${status}`);
			lastStatus = status ?? '';
		}
		await sleep(3000);
	}
	die(`environment "${environment}" was not ready within 5 minutes`);
};

const createFork = async (): Promise<string> => {
	const client = buildClient({ apiToken, environment: 'main' });
	const existing = await client.environments.list();
	if (existing.some((env) => env.id === ENV_NAME))
		die(`environment "${ENV_NAME}" already exists — pick another name with --name`);

	console.log(`\nForking ${SOURCE_ENV} → ${ENV_NAME} …`);
	await client.environments.fork(SOURCE_ENV, { id: ENV_NAME });
	await waitForEnvironment(ENV_NAME);
	console.log(`  ✓ ${ENV_NAME} is ready`);
	return ENV_NAME;
};

const assertWritableTarget = async (environment: string) => {
	if (PROTECTED_ENVS.has(environment)) die(`refusing to write to the protected environment "${environment}"`);
	if (!environment.startsWith(TARGET_PREFIX))
		die(`refusing to write to "${environment}" — expected an ${TARGET_PREFIX}* environment`);

	const client = buildClient({ apiToken, environment: 'main' });
	const found = (await client.environments.list()).find((env) => env.id === environment);
	if (!found) die(`environment "${environment}" does not exist`);
	if (found.meta?.status !== 'ready') die(`environment "${environment}" is ${found.meta?.status}`);
};

// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------

const rowUpdate = (row: PlanRow): Record<string, string> => {
	const update: Record<string, string> = {};
	if (row.newAddress) update.address = row.newAddress;
	if (row.newPostalCode) update.postal_code = row.newPostalCode;
	if (row.newCity) update.city = row.newCity;
	return update;
};

const applyPlan = async (rows: PlanRow[], environment: string) => {
	await assertWritableTarget(environment);

	const client = buildClient({ apiToken, environment });
	let queue = rows.filter((row) => row.status === 'import' && Object.keys(rowUpdate(row)).length > 0);
	if (LIMIT > 0) queue = queue.slice(0, LIMIT);

	if (!queue.length) {
		console.log('\nNothing to write.');
		return;
	}

	// What the target environment already holds, so a re-run against the same
	// fork does not rewrite values that are already correct.
	const current = new Map<string, Member>();
	for await (const record of client.items.listPagedIterator({
		filter: { type: 'member', fields: { region: { eq: regionRecord.id } } },
	}))
		current.set((record as unknown as Member).id, record as unknown as Member);

	console.log(`\nWriting ${queue.length} members into "${environment}" …`);
	let written = 0;
	let unchanged = 0;
	let failed = 0;

	for (let i = 0; i < queue.length; i++) {
		const row = queue[i];
		const update = rowUpdate(row);

		const existing = current.get(row.member.id);
		const alreadyThere =
			!!existing && Object.entries(update).every(([key, value]) => (existing[key] ?? '') === value);
		if (alreadyThere) {
			unchanged++;
			row.result = 'already up to date';
			continue;
		}

		try {
			const record = (await client.items.update(row.member.id, update)) as unknown as Member;
			const stale = Object.keys(update).filter(
				(key) => record?.[key] !== undefined && record[key] !== update[key],
			);
			if (stale.length) {
				// The update response does not always echo every field — re-read once.
				const fresh = (await client.items.find(row.member.id)) as unknown as Member;
				const stillStale = Object.keys(update).filter((key) => fresh[key] !== update[key]);
				if (stillStale.length) {
					failed++;
					row.result = `verify failed: ${stillStale.join(', ')}`;
				} else {
					written++;
					row.result = 'written';
				}
			} else {
				written++;
				row.result = 'written';
			}
		} catch (err: any) {
			failed++;
			row.result = `error: ${err?.message ?? err}`;
		}

		if ((i + 1) % 25 === 0 || i + 1 === queue.length)
			console.log(`  ${i + 1}/${queue.length} (${written} ok, ${failed} failed)`);
		await sleep(150);
	}

	console.log(
		`\nDone: ${written} written, ${unchanged} already up to date, ${failed} failed, in "${environment}".`,
	);
	if (failed)
		console.log('  Failed rows are marked in the report — nothing else was retried.');
};

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const main = async () => {
	console.log(`Import Fortnox addresses → DatoCMS member (region ${REGION})`);
	console.log(`  source env: ${SOURCE_ENV}`);
	console.log(`  mode: ${APPLY ? 'APPLY' : 'plan only'}`);
	console.log(`  review matches: ${INCLUDE_REVIEW ? 'included' : 'reported only'}`);
	if (INCLUDE_CITY) console.log('  city: also imported');

	if (!hasFortnoxCredentials(REGION))
		die(`Fortnox is not configured/enabled for ${REGION} (check .env and FORTNOX_ENABLED_REGIONS)`);

	console.log(`\nReading members from ${SOURCE_ENV} …`);
	const members = await loadMembers(SOURCE_ENV);
	console.log(`  ${members.length} ${regionRecord.name} members`);

	console.log(`Reading Fortnox customers (${REGION}) …`);
	const customers = await listCustomers(REGION);
	console.log(`  ${customers.length} customers`);

	const rows = buildPlan(members, customers);

	summarize(rows, 'Plan');
	const reportPath = writeReport(rows);
	console.log(`  Report: ${reportPath}`);

	const mismatches = rows.filter((row) => row.status === 'mismatch');
	if (mismatches.length) {
		console.log(`\n⚠ ${mismatches.length} members point at a customer that is not theirs (not imported):`);
		for (const row of mismatches.slice(0, 5))
			console.log(`  ${fullName(row.member)} <${row.member.email ?? ''}> → ${describeCustomer(row.customer)}`);
		if (mismatches.length > 5) console.log(`  … and ${mismatches.length - 5} more in the report`);
	}

	let environment = TARGET_FLAG;
	if (FORK) environment = await createFork();

	if (!APPLY) {
		console.log(
			`\nPlan only — nothing was written. Run with --fork --apply to import into a new environment.`,
		);
		return;
	}

	if (!environment) die('no target environment'); // unreachable, guarded above
	await applyPlan(rows, environment);

	const finalPath = writeReport(rows, environment);
	console.log(`  Report: ${finalPath}`);
	console.log(`\nEnvironment "${environment}" now holds the import.`);
	console.log('  Check it in DatoCMS → Project settings → Environments.');
	console.log('  Promoting it to primary is a manual step — the script never promotes.');
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

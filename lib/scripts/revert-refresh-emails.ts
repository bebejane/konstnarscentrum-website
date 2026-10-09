import 'dotenv/config';

import fs from 'fs';
import { hasFortnoxCredentials } from '../fortnox/auth';
import { listCustomers, updateCustomer } from '../fortnox/customers';
import type { FortnoxCustomer } from '../fortnox/customers';

/**
 * Revert the e-mail writes made by the (partial) refresh of repointed customers.
 *
 * The refresh was not supposed to overwrite the Fortnox e-mail — we want to keep
 * the Fortnox e-mails as-is for manual review. This restores each affected
 * customer's E-mail to the value in the pre-run snapshot.
 *
 * Restores E-mail ONLY (names were unchanged). Dry-run unless --apply --yes-live.
 */

type Row = Record<string, string>;
const argv = process.argv.slice(2);
const argOf = (n: string) => (argv.indexOf(`--${n}`) >= 0 ? argv[argv.indexOf(`--${n}`) + 1] : undefined);
const APPLY = argv.includes('--apply');
const CONFIRM = argv.includes('--yes-live');
const REGION = 'ost';
const SNAPSHOT = argOf('snapshot') ?? 'docs/fortnox-customers-before-dedupe.json';
const PLAN = argOf('plan') ?? 'docs/fortnox-restore-plan.csv';

const ne = (v?: string) => (v ?? '').trim().toLowerCase();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseCsv(text: string): Row[] {
	const rows: string[][] = [];
	let row: string[] = [];
	let f = '';
	let q = false;
	const s = text.replace(/^\uFEFF/, '');
	for (let i = 0; i < s.length; i++) {
		const c = s[i];
		if (q) {
			if (c === '"') {
				if (s[i + 1] === '"') {
					f += '"';
					i++;
				} else q = false;
			} else f += c;
		} else if (c === '"') q = true;
		else if (c === ',') {
			row.push(f);
			f = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && s[i + 1] === '\n') i++;
			row.push(f);
			f = '';
			if (row.length > 1 || row[0] !== '') rows.push(row);
			row = [];
		} else f += c;
	}
	if (f !== '' || row.length) {
		row.push(f);
		if (row.length > 1 || row[0] !== '') rows.push(row);
	}
	const h = rows[0].map((x) => x.trim());
	return rows.slice(1).map((r) => {
		const o: Row = {};
		h.forEach((k, i) => (o[k] = (r[i] ?? '').trim()));
		return o;
	});
}

async function main() {
	const live = APPLY && CONFIRM;
	console.log(`${live ? 'LIVE APPLY' : 'DRY-RUN'} revert av refresh-e-post`);

	const snap: any[] = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
	const before = new Map(snap.map((c) => [String(c.CustomerNumber).trim(), c.Email ?? '']));
	const now = new Map((await listCustomers(REGION)).map((c) => [String(c.CustomerNumber).trim(), c.Email ?? '']));

	const targets: string[] = [];
	for (const r of parseCsv(fs.readFileSync(PLAN, 'utf8'))) {
		if (r.Typ !== 'Medlemsfält') continue;
		const m = r.Kundnr.match(/(\d+)\s*→\s*(\d+)/);
		if (m) targets.push(m[2]);
	}

	const toRevert: { num: string; from: string; to: string }[] = [];
	for (const num of targets) {
		const b = before.get(num);
		const n = now.get(num);
		if (b !== undefined && n !== undefined && ne(b) !== ne(n)) toRevert.push({ num, from: n, to: b });
	}

	console.log(`kunder med ändrad e-post: ${toRevert.length}`);
	for (const t of toRevert) console.log(`  #${t.num}: "${t.from}" → "${t.to}"`);

	if (!live) {
		console.log('\nDRY-RUN. Kör med --apply --yes-live för att återställa.');
		return;
	}
	if (!hasFortnoxCredentials(REGION)) throw new Error(`Fortnox inte konfigurerat för ${REGION}`);

	for (const t of toRevert) {
		// E-mail only — do not touch Name or ExternalReference.
		const data = { Email: t.to } as Partial<FortnoxCustomer>;
		await updateCustomer(REGION, t.num, data);
		console.log(`  ✓ #${t.num} e-post återställd till "${t.to}"`);
		await sleep(250);
	}
	console.log(`Klart: ${toRevert.length} e-postadresser återställda.`);
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});

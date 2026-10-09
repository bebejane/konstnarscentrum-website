import 'dotenv/config';

import fs from 'fs';
import { hasFortnoxCredentials } from '../fortnox/auth';
import { updateCustomer } from '../fortnox/customers';
import type { FortnoxCustomer } from '../fortnox/customers';

/**
 * Freeze the repointed customers for manual review.
 *
 * Sets ExternalReference to a sentinel (`REVIEW`) on each kept customer, so the
 * sync guard (`ref && ref !== member.id` → skip) will NOT touch them — the
 * Fortnox e-mails stay exactly as they are while they're reviewed. Re-run the
 * dedupe later to un-freeze (it rewrites the ref to the member id).
 *
 * Dry-run unless --apply --yes-live.
 */

type Row = Record<string, string>;
const argv = process.argv.slice(2);
const argOf = (n: string) => (argv.indexOf(`--${n}`) >= 0 ? argv[argv.indexOf(`--${n}`) + 1] : undefined);
const APPLY = argv.includes('--apply');
const CONFIRM = argv.includes('--yes-live');
const REGION = 'ost';
const SENTINEL = argOf('ref') ?? 'REVIEW';
const PLAN = argOf('plan') ?? 'docs/fortnox-restore-plan.csv';
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
	console.log(`${live ? 'LIVE APPLY' : 'DRY-RUN'} frys repointade kunder (ref="${SENTINEL}")`);

	const targets: { to: string; who: string }[] = [];
	for (const r of parseCsv(fs.readFileSync(PLAN, 'utf8'))) {
		if (r.Typ !== 'Medlemsfält') continue;
		const m = r.Kundnr.match(/(\d+)\s*→\s*(\d+)/);
		if (m) targets.push({ to: m[2], who: r['Rätt ägare (medlem)'] ?? '' });
	}
	console.log(`mål: ${targets.length} kunder sätts till ref="${SENTINEL}" (synken hoppar över dem)`);
	for (const t of targets) console.log(`  #${t.to}  ${t.who}`);

	if (!live) {
		console.log('\nDRY-RUN. Kör med --apply --yes-live för att frysa.');
		return;
	}
	if (!hasFortnoxCredentials(REGION)) throw new Error(`Fortnox inte konfigurerat för ${REGION}`);
	for (const t of targets) {
		await updateCustomer(REGION, t.to, { ExternalReference: SENTINEL } as Partial<FortnoxCustomer>);
		console.log(`  ✓ #${t.to} fryst (ref="${SENTINEL}")`);
		await sleep(250);
	}
	console.log(`Klart: ${targets.length} kunder frysta för granskning.`);
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});

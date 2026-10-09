import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { buildClient } from '@datocms/cma-client';
import { sanitizeText } from '../fortnox/sync';
import { hasFortnoxCredentials } from '../fortnox/auth';
import { updateCustomer } from '../fortnox/customers';
import type { FortnoxCustomer } from '../fortnox/customers';

/**
 * Restore Fortnox customers from the September 24 customer export.
 *
 * Rationale: the Sept-24 export and the current register share the same
 * numbering (only 32 numbers hold a different person), so an overwrite shows up
 * as "same customer number, different e-mail". This script is independent of
 * the Fortnox audit log — it derives the restore set purely from the two
 * snapshots, then cross-checks against the audit-log plan.
 *
 * DRY-RUN BY DEFAULT — writes only the plan CSV. Fortnox is touched only with
 * both `--apply` and `--yes-live`.
 *
 * Usage:
 *   npx tsx --tsconfig ./tsconfig.node.json lib/scripts/restore-fortnox-from-september.ts \
 *     [--env main|dev] [--sept <xlsx>] [--register <csv>] [--out <csv>] [--apply --yes-live]
 */

type Row = Record<string, string>;

const argv = process.argv.slice(2);
const argOf = (name: string): string | undefined => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 ? argv[i + 1] : undefined;
};
const has = (name: string) => argv.includes(`--${name}`);

const ENVIRONMENT = argOf('env') ?? process.env.DATOCMS_ENVIRONMENT ?? 'main';
const SEPT_FILE = argOf('sept') ?? 'docs/customer-export-2026-09-24.xlsx';
const SOURCE_FILE = argOf('source') ?? SEPT_FILE;
const REGISTER_FILE = argOf('register') ?? 'docs/kundregister 2026-10-08.csv';
const OUT_FILE = argOf('out') ?? 'docs/fortnox-restore-sept.csv';
const AUDIT_PLAN = 'docs/fortnox-restore-plan.csv'; // for cross-check
const APPLY = has('apply');
const CONFIRM = has('yes-live');
const REGION = 'ost';

const client = buildClient({
	apiToken: (process.env.GRAPHQL_API_TOKEN_FULL ?? process.env.DATOCMS_API_TOKEN) as string,
	environment: ENVIRONMENT,
});

const normEmail = (v?: string) => (v ?? '').trim().toLowerCase();
const normName = (v?: string) => (sanitizeText(v ?? '') ?? '').toLowerCase();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCsv(text: string): Row[] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	const src = text.replace(/^\uFEFF/, '');
	for (let i = 0; i < src.length; i++) {
		const c = src[i];
		if (quoted) {
			if (c === '"') {
				if (src[i + 1] === '"') {
					field += '"';
					i++;
				} else quoted = false;
			} else field += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && src[i + 1] === '\n') i++;
			row.push(field);
			field = '';
			if (row.length > 1 || row[0] !== '') rows.push(row);
			row = [];
		} else field += c;
	}
	if (field !== '' || row.length) {
		row.push(field);
		if (row.length > 1 || row[0] !== '') rows.push(row);
	}
	if (!rows.length) return [];
	const header = rows[0].map((h) => h.trim());
	return rows.slice(1).map((r) => {
		const o: Row = {};
		header.forEach((h, i) => (o[h] = (r[i] ?? '').trim()));
		return o;
	});
}

type Member = { id: string; email?: string; first_name?: string; last_name?: string };

async function loadMembersByEmail(): Promise<Map<string, Member[]>> {
	const map = new Map<string, Member[]>();
	for await (const rec of client.items.listPagedIterator({ filter: { type: 'member' } })) {
		const m = rec as unknown as Member;
		const e = normEmail(m.email);
		if (!e) continue;
		const list = map.get(e) ?? [];
		list.push(m);
		map.set(e, list);
	}
	return map;
}

async function main() {
	const live = APPLY && CONFIRM;
	console.log(`${live ? 'LIVE APPLY' : 'DRY-RUN'} env=${ENVIRONMENT}`);
	console.log(`source=${SOURCE_FILE}\nregister=${REGISTER_FILE}`);

	// 1) Source snapshot. Two formats: a headed export (CustomerNumber/Name/
	//    Email/…) and the header-less positional format (Name, CustomerNumber,
	//    Email, …, City).
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(SOURCE_FILE);
	const ws = wb.worksheets[0];
	const hdrRaw = (ws.getRow(1).values as any[]).slice(1).map((h) => (h == null ? '' : String(h)));
	const hasHeader = hdrRaw.some((h) => ['CustomerNumber', 'Email', 'customer_number', 'email'].includes(h));
	const sept = new Map<string, Row>();
	if (hasHeader) {
		for (let i = 2; i <= ws.rowCount; i++) {
			const v = (ws.getRow(i).values as any[]).slice(1);
			if (v.length === 0 || v[0] == null) continue;
			const o: Row = {};
			hdrRaw.forEach((h, j) => (o[h] = (v[j] ?? '').toString().trim()));
			if (o.CustomerNumber) sept.set(o.CustomerNumber.trim(), o);
		}
	} else {
		for (let i = 1; i <= ws.rowCount; i++) {
			const v = (ws.getRow(i).values as any[]).slice(1);
			if (v.length === 0 || v[1] == null) continue;
			const num = String(v[1]).trim();
			if (!num) continue;
			sept.set(num, {
				CustomerNumber: num,
				Name: (v[0] ?? '').toString().trim(),
				Email: (v[2] ?? '').toString().trim(),
				City: (v[9] ?? '').toString().trim(),
			});
		}
	}

	// 2) Current register.
	const register = new Map(
		parseCsv(fs.readFileSync(REGISTER_FILE, 'utf8')).map((r) => [r.customer_number.trim(), r]),
	);
	console.log(`source customers: ${sept.size} (${hasHeader ? 'headed' : 'positional'}) | register: ${register.size}`);

	// 3) Diff by customer number: same number, different e-mail = overwritten.
	//    Primary = the source snapshot; fallback = the audit-log plan (covers
	//    numbers the source predates, e.g. org customers added after August).
	const membersByEmail = await loadMembersByEmail();
	type Sample = { name: string; email: string; city: string };
	type Target = {
		num: string;
		name: string;
		email: string;
		city: string;
		source: string;
		nowName: string;
		nowEmail: string;
		ownerId: string;
		ownerLabel: string;
	};

	const primary = new Map<string, Sample>();
	sept.forEach((s, num) => {
		const o = register.get(num);
		if (!o) return;
		if (normEmail(s.Email) === normEmail(o.email)) return;
		primary.set(num, {
			name: sanitizeText(s.Name ?? '') ?? s.Name ?? '',
			email: (s.Email ?? '').trim(),
			city: sanitizeText(s.City ?? '') ?? '',
		});
	});

	type Fallback = Sample & { ref: string; ownerLabel: string };
	const fallback = new Map<string, Fallback>();
	if (fs.existsSync(AUDIT_PLAN)) {
		for (const r of parseCsv(fs.readFileSync(AUDIT_PLAN, 'utf8'))) {
			if (r.Typ !== 'Återställ') continue;
			fallback.set(r.Kundnr.trim(), {
				name: r['Återställ namn'] ?? '',
				email: r['Återställ e-post'] ?? '',
				city: r['Återställ ort'] ?? '',
				ref: r['ExternalReference (ny)'] ?? '',
				ownerLabel: r['Rätt ägare (medlem)'] ?? '',
			});
		}
	}

	const allNums = new Map<string, true>();
	primary.forEach((_, n) => allNums.set(n, true));
	fallback.forEach((_, n) => allNums.set(n, true));

	const targets: Target[] = [];
	allNums.forEach((_, num) => {
		const o = register.get(num);
		const p = primary.get(num);
		const f = fallback.get(num);
		const sample = p ?? f;
		if (!sample || !o) return;
		let ownerId = f?.ref ?? '';
		let ownerLabel = f?.ownerLabel ?? '';
		if (!ownerId) {
			const owner = membersByEmail.get(normEmail(sample.email)) ?? [];
			const m = owner.length === 1 ? owner[0] : undefined;
			if (m) {
				ownerId = m.id;
				ownerLabel = `${[m.first_name, m.last_name].filter(Boolean).join(' ').trim()} [${m.id}]`;
			}
		}
		targets.push({
			num,
			name: sample.name,
			email: sample.email,
			city: sample.city,
			source: p ? (fallback.has(num) ? 'källa + plan' : 'källa') : 'plan (fallback)',
			nowName: o.name,
			nowEmail: o.email,
			ownerId,
			ownerLabel,
		});
	});
	targets.sort((a, b) => Number(a.num) - Number(b.num));
	const fromFallback = targets.filter((t) => !primary.has(t.num)).length;
	console.log(`\nmål: ${targets.length} (källa ${primary.size} + plan-fallback ${fromFallback})`);

	// 4) Write plan.
	const esc = (x: string) => `"${(x ?? '').replace(/"/g, '""')}"`;
	const HEAD = [
		'Kundnr',
		'Återställ namn',
		'Återställ e-post',
		'Återställ ort',
		'Källa',
		'Rätt ägare (medlem)',
		'ExternalReference (ny)',
		'Nu namn',
		'Nu e-post',
	];
	const row = (t: Target) => [t.num, t.name, t.email, t.city, t.source, t.ownerLabel, t.ownerId, t.nowName, t.nowEmail];
	fs.writeFileSync(
		OUT_FILE,
		'\uFEFF' + [HEAD.join(','), ...targets.map((t) => row(t).map((x) => esc(String(x ?? ''))).join(','))].join('\r\n'),
		'utf8',
	);

	// Excel version.
	const xlsxFile = OUT_FILE.replace(/\.csv$/i, '.xlsx');
	const outWb = new ExcelJS.Workbook();
	const outWs = outWb.addWorksheet('Återställ');
	outWs.addRow(HEAD);
	targets.forEach((t) => outWs.addRow(row(t)));
	outWs.getRow(1).font = { bold: true };
	outWs.views = [{ state: 'frozen', ySplit: 1 }];
	HEAD.forEach((h, i) => {
		let w = h.length;
		for (const t of targets) w = Math.max(w, String(row(t)[i] ?? '').length);
		outWs.getColumn(i + 1).width = Math.min(46, Math.max(10, w + 2));
	});
	await outWb.xlsx.writeFile(xlsxFile);
	console.log(`  plan: ${path.resolve(OUT_FILE)}`);
	console.log(`  plan: ${path.resolve(xlsxFile)}`);

	if (!live) {
		console.log('\nDRY-RUN. Inga ändringar skrivna. Kör med --apply --yes-live för att verkställa.');
		return;
	}

	// 5) Apply (guarded).
	if (!hasFortnoxCredentials(REGION)) throw new Error(`Fortnox inte konfigurerat för ${REGION}`);
	console.log(`\nAPPLY: återställer ${targets.length} kunder (${REGION})…`);
	for (const t of targets) {
		const data: Partial<FortnoxCustomer> = { Name: t.name, Email: t.email };
		if (t.city) data.City = t.city;
		if (t.ownerId) data.ExternalReference = t.ownerId;
		await updateCustomer(REGION, t.num, data);
		console.log(`  ✓ #${t.num} → "${t.name}" <${t.email}>${data.City ? ` ${data.City}` : ''} ref=${data.ExternalReference ?? '(orörd)'} [${t.source}]`);
		await sleep(250);
	}
	console.log(`Klart: ${targets.length} kunder återställda.`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

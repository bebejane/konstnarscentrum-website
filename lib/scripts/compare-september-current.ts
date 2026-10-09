import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

/**
 * Full September(24) ↔ current-register comparison, keyed by customer number.
 *
 * Answers "should the restore be all of September?" — it shows EVERY current
 * customer with its September counterpart and an action, so the 32 that need
 * restoring stand out from the ~576 that are already identical.
 *
 * Read-only. Writes docs/fortnox-sept-vs-oct8.xlsx (+ .csv).
 *
 * Usage:
 *   npx tsx --tsconfig ./tsconfig.node.json lib/scripts/compare-september-current.ts \
 *     [--sept <xlsx>] [--register <csv>] [--out <xlsx>]
 */

type Row = Record<string, string>;
const argv = process.argv.slice(2);
const argOf = (name: string): string | undefined => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 ? argv[i + 1] : undefined;
};
const SEPT_FILE = argOf('sept') ?? 'docs/customer-export-2026-09-24.xlsx';
const SOURCE_FILE = argOf('source') ?? SEPT_FILE;
const REGISTER_FILE = argOf('register') ?? 'docs/kundregister 2026-10-08.csv';
const OUT_FILE = argOf('out') ?? 'docs/fortnox-sept-vs-oct8.xlsx';

const normEmail = (v?: string) => (v ?? '').trim().toLowerCase();
const normName = (v?: string) => (v ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
const clean = (v?: string) => (v ?? '').replace(/\s+/g, ' ').trim();

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

function addSheet(wb: ExcelJS.Workbook, name: string, header: string[], data: string[][]) {
	const ws = wb.addWorksheet(name);
	ws.addRow(header);
	data.forEach((r) => ws.addRow(r));
	ws.getRow(1).font = { bold: true };
	ws.views = [{ state: 'frozen', ySplit: 1 }];
	ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };
	header.forEach((h, i) => {
		let w = String(h).length;
		for (const r of data) w = Math.max(w, String(r[i] ?? '').length);
		ws.getColumn(i + 1).width = Math.min(46, Math.max(10, w + 2));
	});
	return ws;
}

async function main() {
	// Source snapshot. Two formats are supported: a headed export
	// (CustomerNumber/Name/Email/…) and the header-less positional format
	// (Name, CustomerNumber, Email, …, City).
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(SOURCE_FILE);
	const ws = wb.worksheets[0];
	const hdrRaw = (ws.getRow(1).values as any[]).slice(1).map((h) => (h == null ? '' : String(h)));
	const hasHeader = hdrRaw.some((h) => ['CustomerNumber', 'Email', 'customer_number', 'email'].includes(h));
	const sept = new Map<string, Row>();
	if (hasHeader) {
		for (let i = 2; i <= ws.rowCount; i++) {
			const v = (ws.getRow(i).values as any[]).slice(1);
			if (!v.length || v[0] == null) continue;
			const o: Row = {};
			hdrRaw.forEach((h, j) => (o[h] = (v[j] ?? '').toString().trim()));
			if (o.CustomerNumber) sept.set(o.CustomerNumber.trim(), o);
		}
	} else {
		for (let i = 1; i <= ws.rowCount; i++) {
			const v = (ws.getRow(i).values as any[]).slice(1);
			if (!v.length || v[1] == null) continue;
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
	console.log(`source: ${path.basename(SOURCE_FILE)} (${sept.size} kunder, ${hasHeader ? 'headed' : 'positional'})`);

	// Current register.
	const oct = parseCsv(fs.readFileSync(REGISTER_FILE, 'utf8'));

	// Effective (post-restore) identity per customer number, so duplicate
	// detection reflects the state AFTER the restore (an overwritten victim
	// goes back to its September identity).
	const eff = new Map<string, { name: string; email: string }>();
	for (const o of oct) {
		const num = o.customer_number.trim();
		const s = sept.get(num);
		const restore = !!s && normEmail(s.Email) !== normEmail(o.email);
		eff.set(num, restore ? { name: (s!.Name || '').trim(), email: normEmail(s!.Email) } : { name: o.name, email: normEmail(o.email) });
	}
	// Same normalised name → same person → duplicate (e-mail may differ when a
	// member changed address; municipal orgs have distinct names so are spared).
	const byName = new Map<string, string[]>();
	eff.forEach((v, num) => {
		const k = normName(v.name);
		if (!k) return;
		const list = byName.get(k) ?? [];
		list.push(num);
		byName.set(k, list);
	});
	const dupOf = new Map<string, string[]>();
	byName.forEach((nums) => {
		if (nums.length < 2) return;
		nums.forEach((n) => dupOf.set(n, nums.filter((x) => x !== n)));
	});

	const rows: string[][] = [];
	let unchanged = 0;
	let overwritten = 0;
	let newMembers = 0;
	let nameDiff = 0;
	let dupCount = 0;
	let legacyDup = 0;
	for (const o of oct) {
		const num = o.customer_number.trim();
		const s = sept.get(num);
		const others = dupOf.get(num) ?? [];
		let status: string;
		let action: string;
		if (!s) {
			if (others.length) {
				status = 'dubblett?';
				action = `Möjlig dubblett av #${others.join(', #')} – granska`;
			} else {
				status = 'ny medlem';
				action = 'Ny medlem – ingen åtgärd';
				newMembers++;
			}
		} else if (normEmail(s.Email) === normEmail(o.email)) {
			if (normName(s.Name) === normName(o.name)) {
				status = 'oförändrad';
				action = 'Ingen åtgärd';
				unchanged++;
			} else {
				status = 'namn avviker';
				action = `Granska: september "${clean(s.Name)}"`;
				nameDiff++;
			}
			if (others.length) legacyDup++;
		} else {
			status = 'ÖVERSKRIVEN';
			action = `Återställ till "${clean(s.Name)}" <${s.Email}>`;
			overwritten++;
		}
		if (others.length) dupCount++;
		rows.push([
			num,
			o.name,
			o.email,
			s?.Name ?? '',
			s?.Email ?? '',
			s?.City ?? '',
			status,
			action,
			others.length ? others.map((x) => '#' + x).join(', ') : '',
		]);
	}

	// September customers not present (by number) in the current register.
	const octNums = new Set(oct.map((o) => o.customer_number.trim()));
	const dropped: string[][] = [];
	sept.forEach((s, num) => {
		if (!octNums.has(num)) dropped.push([num, s.Name, s.Email, s.City, s.Phone, s.OrganisationNumber]);
	});

	const HEAD = [
		'Kundnr',
		'Oktober namn',
		'Oktober e-post',
		'September namn',
		'September e-post',
		'September ort',
		'Status',
		'Åtgärd',
		'Möjlig dubblett av',
	];
	const sorted = rows.slice().sort((a, b) => Number(a[0]) - Number(b[0]));

	const outWb = new ExcelJS.Workbook();
	addSheet(outWb, 'Sammanfattning', ['Post', 'Antal'], [
		['Kunder i september', String(sept.size)],
		['Kunder i oktober (nu)', String(oct.length)],
		['Oförändrade (september = nu)', String(unchanged)],
		['Överskrivna (behöver återställas)', String(overwritten)],
		['Namn avviker (samma e-post)', String(nameDiff)],
		['Nya medlemmar sedan september', String(newMembers)],
		['Möjliga dubbletter (granska)', String(dupCount)],
		['  varav nya (skapade i oktober)', String(dupCount - legacyDup)],
		['  varav legacy (fanns redan i september)', String(legacyDup)],
		['Borttagna (fanns i september, ej nu)', String(dropped.length)],
	]);
	addSheet(outWb, 'Alla kunder', HEAD, sorted);
	addSheet(outWb, 'Återställ (32)', HEAD, sorted.filter((r) => r[6] === 'ÖVERSKRIVEN'));
	addSheet(outWb, 'Dubbletter (granska)', HEAD, sorted.filter((r) => r[8] !== ''));
	addSheet(outWb, 'Nya medlemmar', HEAD, sorted.filter((r) => r[6] === 'ny medlem'));
	addSheet(outWb, 'Endast september', ['Kundnr', 'Namn', 'E-post', 'Ort', 'Telefon', 'Org.nr'], dropped.sort((a, b) => Number(a[0]) - Number(b[0])));
	await outWb.xlsx.writeFile(OUT_FILE);

	// CSV of the main sheet.
	const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
	fs.writeFileSync(
		OUT_FILE.replace(/\.xlsx$/i, '.csv'),
		'\uFEFF' + [HEAD.join(','), ...sorted.map((r) => r.map((x) => esc(String(x ?? ''))).join(','))].join('\r\n'),
		'utf8',
	);

	console.log(`september: ${sept.size} | oktober: ${oct.length}`);
	console.log(
		`  oförändrade: ${unchanged} | ÖVERSKRIVNA: ${overwritten} | namn avviker: ${nameDiff} | nya medlemmar: ${newMembers} | möjliga dubbletter: ${dupCount} (varav legacy ${legacyDup})`,
	);
	console.log(`  ${path.resolve(OUT_FILE)}`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

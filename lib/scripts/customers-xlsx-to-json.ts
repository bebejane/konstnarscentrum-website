import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

/**
 * Converts customers_old.xlsx (Fortnox customer export) into customers_old.json
 * using the same schema as customers_current.json:
 *
 *   @url, Address1, Address2, City, CustomerNumber, Email, Name,
 *   OrganisationNumber, Phone, ZipCode
 *
 * Column layout of the export (verified against header rows):
 *   1 Namn | 2 Kundnummer | 3 Epost | 4 Butiks-id | 5 Org-/Personnummer |
 *   6 Hemsida | 7 Namn | 8 Postadress | 9 Postnummer | 10 Postort | 11 Telefonnummer
 *
 * Usage: npx tsx lib/scripts/customers-xlsx-to-json.ts
 */

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'customers_old.xlsx');
const OUT = path.join(ROOT, 'customers_old.json');

const clean = (v: unknown): string => {
	if (v == null) return '';
	if (typeof v === 'object' && (v as any).text !== undefined) v = (v as any).text;
	return String(v).trim();
};

/**
 * Org- / Personnummer normalization to match customers_current.json:
 * - 4-digit birth years kept as-is ("1975")
 * - 10-digit organisationsnummer formatted "XXXXXX-XXXX" (2120001124 → "212000-1124")
 * - already-hyphenated kept; notes / delete-markers ("MAKULERA ...") → ""
 */
const fmtOrg = (v: unknown): string => {
	if (v == null) return '';
	if (typeof v === 'number') {
		const s = String(v);
		if (s.length === 10) return `${s.slice(0, 6)}-${s.slice(6)}`;
		return s;
	}
	const s = String(v).trim();
	const hyphenated = s.match(/^\d{6}-\d{4}/);
	if (hyphenated) return hyphenated[0];
	if (/^\d{10}$/.test(s)) return `${s.slice(0, 6)}-${s.slice(6)}`;
	return '';
};

const main = async (): Promise<void> => {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(SRC);
	const ws = workbook.worksheets[0];

	// Locate a header row if present (col 2 equals "Kundnummer"); else assume data starts at 1.
	let headerIdx = 0;
	ws.eachRow({ includeEmpty: false }, (row, idx) => {
		const c2 = row.values[2];
		if (typeof c2 === 'string' && c2.toLowerCase() === 'kundnummer') headerIdx = idx;
	});

	const rows: Record<string, string>[] = [];
	const flagged: { idx: number; note: string }[] = [];

	ws.eachRow({ includeEmpty: false }, (row, idx) => {
		if (headerIdx && idx === headerIdx) return;
		const r = row.values;
		const num = r[2];
		if (num == null || (typeof num === 'string' && !/^\d+$/.test(num.trim()))) {
			flagged.push({ idx, note: 'non-numeric kundnummer' });
			return;
		}
		const orgRaw = r[5];
		const orgStr = typeof orgRaw === 'object' && (orgRaw as any).text !== undefined ? (orgRaw as any).text : String(orgRaw ?? '');
		if (/MAKULERA OCH RADERA/.test(orgStr)) flagged.push({ idx, note: orgStr });

		rows.push({
			'@url': `https://api.fortnox.se/3/customers/${num}`,
			Address1: clean(r[8]),
			Address2: '',
			City: clean(r[10]),
			CustomerNumber: String(num).trim(),
			Email: clean(r[3]),
			Name: clean(r[1]),
			OrganisationNumber: fmtOrg(orgRaw),
			Phone: clean(r[11]),
			ZipCode: clean(r[9]),
		});
	});

	rows.sort((a, b) => parseInt(a.CustomerNumber, 10) - parseInt(b.CustomerNumber, 10));
	fs.writeFileSync(OUT, `${JSON.stringify(rows, null, 2)}\n`);

	console.log(`Exported ${rows.length} customers → ${path.relative(ROOT, OUT)}`);
	if (headerIdx) console.log(`Skipped header row ${headerIdx}`);
	if (flagged.length) console.log('Flagged:', JSON.stringify(flagged));
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
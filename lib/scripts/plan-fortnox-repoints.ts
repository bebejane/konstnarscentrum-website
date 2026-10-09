import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { buildClient } from '@datocms/cma-client';
import { sanitizeText } from '../fortnox/sync';

/**
 * Plan member `fortnox_customer_number` repoints.
 *
 * Problem: a member often points at the *duplicate* (empty) customer, while
 * their real invoice history sits on another customer number (in their name).
 * This reads the current register + the invoice export + the member register,
 * finds those cases, and proposes the repoint.
 *
 * Read-only. Writes docs/fortnox-repoints.{csv,xlsx}.
 *
 * Usage:
 *   npx tsx --tsconfig ./tsconfig.node.json lib/scripts/plan-fortnox-repoints.ts \
 *     [--invoices <xls>] [--register <csv>] [--restore-plan <csv>] [--out <csv>]
 */

type Row = Record<string, string>;
const argv = process.argv.slice(2);
const argOf = (n: string) => (argv.indexOf(`--${n}`) >= 0 ? argv[argv.indexOf(`--${n}`) + 1] : undefined);

const REGISTER_FILE = argOf('register') ?? 'docs/kundregister 2026-10-08.csv';
const INVOICE_FILE = argOf('invoices') ?? 'docs/Report_20261009_1020.xls';
const RESTORE_PLAN = argOf('restore-plan') ?? 'docs/fortnox-restore-plan.csv';
const OUT_FILE = argOf('out') ?? 'docs/fortnox-repoints.csv';

const ne = (v?: string) => (v ?? '').trim().toLowerCase();
const nn = (v?: string) => (sanitizeText(v ?? '') ?? '').trim().toLowerCase();
const clean = (v?: string) => (sanitizeText(v ?? '') ?? '').trim();

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

const client = buildClient({
	apiToken: (process.env.GRAPHQL_API_TOKEN_FULL ?? process.env.DATOCMS_API_TOKEN) as string,
	environment: process.env.DATOCMS_ENVIRONMENT ?? 'main',
});

type Member = { id: string; email?: string; first_name?: string; last_name?: string; fortnox_customer_number?: string };
const fullName = (m: Member) => [m.first_name, m.last_name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

async function main() {
	// Invoices: count + names per customer number.
	const raw = fs.readFileSync(INVOICE_FILE, 'latin1').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	const inv = new Map<string, { c: number; names: string[] }>();
	for (const l of raw.split('\n')) {
		const f = l.split('\t').map((x) => x.trim());
		if (f.length < 9 || !/^\d+$/.test(f[0]) || !/^\d+$/.test(f[1])) continue;
		const e = inv.get(f[1]) ?? { c: 0, names: [] };
		e.c++;
		e.names.push(f[2]);
		inv.set(f[1], e);
	}
	const invCount = (n: string) => inv.get(n)?.c ?? 0;

	// Current register (+ effective identity for overwritten rows).
	const reg = new Map(parseCsv(fs.readFileSync(REGISTER_FILE, 'utf8')).map((r) => [r.customer_number.trim(), r]));
	const eff = new Map<string, { name: string; email: string }>();
	reg.forEach((r, num) => eff.set(num, { name: r.name, email: ne(r.email) }));
	if (fs.existsSync(RESTORE_PLAN))
		for (const r of parseCsv(fs.readFileSync(RESTORE_PLAN, 'utf8')))
			if (r.Typ === 'Återställ' && r.Kundnr) eff.set(r.Kundnr.trim(), { name: r['Återställ namn'], email: ne(r['Återställ e-post']) });

	const members: Member[] = [];
	for await (const rec of client.items.listPagedIterator({ filter: { type: 'member' } })) members.push(rec as unknown as Member);
	const byEmail = new Map<string, Member>();
	const byName = new Map<string, Member>();
	for (const m of members) {
		const e = ne(m.email);
		const n = nn(fullName(m));
		if (e && !byEmail.has(e)) byEmail.set(e, m);
		if (n && !byName.has(n)) byName.set(n, m);
	}

	// Group customers by effective name.
	const groups = new Map<string, string[]>();
	eff.forEach((v, num) => {
		const k = nn(v.name);
		if (!k) return;
		const list = groups.get(k) ?? [];
		list.push(num);
		groups.set(k, list);
	});

	type Repoint = { member: Member; from: string; to: string; fromInv: number; toInv: number; kind: 'repoint' | 'review' };
	const repoints: Repoint[] = [];
	const seen = new Set<string>();
	groups.forEach((nums, key) => {
		if (nums.length < 2) return;
		// member for this person
		let m: Member | undefined;
		for (const n of nums) {
			const e = eff.get(n)!.email;
			m = byEmail.get(e) || byName.get(key) || m;
			if (m) break;
		}
		if (!m || !m.id || seen.has(m.id)) return;
		const from = (m.fortnox_customer_number ?? '').trim();
		if (!from) return;
		const memName = nn(fullName(m));
		// the number that carries invoices in the member's own name
		const mine = nums.find((n) => {
			const e = inv.get(n);
			return e && e.c > 0 && e.names.some((x) => nn(x) === memName);
		});
		const fromInv = invCount(from);
		if (mine && mine !== from && fromInv === 0) {
			seen.add(m.id);
			repoints.push({ member: m, from, to: mine, fromInv, toInv: invCount(mine), kind: 'repoint' });
		}
	});

	repoints.sort((a, b) => Number(a.from) - Number(b.from));
	const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
	const HEAD = ['Medlem', 'Medlems-id', 'E-post', 'Nu kundnr', 'Fakturor (nu)', 'Föreslagen kundnr', 'Fakturor (mål)', 'Åtgärd'];
	const data = repoints.map((r) => [
		fullName(r.member),
		r.member.id,
		r.member.email ?? '',
		r.from,
		String(r.fromInv),
		r.to,
		String(r.toInv),
		`Byt fortnox_customer_number ${r.from} → ${r.to}`,
	]);
	fs.writeFileSync(OUT_FILE, '\uFEFF' + [HEAD.join(','), ...data.map((r) => r.map(esc).join(','))].join('\r\n'), 'utf8');

	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet('Repoints');
	ws.addRow(HEAD);
	data.forEach((r) => ws.addRow(r));
	ws.getRow(1).font = { bold: true };
	ws.views = [{ state: 'frozen', ySplit: 1 }];
	HEAD.forEach((h, i) => {
		let w = h.length;
		for (const r of data) w = Math.max(w, String(r[i] ?? '').length);
		ws.getColumn(i + 1).width = Math.min(44, Math.max(10, w + 2));
	});
	await wb.xlsx.writeFile(OUT_FILE.replace(/\.csv$/i, '.xlsx'));

	console.log(`REPOINTS: ${repoints.length} medlemmar pekar på tom dubblett med egna fakturor på annat nummer`);
	for (const r of repoints) console.log(`  ${fullName(r.member)} <${r.member.email}>  ${r.from}(0) → ${r.to}(${r.toInv})`);
	console.log(`  ${path.resolve(OUT_FILE)}`);
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});

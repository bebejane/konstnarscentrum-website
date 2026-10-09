import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { buildClient } from '@datocms/cma-client';
import { sanitizeText } from '../fortnox/sync';
import { hasFortnoxCredentials } from '../fortnox/auth';
import { updateCustomer, deleteCustomer, listCustomers } from '../fortnox/customers';
import type { FortnoxCustomer } from '../fortnox/customers';

/**
 * Build (or apply) a restore plan for Fortnox customer data that the
 * DatoCMS → Fortnox sync overwrote with the wrong person's info, plus
 * invoice-grounded verdicts for the customers left duplicated afterwards.
 *
 * Source of truth:
 *  - the Fortnox audit log (`--log`) for the app's writes (exact before/after)
 *  - the Offer/Order/Invoice List export (`--invoices`) for invoice history
 *
 * DRY-RUN BY DEFAULT — writes only the plan CSV. Fortnox is touched only when
 * both `--apply` and `--yes-live` are passed.
 *
 * Usage:
 *   npx tsx --tsconfig ./tsconfig.node.json lib/scripts/restore-fortnox-customers.ts \
 *     [--env main|dev] [--log <csv>] [--register <csv>] [--invoices <xls>] [--out <csv>] \
 *     [--apply --yes-live]
 */

type Row = Record<string, string>;

const argv = process.argv.slice(2);
const argOf = (name: string): string | undefined => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 ? argv[i + 1] : undefined;
};
const has = (name: string) => argv.includes(`--${name}`);

const ENVIRONMENT = argOf('env') ?? process.env.DATOCMS_ENVIRONMENT ?? 'main';
const LOG_FILE = argOf('log') ?? 'docs/fortnox-audit-log.csv';
const REGISTER_FILE = argOf('register') ?? 'docs/kundregister 2026-10-08.csv';
const OUT_FILE = argOf('out') ?? 'docs/fortnox-restore-plan.csv';
const DEFAULT_INVOICES = 'docs/Report_20261009_1020.xls';
const INVOICE_FILE =
	argOf('invoices') ?? (fs.existsSync(DEFAULT_INVOICES) ? DEFAULT_INVOICES : undefined);
const APPLY = has('apply');
const CONFIRM = has('yes-live');
const DEDUPE = has('dedupe'); // also delete duplicate customers + repoint members
const VERIFY = has('verify'); // re-check member links against Fortnox
const REGION = 'ost'; // the only Fortnox-enabled region

const client = buildClient({
	apiToken: (process.env.GRAPHQL_API_TOKEN_FULL ?? process.env.DATOCMS_API_TOKEN) as string,
	environment: ENVIRONMENT,
});

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

const normEmail = (v?: string) => (v ?? '').trim().toLowerCase();
const normName = (v?: string) => (sanitizeText(v ?? '') ?? '').toLowerCase();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Add a sheet with a bold, frozen header row and auto-ish column widths. */
function addSheet(wb: ExcelJS.Workbook, name: string, header: string[], data: string[][]) {
	const ws = wb.addWorksheet(name);
	ws.addRow(header);
	data.forEach((r) => ws.addRow(r));
	ws.getRow(1).font = { bold: true };
	ws.views = [{ state: 'frozen', ySplit: 1 }];
	header.forEach((h, i) => {
		let w = String(h).length;
		for (const r of data) w = Math.max(w, String(r[i] ?? '').length);
		ws.getColumn(i + 1).width = Math.min(46, Math.max(10, w + 2));
	});
	return ws;
}

type Member = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	city?: string;
	fortnox_customer_number?: string;
};
const fullName = (m: Member) => sanitizeText([m.first_name, m.last_name].filter(Boolean).join(' ')) ?? '';

/** Parse the Fortnox Offer/Order/Invoice List (latin-1, tab separated). */
type InvoiceInfo = { count: number; amount: number; names: string[] };
function parseInvoices(file: string): Map<string, InvoiceInfo> {
	const txt = fs.readFileSync(file, 'latin1').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	const byNo = new Map<string, InvoiceInfo>();
	for (const line of txt.split('\n')) {
		const f = line.split('\t').map((x) => x.trim());
		if (f.length < 9 || !/^\d+$/.test(f[0]) || !/^\d+$/.test(f[1])) continue;
		const cn = f[1];
		const amount = Number(f[8].replace(/ /g, '').replace(',', '.')) || 0;
		const e = byNo.get(cn) ?? { count: 0, amount: 0, names: [] };
		e.count++;
		e.amount += amount;
		e.names.push(f[2]);
		byNo.set(cn, e);
	}
	return byNo;
}

/** Parse an audit Action's change lines into `field -> { from?, to }`. */
function parseChangeLines(action: string): Record<string, { from?: string; to?: string }> {
	const out: Record<string, { from?: string; to?: string }> = {};
	for (const raw of action.split(/\r?\n/)) {
		const line = raw.trim();
		let m = line.match(/^(.*?) was changed from "(.*?)" to "(.*?)"\.?$/);
		if (m) {
			out[m[1]] = { from: m[2], to: m[3] };
			continue;
		}
		m = line.match(/^(.*?) was set to "(.*?)"\.?$/);
		if (m) {
			out[m[1]] = { from: undefined, to: m[2] };
			continue;
		}
		m = line.match(/^(.*?) was deleted\.?$/);
		if (m) out[m[1]] = { from: undefined, to: '(deleted)' };
	}
	return out;
}

type Logged = {
	name?: string;
	email?: string;
	city?: string;
	cityAction?: 'changed' | 'deleted';
	date?: string;
};

/**
 * Re-check every member's `fortnox_customer_number` against the live Fortnox
 * register: does the number exist, and does that customer's e-mail match the
 * member's? Read-only.
 */
async function verifyMemberLinks(members: Member[]): Promise<void> {
	if (!hasFortnoxCredentials(REGION)) {
		console.log(`VERIFY: hoppar över — Fortnox inte konfigurerat för ${REGION}`);
		return;
	}
	console.log(`\nVERIFY: kontrollerar medlemmarnas fortnox_customer_number mot Fortnox (${REGION})…`);
	const customers = await listCustomers(REGION);
	const byNo = new Map(customers.map((c) => [String(c.CustomerNumber).trim(), c]));

	const problems: Array<{ typ: string; member: Member; num: string; cust?: FortnoxCustomer }> = [];
	let withNo = 0;
	let ok = 0;
	for (const m of members) {
		const num = (m.fortnox_customer_number ?? '').trim();
		if (!num) continue;
		withNo++;
		const c = byNo.get(num);
		if (!c) problems.push({ typ: 'saknas i Fortnox', member: m, num });
		else if (normEmail(c.Email) !== normEmail(m.email))
			problems.push({ typ: 'fel kund', member: m, num, cust: c });
		else ok++;
	}

	console.log(`  med nummer: ${withNo} | korrekta: ${ok} | avvikelser: ${problems.length}`);
	for (const p of problems)
		console.log(
			`  ${p.typ}: ${fullName(p.member)} <${p.member.email ?? ''}> → #${p.num}` +
				(p.cust ? ` "${p.cust.Name ?? ''}" <${p.cust.Email ?? ''}>` : ''),
		);

	const esc = (x: string) => `"${(x ?? '').replace(/"/g, '""')}"`;
	fs.writeFileSync(
		path.join(path.dirname(OUT_FILE), 'fortnox-member-link-check.csv'),
		'\uFEFF' +
			[
				['Typ', 'Medlem', 'Medlems e-post', 'fortnox_customer_number', 'Kundens namn', 'Kundens e-post'].join(','),
				...problems.map((p) =>
					[
						p.typ,
						fullName(p.member),
						p.member.email ?? '',
						p.num,
						p.cust?.Name ?? '',
						p.cust?.Email ?? '',
					]
						.map((x) => esc(String(x ?? '')))
						.join(','),
				),
			].join('\r\n'),
		'utf8',
	);
	console.log(`  Rapport: ${path.resolve(path.join(path.dirname(OUT_FILE), 'fortnox-member-link-check.csv'))}`);
}

type RestoreRow = {
	customerNumber: string;
	restoreName: string;
	restoreEmail: string;
	restoreCity: string;
	citySource: string;
	owner: Member | undefined;
	ownerIsMember: boolean;
	memberCurrent: string;
	currentName: string;
	currentEmail: string;
	needsRestore: boolean;
	unresolved: string[];
	invoices: number;
	refTarget: string;
	ownerSource: string;
	logged: string;
};

type DupRow = {
	numbers: string[];
	email: string;
	names: string;
	invoices: string;
	verdict: string;
	samePerson: boolean;
	keep: string[];
	remove: string[];
};

async function main() {
	const live = APPLY && CONFIRM;
	console.log(`${live ? 'LIVE APPLY' : 'DRY-RUN'} env=${ENVIRONMENT}`);
	console.log(`log=${LOG_FILE}\nregister=${REGISTER_FILE}`);
	console.log(`invoices=${INVOICE_FILE ?? '(ingen – dubblettbedömning utan fakturor)'}`);

	// 1) Audit log → merge app writes per customer number (keep earliest "from").
	const log = parseCsv(fs.readFileSync(LOG_FILE, 'utf8'));
	const byCustomer = new Map<string, Logged>();
	for (const r of log) {
		if (!(r.User ?? '').startsWith('Björn Berglund') || r.Rubrik !== 'Saved customer') continue;
		const m = r.Action.match(/^Customer (\d+) saved/);
		if (!m) continue;
		const ch = parseChangeLines(r.Action);
		const e = byCustomer.get(m[1]) ?? {};
		if (e.name === undefined && ch['Name']?.from !== undefined) e.name = ch['Name'].from;
		if (e.email === undefined && ch['E-mail']?.from !== undefined) e.email = ch['E-mail'].from;
		if (ch['Town/city']) {
			if (ch['Town/city'].from !== undefined) {
				if (e.city === undefined) e.city = ch['Town/city'].from;
				e.cityAction = 'changed';
			} else if (ch['Town/city'].to === '(deleted)' && e.cityAction !== 'changed') {
				e.cityAction = 'deleted';
			}
		}
		if (!e.date) e.date = r.Datum;
		byCustomer.set(m[1], e);
	}

	// 2) Current register, invoices, members.
	const register = new Map(parseCsv(fs.readFileSync(REGISTER_FILE, 'utf8')).map((r) => [r.customer_number.trim(), r]));
	const invoices = INVOICE_FILE ? parseInvoices(INVOICE_FILE) : new Map<string, InvoiceInfo>();
	const invCount = (cn: string) => invoices.get(cn)?.count ?? 0;

	const membersByEmail = new Map<string, Member[]>();
	const membersByName = new Map<string, Member[]>();
	const membersByNumber = new Map<string, Member[]>();
	const allMembers: Member[] = [];
	for await (const rec of client.items.listPagedIterator({ filter: { type: 'member' } })) {
		const mem = rec as unknown as Member;
		const e = normEmail(mem.email);
		const n = normName(fullName(mem));
		const num = (mem.fortnox_customer_number ?? '').trim();
		allMembers.push(mem);
		const add = (map: Map<string, Member[]>, key: string) => {
			if (!key) return;
			const list = map.get(key) ?? [];
			list.push(mem);
			map.set(key, list);
		};
		add(membersByEmail, e);
		add(membersByName, n);
		add(membersByNumber, num);
	}
	console.log(`members indexed: ${membersByEmail.size}`);

	// 3) Restore rows.
	const rows: RestoreRow[] = [];
	byCustomer.forEach((v, cn) => {
		if (!v.name && !v.email) return; // address-only save; can't attribute
		const cur = register.get(cn);
		// Resolve the rightful owner. E-mail is unique in the register; a name
		// match is trusted ONLY when exactly one member has it, so an ambiguous
		// name can never write a wrong ExternalReference.
		let owner: Member | undefined;
		let ownerSource = '';
		const byEmail = v.email ? membersByEmail.get(normEmail(v.email)) ?? [] : [];
		const byName = v.name ? membersByName.get(normName(v.name)) ?? [] : [];
		if (byEmail.length === 1) {
			owner = byEmail[0];
			ownerSource = 'e-post';
		} else if (byEmail.length > 1) {
			ownerSource = 'e-post tvetydig';
		} else if (byName.length === 1) {
			owner = byName[0];
			ownerSource = 'namn (unikt)';
		} else if (byName.length > 1) {
			ownerSource = 'namn tvetydigt';
		}

		const ownerName = owner ? fullName(owner) : '';
		const restoreName = v.name ?? ownerName;
		const restoreEmail = v.email ?? owner?.email ?? '';

		let city = '';
		let citySource = 'ej ändrad';
		const unresolved: string[] = [];
		if (!owner && ownerSource.includes('tvetydig')) unresolved.push('ägare tvetydig');
		if (v.cityAction === 'changed') {
			city = v.city ?? '';
			citySource = 'logg';
		} else if (v.cityAction === 'deleted') {
			if (owner?.city) {
				city = sanitizeText(owner.city) ?? '';
				citySource = 'medlem';
			} else {
				citySource = 'okänd';
				unresolved.push('ort');
			}
		}
		if (!v.name) unresolved.push('namn');
		if (!v.email && !owner?.email) unresolved.push('e-post');

		const needsRestore =
			!!cur &&
			((!!restoreName && cur.name !== restoreName) || (!!restoreEmail && normEmail(cur.email) !== normEmail(restoreEmail)));

		rows.push({
			customerNumber: cn,
			restoreName,
			restoreEmail,
			restoreCity: city,
			citySource,
			owner,
			ownerIsMember: !!owner,
			memberCurrent: owner ? `${ownerName} <${owner.email ?? ''}> ${owner.city ?? ''}`.trim() : '',
			currentName: cur?.name ?? '',
			currentEmail: cur?.email ?? '',
			needsRestore,
			unresolved,
			invoices: invCount(cn),
			refTarget: owner ? owner.id : '',
			ownerSource,
			logged: v.date ?? '',
		});
	});
	rows.sort((a, b) => Number(a.customerNumber) - Number(b.customerNumber));

	// 4) Simulate the restore, then find customers that are the same person on
	//    several numbers. Group by the *effective* name (post-restore) so an
	//    overwritten victim returns to its September identity and a member who
	//    changed e-mail is still one person.
	const simName = new Map<string, string>();
	const simEmail = new Map<string, string>();
	register.forEach((r, cn) => {
		simName.set(cn, r.name);
		simEmail.set(cn, normEmail(r.email));
	});
	for (const r of rows) {
		simName.set(r.customerNumber, r.restoreName);
		if (r.restoreEmail) simEmail.set(r.customerNumber, normEmail(r.restoreEmail));
	}
	const byName = new Map<string, string[]>();
	simName.forEach((name, cn) => {
		const k = normName(name);
		if (!k) return;
		const list = byName.get(k) ?? [];
		list.push(cn);
		byName.set(k, list);
	});

	type Repoint = { member: Member; from: string; to: string; fromInv: number; toInv: number };
	const repoints: Repoint[] = [];
	const repointedIds = new Set<string>();
	const dupRows: DupRow[] = [];

	byName.forEach((cns, key) => {
		if (cns.length < 2) return;
		const numbers = cns.slice().sort((a, b) => Number(a) - Number(b));
		const invBy = numbers.map((cn) => `#${cn}=${invCount(cn)}`).join(' | ');
		const namesLabel = numbers.map((cn) => `#${cn} ${simName.get(cn)}`).join(' | ');
		// The member for this person: by effective e-mail first, else by name.
		let member: Member | undefined;
		for (const cn of numbers) {
			const e = simEmail.get(cn) ?? '';
			const hit = (e && membersByEmail.get(e)?.[0]) || membersByName.get(normName(simName.get(cn) ?? ''))?.[0];
			if (hit) {
				member = hit;
				break;
			}
		}
		if (!member) {
			dupRows.push({
				numbers,
				email: '',
				names: namesLabel,
				invoices: invBy,
				verdict: 'Lämna/granska (org eller delad e-post – ingen medlem)',
				samePerson: true,
				keep: [],
				remove: [],
			});
			return;
		}
		const memName = normName(fullName(member));
		const from = (member.fortnox_customer_number ?? '').trim();
		const fromInv = invCount(from);
		// The number that carries invoices in the member's OWN name.
		const mine = numbers.find((cn) => {
			const inf = invoices.get(cn);
			return inf && inf.count > 0 && inf.names.some((x) => normName(x) === memName);
		});
		const keep = mine ?? (numbers.includes(from) ? from : numbers.filter((cn) => invCount(cn) > 0)[0] ?? from);

		let verdict: string;
		let remove: string[] = [];
		if (mine && mine !== from && fromInv === 0 && !repointedIds.has(member.id)) {
			repoints.push({ member, from, to: mine, fromInv, toInv: invCount(mine) });
			repointedIds.add(member.id);
			remove = numbers.filter((cn) => cn !== keep && invCount(cn) === 0);
			verdict = `Repointa ${fullName(member)}: #${from}(0) → #${keep}(${invCount(keep)})${
				remove.length ? `; ta bort ${remove.map((n) => '#' + n).join(', ')}` : ''
			}`;
		} else if (fromInv > 0) {
			verdict = `OK – ${fullName(member)} pekar på #${from} (${fromInv} fakturor)`;
		} else {
			verdict = `Granska manuellt – ${fullName(member)} pekar på #${from}(0); fakturor: ${invBy}`;
		}
		dupRows.push({
			numbers,
			email: member.email ?? '',
			names: namesLabel,
			invoices: invBy,
			verdict,
			samePerson: true,
			keep: keep ? [keep] : [],
			remove,
		});
	});
	dupRows.sort((a, b) => Number(a.numbers[0]) - Number(b.numbers[0]));

	// 5) Write plan CSV (restore rows + duplicate verdicts, unified via `Typ`).
	const esc = (x: string) => `"${(x ?? '').replace(/"/g, '""')}"`;
	const header = [
		'Typ',
		'Kundnr',
		'Återställ namn',
		'Återställ e-post',
		'Återställ ort',
		'Ort-källa',
		'Rätt ägare (medlem)',
		'Ägare är medlem',
		'Medlemmens nuvarande (DatoCMS)',
		'Nu namn',
		'Nu e-post',
		'Fakturor',
		'ExternalReference (ny)',
		'Ägarkälla',
		'Åtgärd',
		'Loggat',
	];
	const restoreLines = rows.map((r) =>
		[
			'Återställ',
			r.customerNumber,
			r.restoreName,
			r.restoreEmail,
			r.restoreCity,
			r.citySource,
			r.owner ? `${fullName(r.owner)} [${r.owner.id}]` : '(ej medlem)',
			r.ownerIsMember ? 'ja' : 'nej',
			r.memberCurrent,
			r.currentName,
			r.currentEmail,
			String(r.invoices),
			r.refTarget,
			r.ownerSource,
			r.citySource === 'logg' || r.citySource === 'medlem' ? 'Skriv namn, e-post och ort' : 'Skriv namn och e-post',
			r.logged,
		]
			.map((x) => esc(String(x ?? '')))
			.join(','),
	);
	const dupLines = dupRows.map((d) =>
		[
			'Dubblett',
			d.numbers.map((n) => '#' + n).join(' + '),
			'',
			d.email,
			'',
			'',
			'',
			'',
			'',
			d.names,
			'',
			d.invoices,
			'',
			'',
			d.verdict,
			'',
		]
			.map((x) => esc(String(x ?? '')))
			.join(','),
	);
	const membLines = repoints.map((rp) =>
		[
			'Medlemsfält',
			`${rp.from} → ${rp.to}`,
			'',
			'',
			'',
			'',
			`${fullName(rp.member)} [${rp.member.id}]`,
			'ja',
			`${fullName(rp.member)} <${rp.member.email ?? ''}>`,
			`#${rp.from} (dubblett)`,
			'',
			`#${rp.from}=${invCount(rp.from)} | #${rp.to}=${invCount(rp.to)}`,
			'',
			'',
			`Byt fortnox_customer_number ${rp.from} → ${rp.to}`,
			'',
		]
			.map((x) => esc(String(x ?? '')))
			.join(','),
	);
	fs.writeFileSync(
		OUT_FILE,
		'\uFEFF' + [header.join(','), ...restoreLines, ...dupLines, ...membLines].join('\r\n'),
		'utf8',
	);

	// Excel version — one sheet per `Typ`.
	const wb = new ExcelJS.Workbook();
	addSheet(
		wb,
		'Återställ',
		header,
		rows.map((r) => [
			'Återställ',
			r.customerNumber,
			r.restoreName,
			r.restoreEmail,
			r.restoreCity,
			r.citySource,
			r.owner ? `${fullName(r.owner)} [${r.owner.id}]` : '(ej medlem)',
			r.ownerIsMember ? 'ja' : 'nej',
			r.memberCurrent,
			r.currentName,
			r.currentEmail,
			String(r.invoices),
			r.refTarget,
			r.ownerSource,
			r.citySource === 'logg' || r.citySource === 'medlem' ? 'Skriv namn, e-post och ort' : 'Skriv namn och e-post',
			r.logged,
		]),
	);
	addSheet(
		wb,
		'Dubbletter',
		['Kundnummer', 'E-post', 'Namn per kund', 'Fakturor', 'Bedömning'],
		dupRows.map((d) => [d.numbers.map((n) => '#' + n).join(' + '), d.email, d.names, d.invoices, d.verdict]),
	);
	addSheet(
		wb,
		'Medlemsfält',
		['Medlem', 'Från', 'Till', 'Medlems e-post', 'Fakturor', 'Åtgärd'],
		repoints.map((rp) => [
			`${fullName(rp.member)} [${rp.member.id}]`,
			rp.from,
			rp.to,
			rp.member.email ?? '',
			`#${rp.from}=${invCount(rp.from)} | #${rp.to}=${invCount(rp.to)}`,
			`Byt fortnox_customer_number ${rp.from} → ${rp.to}`,
		]),
	);
	const xlsxFile = OUT_FILE.replace(/\.csv$/i, '.xlsx');
	await wb.xlsx.writeFile(xlsxFile);

	const needs = rows.filter((r) => r.needsRestore);
	console.log(`\nRestore: ${needs.length}/${rows.length} kunder`);
	console.log(`Dubbletter efter återställning: ${dupRows.length}`);
	for (const d of dupRows) console.log(`  ${d.numbers.map((n) => '#' + n).join(', ')} ${d.email} → ${d.verdict}`);
	console.log(`Medlemsfält (repoint): ${repoints.length}`);
	for (const rp of repoints) console.log(`  ${fullName(rp.member)}: ${rp.from} → ${rp.to}`);
	console.log(`  ${path.resolve(OUT_FILE)}`);
	console.log(`  ${path.resolve(xlsxFile)}`);

	// 6) Apply only when forced.
	if (!live) {
		if (VERIFY) await verifyMemberLinks(allMembers);
		console.log('\nDRY-RUN. Inga ändringar skrivna. Kör med --apply --yes-live för att verkställa.');
		return;
	}
	if (!hasFortnoxCredentials(REGION)) throw new Error(`Fortnox inte konfigurerat för ${REGION}`);
	const targets = needs.filter((r) => r.restoreName && r.restoreEmail);
	console.log(`\nAPPLY: uppdaterar ${targets.length} kunder i Fortnox (${REGION})…`);
	for (const r of targets) {
		const data: Partial<FortnoxCustomer> = { Name: r.restoreName, Email: r.restoreEmail };
		if (r.citySource === 'logg' || r.citySource === 'medlem') data.City = r.restoreCity;
		// Repair the ownership key: the overwrite left the wrong member id here,
		// which would make the sync's guard skip the rightful owner forever.
		if (r.refTarget) data.ExternalReference = r.refTarget;
		await updateCustomer(REGION, r.customerNumber, data);
		console.log(
			`  ✓ #${r.customerNumber} → "${r.restoreName}" <${r.restoreEmail}>${data.City !== undefined ? ` ${data.City}` : ''} ref=${
				data.ExternalReference ?? '(orörd)'
			}`,
		);
		await sleep(250); // be gentle with Fortnox rate limits
	}

	if (DEDUPE) {
		// Repoint first (so no member is left pointing at a number we delete),
		// then delete. Deletion is irreversible.
		console.log(`\nDEDUPE: pekar om ${repoints.length} medlemmar, tar bort dubblettkunder…`);
		for (const rp of repoints) {
			await client.items.update(rp.member.id, { fortnox_customer_number: rp.to } as any);
			rp.member.fortnox_customer_number = rp.to;
			// Only the ownership key — never Name/E-mail (keep Fortnox data as-is
			// for manual review).
			await updateCustomer(REGION, rp.to, { ExternalReference: rp.member.id } as Partial<FortnoxCustomer>);
			console.log(`  ↪ ${fullName(rp.member)}: fortnox_customer_number ${rp.from} → ${rp.to} (ref #${rp.to})`);
			await sleep(250);
		}
		for (const d of dupRows) {
			for (const del of d.remove) {
				await deleteCustomer(REGION, del);
				console.log(`  ✗ #${del} borttagen (behåll ${d.keep.map((n) => '#' + n).join(', ')})`);
				await sleep(250);
			}
		}
	} else if (dupRows.some((d) => d.remove.length)) {
		console.log('\n(Dedupe ej aktiverat — kör med --dedupe för att även ta bort dubbletter och peka om medlemmar.)');
	}
	console.log(`Klart: ${targets.length} kunder återställda${DEDUPE ? `, ${repoints.length} medlemmar ompekade` : ''}.`);

	// 7) Post-apply verification (reads Fortnox back and compares member links).
	await verifyMemberLinks(allMembers);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

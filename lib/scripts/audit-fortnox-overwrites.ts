import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { buildClient } from '@datocms/cma-client';
import { sanitizeText } from '../fortnox/sync';

/**
 * One-off audit: find Fortnox customers whose data looks like it was overwritten
 * with the *wrong* member's info during the DatoCMS → Fortnox sync.
 *
 * Customer numbers were reassigned during the migration, so the two snapshots
 * are matched by identity (email / name), never by customer_number.
 *
 * Usage:
 *   npx tsx --tsconfig ./tsconfig.node.json lib/scripts/audit-fortnox-overwrites.ts \
 *     [--env dev|main] [--old <file>] [--new <file>] [--out <file>]
 *
 * Read-only on both DatoCMS and Fortnox. Writes CSV report(s) only.
 */

type Row = Record<string, string>;

const args = process.argv.slice(2);
const argOf = (name: string): string | undefined => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
};

const ENVIRONMENT = argOf('env') ?? process.env.DATOCMS_ENVIRONMENT ?? 'dev';
const OLD_FILE = argOf('old') ?? 'docs/kundregister 2026-10-01.csv';
const NEW_FILE = argOf('new') ?? 'docs/kundregister 2026-10-08.csv';
const OUT_FILE = argOf('out') ?? 'docs/fortnox-overwrite-audit.csv';

const client = buildClient({
	apiToken: (process.env.GRAPHQL_API_TOKEN_FULL ?? process.env.DATOCMS_API_TOKEN) as string,
	environment: ENVIRONMENT,
});

function parseCsv(text: string): Row[] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;
	const src = text.replace(/^\uFEFF/, '');
	for (let i = 0; i < src.length; i++) {
		const c = src[i];
		if (inQuotes) {
			if (c === '"') {
				if (src[i + 1] === '"') {
					field += '"';
					i++;
				} else inQuotes = false;
			} else field += c;
		} else if (c === '"') inQuotes = true;
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
		const obj: Row = {};
		header.forEach((h, idx) => (obj[h] = (r[idx] ?? '').trim()));
		return obj;
	});
}

const normEmail = (v: string | undefined): string => (v ?? '').trim().toLowerCase();
const normName = (v: string | undefined): string => (sanitizeText(v ?? '') ?? '').toLowerCase();

/** ES5-safe Map→entries array (avoids downlevelIteration). */
function mapEntries<K, V>(m: Map<K, V>): Array<[K, V]> {
	const out: Array<[K, V]> = [];
	m.forEach((v, k) => out.push([k, v]));
	return out;
}

type Member = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	city?: string;
	region?: string;
	vilande?: boolean;
	fortnox_customer_number?: string;
};

const fullName = (m: Member): string =>
	sanitizeText([m.first_name, m.last_name].filter(Boolean).join(' ')) ?? '';

async function loadMembers(): Promise<Member[]> {
	const members: Member[] = [];
	for await (const rec of client.items.listPagedIterator({ filter: { type: 'member' } })) {
		members.push(rec as unknown as Member);
	}
	return members;
}

type Finding = {
	misstanke: 'HÖG' | 'MEDEL' | 'INFO';
	orsak: string;
	kundnummer: string;
	namn: string;
	epost: string;
	medlem_epost: string; // member(s) owning the customer email
	medlem_namn: string; // member(s) owning the customer name
	medlem_lankad: string; // member(s) whose fortnox_customer_number = this customer
	forändring: string;
	notering: string;
};

const memberLabel = (m: Member) => `${fullName(m)} <${m.email ?? ''}> [${m.id}]`;
const label = (ms: Member[] | undefined) => (ms ?? []).map(memberLabel).join(' | ');

async function main() {
	console.log(`DatoCMS environment: ${ENVIRONMENT}`);
	const oldRows = parseCsv(fs.readFileSync(OLD_FILE, 'utf8'));
	const newRows = parseCsv(fs.readFileSync(NEW_FILE, 'utf8'));
	console.log(`customers: old=${oldRows.length} new=${newRows.length}`);

	const members = await loadMembers();
	const membersByEmail = new Map<string, Member[]>();
	const membersByName = new Map<string, Member[]>();
	const membersByNumber = new Map<string, Member[]>();
	const push = (map: Map<string, Member[]>, key: string, v: Member) => {
		if (!key) return;
		map.set(key, [...(map.get(key) ?? []), v]);
	};
	for (const m of members) {
		push(membersByEmail, normEmail(m.email), m);
		push(membersByName, normName(fullName(m)), m);
		push(membersByNumber, (m.fortnox_customer_number ?? '').trim(), m);
	}
	console.log(`members: ${members.length}`);

	const overlap = (a: Member[], b: Member[]) => {
		const ids = new Set(a.map((m) => m.id));
		return b.some((m) => ids.has(m.id));
	};

	// Index old snapshot by email and name for identity-level comparison.
	const oldByEmail = new Map<string, Row>();
	const oldByName = new Map<string, Row>();
	for (const r of oldRows) {
		if (normEmail(r.email)) oldByEmail.set(normEmail(r.email), r);
		if (normName(r.name)) oldByName.set(normName(r.name), r);
	}

	const findings: Finding[] = [];
	const add = (f: Finding) => findings.push(f);

	// ---------------------------------------------------------------------
	// 1) Customer consistency on the CURRENT list (independent of backup):
	//    does the customer's (email, name) point to exactly one member?
	// ---------------------------------------------------------------------
	const byEmailInNew = new Map<string, Row[]>();
	for (const r of newRows) push(byEmailInNew as any, normEmail(r.email), r as any);

	for (const r of newRows) {
		const email = normEmail(r.email);
		const name = normName(r.name);
		const emailMembers = membersByEmail.get(email) ?? [];
		const nameMembers = membersByName.get(name) ?? [];
		const linkedByNo = membersByNumber.get(r.customer_number.trim()) ?? [];

		// Skip customers with no member involvement at all (organisations etc.)
		if (!emailMembers.length && !nameMembers.length && !linkedByNo.length) continue;

		const problems: string[] = [];
		let misstanke: Finding['misstanke'] = 'INFO';

		if (emailMembers.length > 1) {
			misstanke = 'HÖG';
			problems.push(`flera medlemmar delar e-post (${emailMembers.length})`);
		}

		if (emailMembers.length && nameMembers.length && !overlap(emailMembers, nameMembers)) {
			misstanke = 'HÖG';
			problems.push('e-post och namn tillhör OLIKA medlemmar');
		}

		if (emailMembers.length && !nameMembers.length && name) {
			misstanke = 'HÖG';
			problems.push('e-post tillhör medlem men namnet matchar ingen medlem');
		}

		if (nameMembers.length && !emailMembers.length && email) {
			misstanke = 'HÖG';
			problems.push('namn tillhör medlem men e-posten matchar ingen medlem');
		}

		if (linkedByNo.length && email && !linkedByNo.some((m) => normEmail(m.email) === email)) {
			misstanke = 'HÖG';
			problems.push(
				`medlem ${linkedByNo.map(memberLabel).join(' | ')} är länkad till detta kundnummer men e-posten stämmer inte`,
			);
		}

		if (!problems.length) continue;

		// Compare against the backup (by email then by name) for context.
		const o = oldByEmail.get(email) ?? oldByName.get(name);
		const changed: string[] = [];
		if (o) {
			if (o.name !== r.name) changed.push(`Namn: "${o.name}" → "${r.name}"`);
			if (o.email !== r.email) changed.push(`E-post: "${o.email}" → "${r.email}"`);
		}

		add({
			misstanke,
			orsak: problems.join('; '),
			kundnummer: r.customer_number,
			namn: r.name,
			epost: r.email,
			medlem_epost: label(emailMembers),
			medlem_namn: label(nameMembers),
			medlem_lankad: label(linkedByNo),
			forändring: o ? changed.join('; ') || '(oförändrat / ej matchad i backup)' : '(saknas i backup)',
			notering: r.type ? `typ=${r.type}` : '',
		});
	}

	// ---------------------------------------------------------------------
	// 2) Member-centric mislink report: member.fortnox_customer_number points
	//    at a customer that isn't theirs -> next edit overwrites the wrong one.
	// ---------------------------------------------------------------------
	const newByNo = new Map(newRows.map((r) => [r.customer_number.trim(), r]));
	const newByEmailFirst = new Map<string, Row>();
	for (const r of newRows) {
		const e = normEmail(r.email);
		if (e && !newByEmailFirst.has(e)) newByEmailFirst.set(e, r);
	}

	type Mislink = {
		kundnummer: string;
		kundnamn: string;
		kundepost: string;
		matchar: 'ja' | 'nej' | 'saknas';
		medlem: string;
		medlem_epost: string;
		medlems_namn: string[];
		data_tillhor: string[];
		korrekt_kundnr: string;
		korrekt_kundnamn: string;
		notering: string;
	};
	const mislinks: Mislink[] = [];
	for (const m of members) {
		const no = (m.fortnox_customer_number ?? '').trim();
		if (!no) continue;
		const cust = newByNo.get(no);
		const sameEmail = cust && normEmail(cust.email) === normEmail(m.email) && !!normEmail(m.email);
		const correct = newByEmailFirst.get(normEmail(m.email));
		const alsoOnCorrect = correct ? normName(correct.name) === normName(cust?.name ?? '') : false;
		if (sameEmail) continue;
		mislinks.push({
			kundnummer: no,
			kundnamn: cust?.name ?? '',
			kundepost: cust?.email ?? '',
			matchar: cust ? 'nej' : 'saknas',
			medlem: m.id,
			medlem_epost: m.email ?? '',
			medlems_namn: [fullName(m)],
			data_tillhor: (membersByEmail.get(normEmail(cust?.email)) ?? []).map(memberLabel),
			korrekt_kundnr: correct?.customer_number ?? '',
			korrekt_kundnamn: correct?.name ?? '',
			notering: [
				!cust ? 'kundnummer finns inte i listan' : '',
				correct ? 'medlemmens e-post finns på en annan kund' : 'medlemmens e-post finns inte i listan',
				alsoOnCorrect ? 'namnen överensstämmer' : '',
			]
				.filter(Boolean)
				.join('; '),
		});
	}

	// ---------------------------------------------------------------------
	// 2b) Members sharing the same fortnox_customer_number (the actual
	//     collision: both edit the same Fortnox customer -> last write wins).
	// ---------------------------------------------------------------------
	const membersByNumberAll = new Map<string, Member[]>();
	for (const m of members) push(membersByNumberAll, (m.fortnox_customer_number ?? '').trim(), m);
	const numberCollisions = mapEntries(membersByNumberAll)
		.filter(([, ms]) => ms.length > 1)
		.sort((a, b) => Number(a[0]) - Number(b[0]));

	// ---------------------------------------------------------------------
	// 2c) Duplicate customers: one email, several Fortnox customers. The
	//     member's linked number is the canonical one; the rest are extra
	//     records created by the sync's create path.
	// ---------------------------------------------------------------------
	const newByEmailAll = new Map<string, Row[]>();
	for (const r of newRows) {
		const e = normEmail(r.email);
		if (e) newByEmailAll.set(e, [...(newByEmailAll.get(e) ?? []), r]);
	}
	const dupGroups = mapEntries(newByEmailAll)
		.filter(([, rows]) => rows.length > 1)
		.map(([email, rows]) => {
			const member = (membersByEmail.get(email) ?? [])[0];
			const linked = (member?.fortnox_customer_number ?? '').trim();
			const nums = rows.map((r) => r.customer_number);
			return {
				email,
				rows,
				member,
				linked,
				numbers: nums,
				// Numbers that existed already in the backup (likely the original)
				inBackup: nums.filter((n) => oldByEmail.get(email)?.customer_number === n),
				linkedIsKnown: linked && nums.includes(linked),
			};
		})
		.sort((a, b) => Number(a.numbers[0]) - Number(b.numbers[0]));

	// ---------------------------------------------------------------------
	// 3) Identity diff backup → current (by email), to catch emails replaced
	// ---------------------------------------------------------------------
	const newEmails = new Set(newRows.map((r) => normEmail(r.email)).filter(Boolean));
	const newNames = new Set(newRows.map((r) => normName(r.name)).filter(Boolean));
	const vanished = oldRows.filter((r) => normEmail(r.email) && !newEmails.has(normEmail(r.email)));
	const vanishedFully = vanished.filter((r) => !newNames.has(normName(r.name)));
	const vanishedButNameSurvives = vanished.filter((r) => newNames.has(normName(r.name)));

	// ---------------------------------------------------------------------
	// Report
	// ---------------------------------------------------------------------
	const rank = { HÖG: 0, MEDEL: 1, INFO: 2 } as const;
	findings.sort((a, b) => rank[a.misstanke] - rank[b.misstanke] || Number(a.kundnummer) - Number(b.kundnummer));

	const header = [
		'Misstanke',
		'Orsak',
		'Kundnummer',
		'Namn',
		'E-post',
		'Medlem (e-post)',
		'Medlem (namn)',
		'Medlem (länkad via nummer)',
		'Ändring mot backup',
		'Notering',
	];
	const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
	fs.writeFileSync(
		OUT_FILE,
		'\uFEFF' + [
			header.join(','),
			...findings.map((f) =>
				[
					f.misstanke,
					f.orsak,
					f.kundnummer,
					f.namn,
					f.epost,
					f.medlem_epost,
					f.medlem_namn,
					f.medlem_lankad,
					f.forändring,
					f.notering,
				]
					.map((v) => esc(String(v ?? '')))
					.join(','),
			),
		].join('\n'),
		'utf8',
	);

	const counts = findings.reduce<Record<string, number>>((a, f) => ((a[f.misstanke] = (a[f.misstanke] ?? 0) + 1), a), {});

	console.log('\n=== Sammanfattning ===');
	console.log(`Kunder i ny lista: ${newRows.length} (backup ${oldRows.length})`);
	console.log(`Inkonsekventa kunder (mot medlemsregistret): ${findings.length}`);
	console.log(`  HÖG: ${counts['HÖG'] ?? 0}  INFO: ${counts['INFO'] ?? 0}`);
	console.log(
		`Medlemmar länkade till FEL kund (fortnox_customer_number pekar på annan): ${mislinks.length} (av ${
			members.filter((m) => (m.fortnox_customer_number ?? '').trim()).length
		} länkade)`,
	);
	console.log(`\nIdentitetsdiff (e-post finns i backup men ej i ny lista): ${vanished.length}`);
	console.log(`  varav namnet finns kvar med annan e-post: ${vanishedButNameSurvives.length}`);
	console.log(`  varav personen helt borta: ${vanishedFully.length}`);
	const shared = mapEntries(membersByEmail).filter(([, ms]) => ms.length > 1);
	console.log(`\nMedlemmar som delar e-post i DatoCMS: ${shared.length} adresser`);
	for (const [e, ms] of shared.slice(0, 40)) console.log(`  ${e} → ${ms.map(memberLabel).join(' | ')}`);
	const dupEmailsInNew = mapEntries(byEmailInNew).filter(([, rs]) => rs.length > 1);
	console.log(`\nSamma e-post på flera kunder i ny lista: ${dupEmailsInNew.length} adresser`);
	for (const [e, rs] of dupEmailsInNew.slice(0, 40))
		console.log(`  ${e} → kundnr ${rs.map((r) => r.customer_number).join(', ')}`);

	const mislinkCsv = path.join(path.dirname(OUT_FILE), 'fortnox-mislinked-members.csv');
	mislinks.sort((a, b) => Number(a.kundnummer) - Number(b.kundnummer));
	fs.writeFileSync(
		mislinkCsv,
		'\uFEFF' + [
			[
				'Medlems-id',
				'Medlemsnamn',
				'Medlems e-post',
				'Länkat kundnr',
				'Kundens namn',
				'Kundens e-post',
				'E-post matchar',
				'Nuvarande data tillhör medlem',
				'Rätt kundnr (via e-post)',
				'Rätt kundnamn',
				'Notering',
			].join(','),
			...mislinks.map((m) =>
				[
					m.medlem,
					m.medlems_namn.join(' / '),
					m.medlem_epost,
					m.kundnummer,
					m.kundnamn,
					m.kundepost,
					m.matchar,
					m.data_tillhor.join(' | '),
					m.korrekt_kundnr,
					m.korrekt_kundnamn,
					m.notering,
				]
					.map((v) => esc(String(v ?? '')))
					.join(','),
			),
		].join('\n'),
		'utf8',
	);
	console.log(`Fel-länkade medlemmar: ${path.resolve(mislinkCsv)}`);

	// ---------------------------------------------------------------------
	// Repair plan: everything that would change, grouped by record type.
	//  - Medlemsfält: member.fortnox_customer_number points at a customer
	//    holding someone else's info -> repoint or clear.
	//  - Kunddubblett: same email on several Fortnox customers -> keep the
	//    member-linked one, remove/review the rest.
	// ---------------------------------------------------------------------
	const plan: string[][] = [];
	for (const ml of mislinks) {
		const m = members.find((x) => x.id === ml.medlem);
		if (!m) continue;
		const correct = newByEmailFirst.get(normEmail(m.email));
		plan.push([
			'Medlemsfält',
			`${fullName(m)} <${m.email ?? ''}> [${m.id}]`,
			'fortnox_customer_number',
			ml.kundnummer,
			correct ? correct.customer_number : '(tomt)',
			correct ? 'Byt kundnummer' : 'Töm kundnummer (kund saknas – återskapas av synken)',
			ml.kundnamn
				? `Kund #${ml.kundnummer} innehåller "${ml.kundnamn}" <${ml.kundepost}>`
				: `Kund #${ml.kundnummer} finns inte i listan`,
		]);
	}
	for (const g of dupGroups) {
		const keep = g.linkedIsKnown ? g.linked : '';
		const extras = keep ? g.numbers.filter((n) => n !== keep) : [];
		const manual = !g.member || !keep;
		plan.push([
			'Kunddubblett',
			`${g.numbers.map((n) => `#${n}`).join(' + ')} "${g.rows[0].name}" <${g.email}>`,
			'fortnox_kund',
			`${g.numbers.length} kunder med samma e-post`,
			manual ? '(oklart – ingen entydig medlemslänk)' : `behåll #${keep}`,
			manual
				? 'Granska manuellt (delad/generisk e-post)'
				: `Ta bort dubblett ${extras.map((n) => `#${n}`).join(', #')} (efter kontroll)`,
			[
				g.member ? `medlem ${fullName(g.member)} länkar #${g.linked}` : 'ingen medlem med e-posten',
				g.inBackup.length ? `#${g.inBackup.join(', #')} fanns i backup` : 'inga fanns i backup',
			].join('; '),
		]);
	}
	plan.sort((a, b) => (a[0] === b[0] ? 0 : a[0] === 'Medlemsfält' ? -1 : 1));
	const planCsv = path.join(path.dirname(OUT_FILE), 'fortnox-repair-plan.csv');
	fs.writeFileSync(
		planCsv,
		'\uFEFF' + [
			['Typ', 'Objekt', 'Fält', 'Nuvarande värde', 'Nytt värde', 'Åtgärd', 'Not'].join(','),
			...plan.map((r) => r.map((v) => esc(String(v ?? ''))).join(',')),
		].join('\n'),
		'utf8',
	);
	const nFields = plan.filter((r) => r[0] === 'Medlemsfält').length;
	console.log(`\nRepair-plan: ${nFields} medlemsfält + ${dupGroups.length} kunddubbletter`);
	console.log(`  ${path.resolve(planCsv)}`);

	// ---------------------------------------------------------------------
	// Duplicate-customer report
	// ---------------------------------------------------------------------
	const dupCsv = path.join(path.dirname(OUT_FILE), 'fortnox-duplicate-customers.csv');
	fs.writeFileSync(
		dupCsv,
		'\uFEFF' + [
			[
				'E-post',
				'Antal kunder',
				'Kundnummer',
				'Namn per kund',
				'Medlemslänkat nummer',
				'Fanns i backup',
				'Notering',
			].join(','),
			...dupGroups.map((g) =>
				[
					g.email,
					g.numbers.length,
					g.numbers.join(' + '),
					g.rows.map((r) => `#${r.customer_number} ${r.name}`).join(' | '),
					g.linked || '(ingen medlemslänk)',
					g.inBackup.length ? g.inBackup.join(', ') : '',
					g.member ? `medlem ${fullName(g.member)} [${g.member.id}]` : 'ingen medlem med e-posten',
				]
					.map((v) => esc(String(v ?? '')))
					.join(','),
			),
		].join('\n'),
		'utf8',
	);
	console.log(`\nDubblettkunder (samma e-post på flera kunder): ${dupGroups.length} adresser`);
	console.log(`  ${path.resolve(dupCsv)}`);
	for (const g of dupGroups.slice(0, 60)) {
		console.log(
			`  ${g.email} → kundnr ${g.numbers.join(', ')}${g.linked ? ` (medlem länkar #${g.linked})` : ''}${
				g.inBackup.length ? ` [backup: #${g.inBackup.join(', #')}]` : ''
			}`,
		);
	}

	console.log(`\nMedlemmar som DELAR fortnox_customer_number: ${numberCollisions.length} nummer`);
	for (const [no, ms] of numberCollisions.slice(0, 60)) {
		const cust = newByNo.get(no);
		console.log(
			`  #${no} → ${cust ? `"${cust.name}" <${cust.email}>` : '(finns ej i listan)'} :: ${ms
				.map((m) => `${fullName(m)} <${m.email}>`)
				.join(' | ')}`,
		);
	}
	fs.writeFileSync(
		path.join(path.dirname(OUT_FILE), 'fortnox-duplicate-customer-numbers.csv'),
		'\uFEFF' + [
			['Kundnummer', 'Kund i Fortnox', 'Kundens e-post', 'Medlemmar som delar numret'].join(','),
			...numberCollisions.map(([no, ms]) => {
				const cust = newByNo.get(no);
				return [
					no,
					cust?.name ?? '',
					cust?.email ?? '',
					ms.map((m) => `${fullName(m)} <${m.email ?? ''}> [${m.id}]`).join(' | '),
				]
					.map((v) => esc(String(v ?? '')))
					.join(',');
			}),
		].join('\n'),
		'utf8',
	);

	fs.writeFileSync(
		path.join(path.dirname(OUT_FILE), 'fortnox-identity-diff.csv'),
		'\uFEFF' + [
			'"Borttagen e-post","Namn i backup","Namn finns kvar?"',
			...vanished.map((r) =>
				[esc(normEmail(r.email)), esc(r.name), esc(newNames.has(normName(r.name)) ? 'ja' : 'nej')].join(','),
			),
		].join('\n'),
		'utf8',
	);

	console.log(`\nRapport: ${path.resolve(OUT_FILE)}`);
	console.log(`Identitetsdiff: ${path.resolve(path.join(path.dirname(OUT_FILE), 'fortnox-identity-diff.csv'))}`);
	console.log('\nFörsta HÖG-träffar:');
	for (const f of findings.filter((x) => x.misstanke === 'HÖG').slice(0, 40))
		console.log(`  #${f.kundnummer} "${f.namn}" <${f.epost}> — ${f.orsak}`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

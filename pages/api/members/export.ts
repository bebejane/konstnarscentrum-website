import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';
import { apiQuery } from 'dato-nextjs-utils/api';
import regions from '/regions.json';
import { AllMembersDocument } from '/graphql';
import { parseDatoError } from '/lib/utils';

export const config = {
	maxDuration: 60,
};

const PAGE_SIZE = 100;

const isAuthorized = (req: NextApiRequest) => {
	const auth = req.headers.authorization;
	if (!auth) return false;
	const [user, pwd] = Buffer.from(auth.split(' ')[1] ?? '', 'base64')
		.toString()
		.split(':');
	return user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD;
};

/**
 * Resolve the region matching a DatoCMS role name. Super-admins (`admin` /
 * `owner`) map to the global region so they export every region at once.
 */
const findRegionByRole = (roleName: string) => {
	const key = (roleName || '').toLowerCase();
	if (!key) return undefined;
	if (key === 'admin' || key === 'owner') return regions.find((r) => r.global);
	return regions.find((r) => r.slug.toLowerCase() === key);
};

/**
 * Page through the CDA until every member for the region has been fetched.
 * Invalid records are included so the export matches what editors see.
 */
const fetchAllMembers = async (regionId?: string) => {
	const members: any[] = [];

	for (let skip = 0; ; skip += PAGE_SIZE) {
		const res = await apiQuery(AllMembersDocument, {
			variables: { regionId, first: PAGE_SIZE, skip },
			excludeInvalid: false,
		});
		members.push(...(res.members ?? []));

		const count = res.pagination?.count ?? members.length;
		if (skip + PAGE_SIZE >= count) break;
	}

	return members;
};

const columns: { header: string; key: string; width: number }[] = [
	{ header: 'Efternamn', key: 'lastName', width: 18 },
	{ header: 'Förnamn', key: 'firstName', width: 18 },
	{ header: 'E-post', key: 'email', width: 30 },
	{ header: 'Stad', key: 'city', width: 18 },
	{ header: 'Födelseort', key: 'birthPlace', width: 18 },
	{ header: 'Födelseår', key: 'yearOfBirth', width: 12 },
	{ header: 'Region', key: 'region', width: 12 },
	{ header: 'Kategori', key: 'category', width: 24 },
	{ header: 'Aktiv', key: 'active', width: 10 },
	{ header: 'Visa kontakt', key: 'showContact', width: 12 },
	{ header: 'Instagram', key: 'instagram', width: 20 },
	{ header: 'Webbsida', key: 'webpage', width: 30 },
	{ header: 'Fortnox-kundnr', key: 'fortnoxCustomerNumber', width: 16 },
	{ header: 'Slug', key: 'slug', width: 24 },
	{ header: 'Skapad', key: 'createdAt', width: 14 },
	{ header: 'Uppdaterad', key: 'updatedAt', width: 14 },
	{ header: 'ID', key: 'id', width: 12 },
];

const yesNo = (value: unknown) => (value === true ? 'Ja' : value === false ? 'Nej' : '');

const formatDate = (value?: string | null) => (value ? String(value).slice(0, 10) : '');

const statusLabel = (status?: string | null) =>
	status === 'published'
		? 'Publicerad'
		: status === 'draft'
			? 'Utkast'
			: status === 'updated'
				? 'Uppdaterad'
				: (status ?? '');

/** Swedish collation so Å, Ä, Ö sort after Z. */
const collator = new Intl.Collator('sv', { usage: 'sort', sensitivity: 'base' });

const byLastName = (a: any, b: any) =>
	collator.compare((a.lastName ?? '').trim(), (b.lastName ?? '').trim()) ||
	collator.compare((a.firstName ?? '').trim(), (b.firstName ?? '').trim());

const buildWorkbook = (members: any[]) => {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'Konstnärscentrum';
	workbook.created = new Date();

	const sheet = workbook.addWorksheet('Medlemmar');
	sheet.columns = columns;
	sheet.getRow(1).font = { bold: true };
	sheet.views = [{ state: 'frozen', ySplit: 1 }];

	[...members].sort(byLastName).forEach((member) => {
		sheet.addRow({
			firstName: member.firstName ?? '',
			lastName: member.lastName ?? '',
			fullName: member.fullName ?? '',
			email: member.email ?? '',
			city: member.city ?? '',
			birthPlace: member.birthPlace ?? '',
			yearOfBirth: member.yearOfBirth ?? '',
			region: member.region?.name ?? '',
			category: (member.memberCategory ?? [])
				.map((c: any) => c?.categoryType)
				.filter(Boolean)
				.join(', '),
			active: yesNo(member.active),
			showContact: yesNo(member.showContact),
			instagram: member.instagram ?? '',
			webpage: member.webpage ?? '',
			fortnoxCustomerNumber: member.fortnoxCustomerNumber ?? '',
			slug: member.slug ?? '',
			createdAt: formatDate(member.createdAt),
			updatedAt: formatDate(member.updatedAt),
			id: member.id ?? '',
		});
	});

	return workbook;
};

/**
 * POST /api/members/export  Body: { role: string }
 *
 * Generates an Excel file with every member of the region matching the role.
 * Gated by the same Basic Auth credentials the DatoCMS plugin stores.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' });

	const roleName = (req.method === 'POST' ? req.body?.role : req.query?.role) as string;
	const region = findRegionByRole(roleName);
	if (!region) return res.status(400).json({ error: `Okänd region för rollen "${roleName}"` });

	try {
		const members = await fetchAllMembers(region.global ? undefined : region.id);
		const workbook = buildWorkbook(members);
		const buffer = await workbook.xlsx.writeBuffer();

		const date = new Date().toISOString().slice(0, 10);
		const filename = `medlemmar-${region.slug}-${date}.xlsx`;

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Length', Buffer.byteLength(buffer));

		return res.status(200).send(Buffer.from(buffer));
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: parseDatoError(err) });
	}
}

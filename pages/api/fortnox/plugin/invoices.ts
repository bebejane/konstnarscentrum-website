import { NextApiRequest, NextApiResponse } from 'next';
import client from '/lib/client';
import regions from '/regions.json';
import { getAllMembers, MemberItem } from '/lib/fortnox/sync';
import { createAnnualInvoiceForMember, isEligibleForInvoice } from '/lib/fortnox/invoiceDispatch';
import { parseDatoError } from '/lib/utils';

export const config = {
	maxDuration: 300,
};

const isAuthorized = (req: NextApiRequest) => {
	const auth = req.headers.authorization;
	if (!auth) return false;
	const [user, pwd] = Buffer.from(auth.split(' ')[1] ?? '', 'base64')
		.toString()
		.split(':');
	return user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD;
};

const findRegionByRole = (roleName: string) =>
	regions.find((r) => r.slug.toLowerCase() === roleName.toLowerCase());

const filterMembersByRegion = (members: MemberItem[], regionId: string) =>
	members.filter((m) => m.region === regionId);

/**
 * GET /api/fortnox/plugin/invoices?role=<roleName>
 * List members for the region matching the given DatoCMS role name.
 *
 * POST /api/fortnox/plugin/invoices
 * Body: { invoiceYear?: number, role: string }
 * Create invoices for all eligible members of the region matching the role.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' });

	if (req.method === 'GET') {
		const roleName = (req.query.role as string) || '';
		if (!roleName) return res.status(400).json({ error: 'Missing role query parameter' });

		const region = findRegionByRole(roleName);
		if (!region) return res.status(404).json({ error: `No region found for role "${roleName}"` });

		try {
			const allMembers = await getAllMembers(region.id);
			const members = filterMembersByRegion(allMembers, region.id);
			return res.status(200).json({ members, region: region.slug });
		} catch (err) {
			return res.status(500).json({ error: parseDatoError(err) });
		}
	}

	if (req.method === 'POST') {
		if (req.body?.ping) return res.status(200).json({ pong: true });

		const roleName = req.body?.role as string;
		if (!roleName) return res.status(400).json({ error: 'Missing role in request body' });

		const region = findRegionByRole(roleName);
		if (!region) return res.status(404).json({ error: `No region found for role "${roleName}"` });

		const invoiceYear = Number(req.body?.invoiceYear ?? new Date().getFullYear());

		try {
			const allMembers = await getAllMembers();
			const members = filterMembersByRegion(allMembers, region.id);
			const results = {
				created: 0,
				skipped: 0,
				failed: 0,
				errors: [] as string[],
				invoices: [] as string[],
			};

			for (const member of members) {
				const { eligible } = await isEligibleForInvoice(member, invoiceYear);
				if (!eligible) {
					results.skipped++;
					continue;
				}

				try {
					const { documentNumber } = await createAnnualInvoiceForMember(member, invoiceYear);
					results.created++;
					results.invoices.push(documentNumber);
				} catch (err: any) {
					results.failed++;
					results.errors.push(`[${member.id}] ${err?.message ?? err}`);
				}
			}

			return res.status(200).json({ ...results, invoiceYear, region: region.slug });
		} catch (err) {
			return res.status(500).json({ error: parseDatoError(err) });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
}

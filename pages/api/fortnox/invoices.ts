import { NextApiRequest, NextApiResponse } from 'next';
import regions from '/regions.json';
import { getAllMembers } from '/lib/fortnox/sync';
import { createAnnualInvoiceForMember, isEligibleForInvoice } from '/lib/fortnox/invoiceDispatch';
import { readRegionInvoiceAmount } from '/lib/fortnox/invoiceAmount';
import { isFortnoxEnabled } from '/lib/fortnox/constants';
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

/**
 * Bulk-create and send annual invoices to all eligible members.
 *
 * POST /api/fortnox/invoices
 * Body: { invoiceYear?: number }  (defaults to current year)
 *
 * Auth: Basic Auth (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)
 *
 * This is triggered by the DatoCMS plugin's "Skicka fakturor" button.
 * Idempotency: members already invoiced for `invoiceYear` are skipped.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' });

	if (req.body?.ping) return res.status(200).json({ pong: true });

	const invoiceYear = Number(req.body?.invoiceYear ?? new Date().getFullYear());

	try {
		const members = await getAllMembers();

		// The amount is set per region in DatoCMS with no code fallback: refuse the
		// whole run before creating anything if any invoiceable region lacks one.
		const regionIds = members
			.map((m) => m.region)
			.filter((id, i, all): id is string => !!id && all.indexOf(id) === i);
		const missing: string[] = [];
		const amounts: Record<string, number> = {};
		for (const regionId of regionIds) {
			const region = regions.find((r) => r.id === regionId);
			// Regions without Fortnox credentials can't be invoiced at all, so their
			// missing amount must not block the regions that can.
			if (!region || !isFortnoxEnabled(region.slug)) continue;
			const { amount, error } = await readRegionInvoiceAmount(region);
			if (amount === null) missing.push(error ?? region.slug);
			else amounts[regionId] = amount;
		}
		if (missing.length) return res.status(400).json({ error: missing.join(' ') });

		const results = {
			created: 0,
			skipped: 0,
			failed: 0,
			errors: [] as string[],
			invoices: [] as string[],
		};

		for (const member of members) {
			const { eligible, reason } = await isEligibleForInvoice(member, invoiceYear);
			if (!eligible) {
				results.skipped++;
				continue;
			}

			try {
				const { documentNumber } = await createAnnualInvoiceForMember(
					member,
					invoiceYear,
					member.region ? amounts[member.region] : undefined,
				);
				results.created++;
				results.invoices.push(documentNumber);
			} catch (err: any) {
				results.failed++;
				results.errors.push(`[${member.id}] ${err?.message ?? err}`);
			}
		}

		return res.status(200).json({ ...results, invoiceYear });
	} catch (err) {
		return res.status(500).json({ error: parseDatoError(err) });
	}
}

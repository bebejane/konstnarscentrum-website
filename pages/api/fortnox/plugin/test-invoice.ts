import { NextApiRequest, NextApiResponse } from 'next';
import regions from '/regions.json';
import { getAllMembers } from '/lib/fortnox/sync';
import { createTestInvoice, pickTestInvoiceMember } from '/lib/fortnox/invoiceDispatch';
import { getRegionTestEmail } from '/lib/fortnox/testEmail';
import { parseDatoError } from '/lib/utils';

export const config = {
	maxDuration: 120,
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
	regions.find((r) => r.slug.toLowerCase() === roleName.toLowerCase()) ??
	regions.find((r) => r.slug.toLowerCase() === 'ost');

/**
 * Send ONE invoice as a test, to the region's test address.
 *
 * POST /api/fortnox/plugin/test-invoice
 * Body: { role: string, invoiceYear?: number }
 *
 * Auth: Basic Auth (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)
 *
 * Requires `region.test_email` ("Test email") and the region's membership amount.
 * The invoice is created exactly like an annual invoice and e-mailed to the test
 * address instead of the member. No DatoCMS `invoice` record is written, so no
 * member is marked as invoiced and the real run for the year is unaffected.
 *
 * This intentionally ignores FORTNOX_EMAIL_ALLOWLIST: the recipient is an address
 * an editor configured on the region, not a member's.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' });

	const roleName = req.body?.role as string;
	if (!roleName) return res.status(400).json({ error: 'Missing role in request body' });

	const region = findRegionByRole(roleName);
	if (!region) return res.status(404).json({ error: `No region found for role "${roleName}"` });

	const invoiceYear = Number(req.body?.invoiceYear ?? new Date().getFullYear());

	try {
		const testEmail = await getRegionTestEmail(region);
		if (!testEmail)
			return res.status(400).json({
				error:
					'Regionen saknar en giltig testadress. Ange fältet "Test email" på regionen i DatoCMS.',
			});

		const allMembers = await getAllMembers(region.id);
		const member = pickTestInvoiceMember(
			allMembers.filter((m) => m.region === region.id),
			testEmail,
		);
		if (!member)
			return res.status(404).json({
				error: 'Ingen medlem i regionen har ett Fortnox-kundnummer att skapa testfakturan på.',
			});

		const { documentNumber, customerNumber, invoiceDate } = await createTestInvoice(
			region,
			member,
			invoiceYear,
			testEmail,
		);

		return res.status(200).json({
			documentNumber,
			recipient: testEmail,
			customerNumber,
			invoiceDate,
			memberId: member.id,
			memberName:
				[member.first_name, member.last_name].filter(Boolean).join(' ') ||
				member.email ||
				member.id,
			invoiceYear,
			region: region.slug,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: parseDatoError(err) });
	}
}

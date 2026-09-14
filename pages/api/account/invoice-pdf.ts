import withAuthentication from '/lib/auth/withAuthentication';
import client from '/lib/client';
import { getMemberInvoices } from '/lib/fortnox/invoiceDispatch';
import { getInvoicePdf } from '/lib/fortnox/invoices';
import regions from '/regions.json';

/**
 * Proxy the Fortnox invoice PDF for the logged-in member.
 * Verifies the invoice belongs to the member before fetching.
 *
 * GET /api/fortnox/member-invoice-pdf?documentNumber=123
 * Auth: NextAuth session
 */
export default withAuthentication(async (req, res, session) => {
	if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

	const documentNumber = String(req.query.id ?? '');
	if (!documentNumber) return res.status(400).json({ error: 'Missing documentNumber' });

	const email = session.user?.email;
	if (!email) return res.status(401).json({ error: 'Unauthorized' });

	const members = await client.items.list({
		filter: {
			type: 'member',
			fields: { email: { eq: email.toLowerCase() } },
		},
	});
	const member = members[0] as
		| { id: string; email?: string; region?: string; fortnox_customer_number?: string }
		| undefined;

	if (!member?.region) return res.status(404).json({ error: 'Member not found' });

	if (!member.fortnox_customer_number)
		return res.status(404).json({ error: 'No Fortnox customer linked' });

	const region = regions.find((r) => r.id === member.region);
	if (!region) return res.status(404).json({ error: 'Member region not found' });

	const invoices = await getMemberInvoices(member.id);
	const owns = invoices.some((inv) => String(inv.fortnox_document_number) === documentNumber);
	if (!owns) return res.status(403).json({ error: 'Invoice not found for this member' });

	try {
		const pdf = await getInvoicePdf(region.slug, documentNumber);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="faktura-${documentNumber}.pdf"`);
		res.send(Buffer.from(pdf));
	} catch (err: any) {
		console.error(`[member-invoice-pdf] Failed to fetch PDF for ${documentNumber}:`, err);
		console.log(err);
		res.status(502).json({ error: 'Failed to fetch invoice from Fortnox' });
	}
});

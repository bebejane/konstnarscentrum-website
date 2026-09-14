import { NextApiRequest, NextApiResponse } from 'next';
import { getInvoicePdf } from '/lib/fortnox/invoices';
import { regionSlugs } from '/lib/fortnox/constants';

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
 * Proxy the Fortnox invoice PDF.
 *
 * GET /api/fortnox/invoice-pdf?documentNumber=123&region=ost
 * Auth: Basic Auth (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' });
	if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

	const documentNumber = String(req.query.documentNumber ?? '');
	if (!documentNumber) return res.status(400).json({ error: 'Missing documentNumber' });

	const region = String(req.query.region ?? 'ost');
	if (!regionSlugs.includes(region)) return res.status(400).json({ error: `Unknown region "${region}"` });

	try {
		const pdf = await getInvoicePdf(region, documentNumber);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="faktura-${documentNumber}.pdf"`);
		res.send(Buffer.from(pdf));
	} catch (err: any) {
		console.error(`[invoice-pdf] Failed to fetch PDF for ${documentNumber}:`, err);
		res.status(502).json({ error: 'Failed to fetch invoice from Fortnox' });
	}
}
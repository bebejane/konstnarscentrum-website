import client from '/lib/client';
import type { FortnoxEmailInformation } from './invoices';

/**
 * The invoice e-mail text is set per region in DatoCMS
 * (`region.invoice_email_text`, "Text i fakturamejl").
 *
 * Unlike the invoice amount it is optional: an empty field means "use Fortnox's
 * own default text", and an unreadable value must never stop an invoice from
 * being created. The text is sent as-is apart from trimming — interior line
 * breaks are kept. (Do not pass it through `sanitizeText` in `./sync`, which
 * collapses all whitespace.)
 */
export type InvoiceEmailRegion = {
	id: string;
	slug?: string;
	name?: string;
};

const FIELD_LABEL = 'Text i fakturamejl';

/**
 * Field value → the text to put in the e-mail. Normalises CRLF to LF and trims
 * surrounding whitespace while keeping interior line breaks. Anything that
 * isn't a non-empty string yields null (= no text, Fortnox default).
 */
export const normalizeInvoiceEmailText = (raw: unknown): string | null => {
	if (typeof raw !== 'string') return null;
	const text = raw.replace(/\r\n?/g, '\n').trim();
	return text || null;
};

/**
 * Build the Fortnox `EmailInformation` for an invoice. Returns undefined when
 * there is no text, so the account's default e-mail is used unchanged.
 */
export const buildInvoiceEmailInformation = (
	text: unknown,
): FortnoxEmailInformation | undefined => {
	const normalized = normalizeInvoiceEmailText(text);
	return normalized ? { EmailBody: normalized } : undefined;
};

/**
 * Read a region's invoice e-mail text. Never throws: a missing, empty or
 * unreadable value simply means the Fortnox default text is used.
 */
export const getRegionInvoiceEmailText = async (
	region: InvoiceEmailRegion,
): Promise<string | null> => {
	try {
		const record = (await client.items.find(region.id)) as unknown as {
			invoice_email_text?: unknown;
		};
		return normalizeInvoiceEmailText(record?.invoice_email_text);
	} catch (err: any) {
		console.warn(
			`[fortnox] could not read "${FIELD_LABEL}" for region ${
				region.name || region.slug || region.id
			}: ${err?.message ?? err}`,
		);
		return null;
	}
};

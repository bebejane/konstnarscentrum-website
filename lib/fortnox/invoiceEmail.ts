import client from '/lib/client';
import type { FortnoxEmailInformation } from './invoices';

/**
 * The invoice e-mail text is set per region in DatoCMS:
 * - `region.invoice_email_text`, "Text i faktura mail" — the message body
 * - `region.invoice_email_subject`, "Invoice e-post rubrik" — the subject line
 *
 * Both are optional: without them Fortnox's own default e-mail is used, exactly as
 * before the fields existed, and an unreadable value must never stop an invoice
 * from being created. The body is sent as-is apart from trimming — interior line
 * breaks are kept. (Do not pass it through `sanitizeText` in `./sync`, which
 * collapses all whitespace; the subject is collapsed because it is one line.)
 */
export type InvoiceEmailRegion = {
	id: string;
	slug?: string;
	name?: string;
};

const TEXT_LABEL = 'Text i faktura mail';
const SUBJECT_LABEL = 'Invoice e-post rubrik';

/**
 * Field value → the body to put in the e-mail. Normalises CRLF to LF and trims
 * surrounding whitespace while keeping interior line breaks. Anything that isn't
 * a non-empty string yields null (= no text, Fortnox default).
 */
export const normalizeInvoiceEmailText = (raw: unknown): string | null => {
	if (typeof raw !== 'string') return null;
	const text = raw.replace(/\r\n?/g, '\n').trim();
	return text || null;
};

/**
 * Field value → a one-line subject. Newlines and runs of spaces collapse to a
 * single space, because a subject is a single line.
 */
export const normalizeInvoiceEmailSubject = (raw: unknown): string | null => {
	if (typeof raw !== 'string') return null;
	const subject = raw.replace(/\s+/g, ' ').trim();
	return subject || null;
};

export type RegionInvoiceEmail = {
	body: string | null;
	subject: string | null;
};

/**
 * Read a region's invoice e-mail body and subject in one request. Never throws:
 * a missing, empty or unreadable value simply means the Fortnox default is used.
 */
export const getRegionInvoiceEmail = async (
	region: InvoiceEmailRegion,
): Promise<RegionInvoiceEmail> => {
	try {
		const record = (await client.items.find(region.id)) as unknown as {
			invoice_email_text?: unknown;
			invoice_email_subject?: unknown;
		};
		return {
			body: normalizeInvoiceEmailText(record?.invoice_email_text),
			subject: normalizeInvoiceEmailSubject(record?.invoice_email_subject),
		};
	} catch (err: any) {
		console.warn(
			`[fortnox] could not read "${TEXT_LABEL}"/"${SUBJECT_LABEL}" for region ${
				region.name || region.slug || region.id
			}: ${err?.message ?? err}`,
		);
		return { body: null, subject: null };
	}
};

/**
 * Build the Fortnox `EmailInformation` for an invoice.
 *
 * Returns undefined when there is nothing to override, so the account's default
 * e-mail is used unchanged. Once the object is sent, Fortnox requires a subject —
 * without one the send fails with 2001578 ("Ämne för e-post saknas") — so a
 * subject is always included: the region's own, else `fallbackSubject`.
 */
export const buildInvoiceEmailInformation = ({
	body,
	subject,
	addressTo,
	fallbackSubject,
}: {
	body?: unknown;
	subject?: unknown;
	addressTo?: unknown;
	fallbackSubject: string;
}): FortnoxEmailInformation | undefined => {
	const text = normalizeInvoiceEmailText(body);
	const ownSubject = normalizeInvoiceEmailSubject(subject);
	const recipient =
		typeof addressTo === 'string' && addressTo.trim() ? addressTo.trim() : null;

	if (!text && !ownSubject && !recipient) return undefined;

	return {
		EmailSubject: ownSubject ?? normalizeInvoiceEmailSubject(fallbackSubject) ?? fallbackSubject,
		...(text ? { EmailBody: text } : {}),
		...(recipient ? { EmailAddressTo: recipient } : {}),
	};
};

import client from '/lib/client';
import regions from '../../regions.json';

let invoiceItemTypeId: string | null = null;

const getInvoiceItemTypeId = async (): Promise<string> => {
	if (invoiceItemTypeId) return invoiceItemTypeId;
	const types = await client.itemTypes.list();
	const invoiceType =
		types.find((t) => (t as any).api_key === 'invoice') ??
		types.find((t) => (t as any).name === 'Invoice');
	if (!invoiceType) throw new Error('DatoCMS model with api_key "invoice" not found');
	invoiceItemTypeId = invoiceType.id;
	return invoiceItemTypeId;
};
import {
	FORTNOX_INVOICE_DUE_DAYS,
	getFortnoxTokenFromEnv,
	getInvoiceAccountNumber,
	isEmailAllowedToSend,
} from './constants';
import { getRegionInvoiceAmount } from './invoiceAmount';
import { buildInvoiceEmailInformation, getRegionInvoiceEmail } from './invoiceEmail';
import { normalizeTestEmail } from './testEmail';
import {
	createInvoice,
	sendInvoiceAsEmail,
	getInvoice,
	isInvoicePaid,
	isInvoicePartiallyPaid,
} from './invoices';
import type { CreateInvoiceInput, FortnoxEmailInformation } from './invoices';
import { hasFortnoxCredentials } from './auth';
import type { MemberItem } from './sync';
import { format } from 'date-fns';

export type InvoiceRecord = {
	id: string;
	fortnox_document_number?: string;
	payment_status?: string;
	payment_date?: string | null;
	due_date?: string | null;
	invoice_year?: number;
	total?: number;
	fortnox_customer_number?: string;
	region?: string;
	member?: string | { id: string };
	[key: string]: any;
};

/**
 * Fetch all invoice records linked to a member via the `invoice.member` field.
 */
export const getMemberInvoices = async (memberId: string): Promise<InvoiceRecord[]> => {
	const records: InvoiceRecord[] = [];
	for await (const record of client.items.listPagedIterator({
		filter: { type: 'invoice', fields: { member: { eq: memberId } } },
	})) {
		records.push(record as unknown as InvoiceRecord);
	}
	return records;
};

/**
 * Fetch the invoice record for a given year for every member, keyed by member
 * id. Optionally restrict to a single region (matched on the record's `region`
 * slug). Members without an invoice that year are simply absent from the map.
 */
export const getYearlyInvoicesByMember = async (
	invoiceYear: number,
	regionSlug?: string,
): Promise<Record<string, InvoiceRecord>> => {
	const fields: Record<string, unknown> = { invoice_year: { eq: invoiceYear } };
	if (regionSlug) {
		const region = regions.find((r) => r.slug === regionSlug);
		if (region) fields.region = { eq: region.id };
	}

	const byMember: Record<string, InvoiceRecord> = {};
	for await (const record of client.items.listPagedIterator({
		filter: { type: 'invoice', fields },
	})) {
		const rec = record as unknown as InvoiceRecord;
		const memberId = typeof rec.member === 'string' ? rec.member : rec.member?.id;
		if (memberId && rec.fortnox_document_number) byMember[memberId] = rec;
	}
	return byMember;
};

/**
 * Pure eligibility check given a member, the target invoice year, its linked
 * invoice records, and whether Fortnox credentials exist for the member's
 * region. Extracted from `isEligibleForInvoice` so it can be unit-tested
 * without network access.
 */
export const isEligibleForInvoiceFromRecords = (
	member: MemberItem,
	invoiceYear: number,
	records: InvoiceRecord[],
	hasCredentials: boolean,
): { eligible: boolean; reason?: string } => {
	const region = regions.find((r) => r.id === member.region);

	if (!region) return { eligible: false, reason: 'no region' };
	if (!hasCredentials)
		return { eligible: false, reason: `no fortnox credentials (${region.slug})` };
	if (!member.fortnox_customer_number)
		return { eligible: false, reason: 'no fortnox customer number' };
	if (member.inactive === true) return { eligible: false, reason: 'inactive' };

	if (records.some((inv) => inv.invoice_year === invoiceYear))
		return { eligible: false, reason: `already invoiced ${invoiceYear}` };

	return { eligible: true };
};

/**
 * Eligibility for receiving the annual invoice:
 * - has region + fortnox credentials
 * - has a linked fortnox customer number
 * - not dormant (`inactive`, "Vilande" in DatoCMS)
 * - does not already have a linked invoice record for `invoiceYear`
 */
export const isEligibleForInvoice = async (
	member: MemberItem,
	invoiceYear: number,
): Promise<{ eligible: boolean; reason?: string; records: InvoiceRecord[] }> => {
	const region = regions.find((r) => r.id === member.region);
	const records = await getMemberInvoices(member.id);
	const result = isEligibleForInvoiceFromRecords(
		member,
		invoiceYear,
		records,
		region ? hasFortnoxCredentials(region.slug) : false,
	);
	return { ...result, records };
};

/** Invoice date + `FORTNOX_INVOICE_DUE_DAYS`, as the annual invoices are due. */
const dueDateFrom = (invoiceDate: Date): Date => {
	const dueDate = new Date(invoiceDate);
	dueDate.setDate(dueDate.getDate() + FORTNOX_INVOICE_DUE_DAYS);
	return dueDate;
};

/**
 * The payload shared by the annual run and the test send: one row for the
 * membership fee, same dates, and the region's e-mail text when it has one.
 */
const buildAnnualInvoiceInput = ({
	regionSlug,
	customerNumber,
	invoiceYear,
	price,
	invoiceDate,
	emailInformation,
}: {
	regionSlug: string;
	customerNumber: string;
	invoiceYear: number;
	price: number;
	invoiceDate: Date;
	emailInformation?: FortnoxEmailInformation;
}): CreateInvoiceInput => ({
	CustomerNumber: customerNumber,
	InvoiceDate: format(invoiceDate, 'yyyy-MM-dd'),
	DueDate: format(dueDateFrom(invoiceDate), 'yyyy-MM-dd'),
	...(emailInformation ? { EmailInformation: emailInformation } : {}),
	InvoiceRows: [
		{
			Description: `Medlemsavgift ${invoiceYear}`,
			// Never rely on the company's default sales account: when that default is
			// missing/inactive Fortnox rejects the whole invoice (error 2001304).
			AccountNumber: getInvoiceAccountNumber(regionSlug),
			Price: price,
			DeliveredQuantity: 1,
			// No VATCode: the account's own VAT setting applies, as on the invoices the
			// association has issued manually (medlemsavgift is VAT exempt).
		},
	],
});

/**
 * Create and send the annual membership invoice for a member via Fortnox,
 * then create a matching DatoCMS `invoice` record and link it to the member.
 *
 * Pass `amount` when the caller already resolved the region's yearly amount (bulk
 * runs do, once per region) to avoid re-reading it for every member.
 */
export const createAnnualInvoiceForMember = async (
	member: MemberItem,
	invoiceYear: number,
	amount?: number,
): Promise<{ documentNumber: string; invoiceRecordId: string; invoiceDate?: string; record: InvoiceRecord }> => {
	const region = regions.find((r) => r.id === member.region);
	if (!region) throw new Error(`Member ${member.id} has no region`);
	if (!member.fortnox_customer_number)
		throw new Error(`Member ${member.id} has no Fortnox customer number`);
	if (member.inactive)
		throw new Error(`Member ${member.id} is inactive (vilande) and must not be invoiced`);
	if (!hasFortnoxCredentials(region.slug))
		throw new Error(`Fortnox is disabled or not configured for region ${region.slug}`);

	const invoiceDate = new Date();
	const invoiceDateString = format(invoiceDate, 'yyyy-MM-dd');

	// Throws (InvoiceAmountError) when the region has no annual amount configured —
	// we never invoice a guessed amount.
	const price = amount ?? (await getRegionInvoiceAmount(region));

	// Optional per-region e-mail text and subject. Without either, the invoice is
	// sent with Fortnox's own default message, exactly as before the fields existed.
	const email = await getRegionInvoiceEmail(region);
	const invoice = await createInvoice(
		region.slug,
		buildAnnualInvoiceInput({
			regionSlug: region.slug,
			customerNumber: member.fortnox_customer_number,
			invoiceYear,
			price,
			invoiceDate,
			emailInformation: buildInvoiceEmailInformation({
				body: email.body,
				subject: email.subject,
				fallbackSubject: `Medlemsavgift ${invoiceYear}`,
			}),
		}),
	);

	// Send via Fortnox email (guarded by the email allowlist)
	if (isEmailAllowedToSend(member.email)) {
		await sendInvoiceAsEmail(region.slug, invoice.DocumentNumber);
	} else {
		console.log(
			`[${member.id}] invoice ${invoice.DocumentNumber} created but NOT emailed (email not in FORTNOX_EMAIL_ALLOWLIST)`,
		);
	}

	// Create a DatoCMS invoice record linked to the member
	const invoiceRecord = await client.items.create({
		item_type: { type: 'item_type', id: await getInvoiceItemTypeId() },
		...({
			fortnox_document_number: String(invoice.DocumentNumber),
			payment_status: invoice.Status ?? 'UNPAID',
			payment_date: null,
			due_date: invoice.DueDate ?? null,
			invoice_year: invoiceYear,
			total: typeof invoice.Total === 'number' ? invoice.Total : 0,
			fortnox_customer_number: member.fortnox_customer_number,
			region: region.id,
			member: member.id,
		} as any),
	});

	return {
		documentNumber: invoice.DocumentNumber,
		invoiceRecordId: invoiceRecord.id,
		invoiceDate: (invoice.InvoiceDate as string | undefined) ?? invoiceDateString,
		record: invoiceRecord as unknown as InvoiceRecord,
	};
};

/**
 * Pick the member a test invoice is issued to. Fortnox needs a real customer, so
 * the test is a real invoice delivered to someone else's address:
 * - the member whose e-mail is the region's test address, so the invoice and the
 *   recipient describe the same person, otherwise
 * - the first member (by last name) with a Fortnox customer number, preferring
 *   members that are not dormant.
 * Members without a customer number cannot be invoiced at all, so they are never
 * picked. Pure, so the choice is unit-tested without network access.
 */
export const pickTestInvoiceMember = (
	members: MemberItem[],
	testEmail: string,
): MemberItem | null => {
	const needle = normalizeTestEmail(testEmail);
	if (!needle) return null;

	const withCustomer = members.filter((m) => !!m.fortnox_customer_number);
	const matching = withCustomer.find((m) => normalizeTestEmail(m.email) === needle);
	if (matching) return matching;

	const active = withCustomer.filter((m) => m.inactive !== true);
	const candidates = active.length ? active : withCustomer;
	const byLastName = [...candidates].sort((a, b) =>
		(a.last_name ?? '').localeCompare(b.last_name ?? '', 'sv', { sensitivity: 'base' }),
	);
	return byLastName[0] ?? null;
};

export type TestInvoiceRegion = {
	id: string;
	slug: string;
	name?: string;
};

/**
 * Create and e-mail a single invoice as a test: the same invoice the annual run
 * produces (same amount, row and e-mail text), but sent to the region's test
 * address instead of to the member.
 *
 * No DatoCMS `invoice` record is created and no member is marked as invoiced, so
 * the real run for the year is unaffected. The Fortnox invoice itself is left in
 * place — it is a real document and has to be credited/deleted in Fortnox if it
 * should not stay.
 */
export const createTestInvoice = async (
	region: TestInvoiceRegion,
	member: MemberItem,
	invoiceYear: number,
	testEmail: string,
): Promise<{ documentNumber: string; customerNumber: string; invoiceDate: string }> => {
	if (!member.fortnox_customer_number)
		throw new Error(`Member ${member.id} has no Fortnox customer number`);
	if (!hasFortnoxCredentials(region.slug))
		throw new Error(`Fortnox is disabled or not configured for region ${region.slug}`);

	const recipient = normalizeTestEmail(testEmail);
	if (!recipient) throw new Error('No valid test e-mail address');

	const invoiceDate = new Date();
	const price = await getRegionInvoiceAmount(region);

	// Only the recipient changes: the region's e-mail text and subject go out as they
	// would to a member, so the test shows what members actually receive.
	const email = await getRegionInvoiceEmail(region);

	const invoice = await createInvoice(
		region.slug,
		buildAnnualInvoiceInput({
			regionSlug: region.slug,
			customerNumber: member.fortnox_customer_number,
			invoiceYear,
			price,
			invoiceDate,
			emailInformation: buildInvoiceEmailInformation({
				body: email.body,
				subject: email.subject,
				addressTo: recipient,
				fallbackSubject: `Medlemsavgift ${invoiceYear}`,
			}),
		}),
	);

	await sendInvoiceAsEmail(region.slug, invoice.DocumentNumber);

	return {
		documentNumber: invoice.DocumentNumber,
		customerNumber: member.fortnox_customer_number,
		invoiceDate: (invoice.InvoiceDate as string | undefined) ?? format(invoiceDate, 'yyyy-MM-dd'),
	};
};

/**
 * Poll Fortnox for the current payment state of a member's linked invoice
 * records and update each DatoCMS `invoice` record accordingly.
 *
 * Returns the number of records updated (0 when nothing changed).
 */
export const syncMemberInvoicePaymentStatus = async (
	member: MemberItem,
	records?: InvoiceRecord[],
): Promise<{ updated: number }> => {
	const region = regions.find((r) => r.id === member.region);
	if (!region) return { updated: 0 };
	if (!hasFortnoxCredentials(region.slug)) return { updated: 0 };

	const invoices = records ?? (await getMemberInvoices(member.id));
	let updated = 0;

	for (const rec of invoices) {
		const docNumber = rec.fortnox_document_number;
		const recRegion = regions.find((r) => r.id === rec.region)?.slug ?? region.slug;
		if (!docNumber) continue;

		try {
			const invoice = await getInvoice(recRegion, docNumber);
			const payment_status = String(invoice.Status ?? rec.payment_status ?? 'UNPAID');
			const payment_date =
				invoice.FinalPayDate ??
				(isInvoicePaid(invoice) || isInvoicePartiallyPaid(invoice)
					? (invoice.FinalPayDate ?? null)
					: null);
			const changes: Record<string, unknown> = {
				payment_status,
				total: typeof invoice.Total === 'number' ? invoice.Total : (rec.total ?? 0),
				due_date: invoice.DueDate ?? rec.due_date ?? null,
			};
			if (payment_date) changes.payment_date = payment_date;

			const needsUpdate =
				rec.payment_status !== changes.payment_status ||
				(payment_date && rec.payment_date !== payment_date) ||
				rec.due_date !== changes.due_date;

			if (needsUpdate) {
				await client.items.update(rec.id, changes as any);
				updated++;
			}
		} catch {
			// Unreachable/invalid document — leave as-is
		}
	}

	return { updated };
};

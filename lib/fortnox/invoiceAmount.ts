import client from '/lib/client';

/**
 * The annual membership amount is set per region in DatoCMS (`region.invoice_amount`).
 * There is no fallback: a region without a valid amount cannot be invoiced, and the
 * error is surfaced to whoever tries (API 400 / plugin banner / script exit).
 */
export type InvoiceAmountRegion = {
	id: string;
	slug?: string;
	name?: string;
};

const FIELD_LABEL = 'Medlemsavgift per år';

export class InvoiceAmountError extends Error {
	readonly regionId: string;

	constructor(region: InvoiceAmountRegion, message?: string) {
		super(message ?? regionAmountError(region));
		this.name = 'InvoiceAmountError';
		this.regionId = region.id;
	}
}

export const regionLabel = (region: InvoiceAmountRegion): string =>
	region.name || region.slug || region.id;

export const regionAmountError = (region: InvoiceAmountRegion): string =>
	`Regionen "${regionLabel(region)}" saknar medlemsavgift. Ange fältet "${FIELD_LABEL}" på regionen i DatoCMS.`;

export const regionAmountReadError = (region: InvoiceAmountRegion): string =>
	`Kunde inte läsa medlemsavgiften för regionen "${regionLabel(region)}". Försök igen.`;

/**
 * A usable amount is a finite number of at least 1 kr. Everything else — a missing
 * field, null, 0, a negative number, NaN or a non-numeric string — is invalid, so a
 * misconfigured region fails loudly instead of invoicing the wrong amount.
 */
export const parseInvoiceAmount = (raw: unknown): number | null => {
	const amount =
		typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
	if (!Number.isFinite(amount) || amount < 1) return null;
	return amount;
};

type RegionAmountRead =
	| { amount: number; error: null }
	| { amount: null; error: string };

const fetchRegionInvoiceAmount = async (
	region: InvoiceAmountRegion,
): Promise<RegionAmountRead> => {
	try {
		const record = (await client.items.find(region.id)) as unknown as { invoice_amount?: unknown };
		const amount = parseInvoiceAmount(record?.invoice_amount);
		return amount === null
			? { amount: null, error: regionAmountError(region) }
			: { amount, error: null };
	} catch (err: any) {
		console.warn(
			`[fortnox] could not read ${FIELD_LABEL} for region ${regionLabel(region)}: ${err?.message ?? err}`,
		);
		return { amount: null, error: regionAmountReadError(region) };
	}
};

/**
 * Read a region's annual amount without throwing — used where the value is only
 * displayed, or where an error must be reported instead of raised (the plugin page
 * shows the configured amount, or the reason it's missing).
 */
export const readRegionInvoiceAmount = async (
	region: InvoiceAmountRegion,
): Promise<{ amount: number | null; error: string | null }> => {
	const { amount, error } = await fetchRegionInvoiceAmount(region);
	return { amount, error };
};

/** Read a region's annual amount, throwing `InvoiceAmountError` when it isn't set. */
export const getRegionInvoiceAmount = async (region: InvoiceAmountRegion): Promise<number> => {
	const { amount, error } = await readRegionInvoiceAmount(region);
	if (amount === null) throw new InvoiceAmountError(region, error ?? undefined);
	return amount;
};

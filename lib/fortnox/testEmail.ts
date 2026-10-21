import client from '/lib/client';

/**
 * The test recipient is set per region in DatoCMS (`region.test_email`,
 * "Test email"). When it is set, the invoices plugin shows a "Testfaktura"
 * button that sends one invoice e-mail to that address instead of to the
 * member. When it is empty — or not an e-mail address — the button is hidden.
 */
export type TestEmailRegion = {
	id: string;
	slug?: string;
	name?: string;
};

const FIELD_LABEL = 'Test email';

/**
 * Field value → a usable e-mail address, or null. Trims and lowercases, and
 * rejects anything that is not a plausible address so a typo in DatoCMS hides
 * the button instead of failing at send time.
 */
export const normalizeTestEmail = (raw: unknown): string | null => {
	if (typeof raw !== 'string') return null;
	const email = raw.trim().toLowerCase();
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

/** Read a region's test recipient. Never throws — no usable address means null. */
export const getRegionTestEmail = async (region: TestEmailRegion): Promise<string | null> => {
	try {
		const record = (await client.items.find(region.id)) as unknown as {
			test_email?: unknown;
		};
		return normalizeTestEmail(record?.test_email);
	} catch (err: any) {
		console.warn(
			`[fortnox] could not read "${FIELD_LABEL}" for region ${
				region.name || region.slug || region.id
			}: ${err?.message ?? err}`,
		);
		return null;
	}
};

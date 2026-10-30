import regions from '../../regions.json';

export const FORTNOX_API_BASE = 'https://api.fortnox.se/3';
export const FORTNOX_TOKEN_URL = 'https://apps.fortnox.se/oauth-v1/token';
export const FORTNOX_AUTH_URL = 'https://apps.fortnox.se/oauth-v1/auth';

export const FORTNOX_CLIENT_ID = process.env.FORTNOX_CLIENT_ID;
export const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET;
export const FORTNOX_REDIRECT_URI = process.env.FORTNOX_REDIRECT_URI;

// Invoice defaults. The amount itself is *not* configured here — it is read per
// region from DatoCMS (`region.invoice_amount`, "Medlemsavgift per år") via
// `lib/fortnox/invoiceAmount.ts`. A region without an amount cannot be invoiced.
export const FORTNOX_INVOICE_DUE_DAYS = 30;

/**
 * Sales account (BAS-konto) for the membership fee row.
 *
 * Fortnox falls back to the company's *default* sales account when a row has no
 * AccountNumber, and that default being missing/inactive fails the whole invoice
 * (Fortnox error 2001304: "Förvalt konto för Försäljning är inaktivt eller finns
 * inte i kontoplanen"). 3013 is the account the association has historically used
 * for medlemsavgift (visible on the 2021 membership invoices).
 *
 * Override per region with `FORTNOX_<REGION>_INVOICE_ACCOUNT`, or for all regions
 * with `FORTNOX_INVOICE_ACCOUNT`. Read lazily so tests can mutate the env.
 */
export const FORTNOX_INVOICE_ACCOUNT = 3013;

export const getInvoiceAccountNumber = (regionSlug: string): number => {
	const raw =
		process.env[`FORTNOX_${regionSlug.toUpperCase()}_INVOICE_ACCOUNT`] ??
		process.env.FORTNOX_INVOICE_ACCOUNT;
	if (!raw) return FORTNOX_INVOICE_ACCOUNT;
	const account = Number(raw);
	return Number.isInteger(account) && account > 0 ? account : FORTNOX_INVOICE_ACCOUNT;
};

/**
 * Comma-separated allowlist of member emails that may receive an emailed
 * invoice. When set, only members whose email is in the list get the Fortnox
 * email; everyone else's invoice is created but not emailed. When empty/unset,
 * all eligible members are emailed.
 *
 * Read lazily so tests can mutate the env between assertions.
 */
export const getEmailAllowlist = (): string[] =>
	(process.env.FORTNOX_EMAIL_ALLOWLIST ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);

export const isEmailAllowedToSend = (email?: string): boolean => {
	const allowlist = getEmailAllowlist();
	return allowlist.length === 0 || (email ? allowlist.includes(email.toLowerCase()) : false);
};

/**
 * Regions allowed to use the Fortnox integration — defined in
 * `lib/fortnox/enabledRegions.ts` (env-free, so the browser plugin can share
 * the same allowlist) and re-exported here for the server-side callers.
 */
export { FORTNOX_ENABLED_REGIONS, isFortnoxEnabled } from './enabledRegions';

/**
 * Region slugs in the system, mapped to the env prefix used for their
 * Fortnox OAuth tokens. The region `name` in regions.json may differ
 * (Öst vs ost), so we key off the stable `slug`.
 */
export const regionSlugs = regions.map((r) => r.slug);

export const fortnoxTokenEnvKey = (regionSlug: string, kind: 'ACCESS' | 'REFRESH') =>
	`FORTNOX_${regionSlug.toUpperCase()}_${kind}_TOKEN`;

export const getFortnoxTokenFromEnv = (
	regionSlug: string,
	kind: 'ACCESS' | 'REFRESH',
): string | undefined => process.env[fortnoxTokenEnvKey(regionSlug, kind)];

export const clientCredentials = (): { id: string; secret: string } => {
	const id = process.env.FORTNOX_CLIENT_ID;
	const secret = process.env.FORTNOX_CLIENT_SECRET;
	if (!id || !secret)
		throw new Error('FORTNOX_CLIENT_ID and FORTNOX_CLIENT_SECRET must be set in .env');
	return { id, secret };
};

export const getFortnoxWebappId = (regionSlug?: string) => {
	// const env = Object.keys(process.env).find(
	// 	(k) => k === `NEXT_PUBLIC_FORTNOX_${region.toUpperCase()}_WEBAPP_ID`,
	// );
	return process.env.NEXT_PUBLIC_FORTNOX_OST_WEBAPP_ID;
};

export const getFortnoxInvoiceUrl = (invoiceId: string, regionSlug: string) => {
	const webappId = getFortnoxWebappId(regionSlug);
	return `https://apps.fortnox.se/app/${webappId}/kf/invoice/${invoiceId}`;
};

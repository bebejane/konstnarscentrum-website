import regions from '../../regions.json';

export const FORTNOX_API_BASE = 'https://api.fortnox.se/3';
export const FORTNOX_TOKEN_URL = 'https://apps.fortnox.se/oauth-v1/token';
export const FORTNOX_AUTH_URL = 'https://apps.fortnox.se/oauth-v1/auth';

export const FORTNOX_CLIENT_ID = process.env.FORTNOX_CLIENT_ID;
export const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET;
export const FORTNOX_REDIRECT_URI = process.env.FORTNOX_REDIRECT_URI;

// Invoice defaults (hardcoded for now)
export const FORTNOX_INVOICE_AMOUNT = 250;
export const FORTNOX_INVOICE_DUE_DAYS = 30;

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
 * Regions allowed to use the Fortnox integration. Add a region's slug
 * (e.g. 'ost', 'vast') as it comes onboard; regions not listed are excluded
 * even if they have OAuth tokens configured in .env.
 */
export const FORTNOX_ENABLED_REGIONS: string[] = ['ost'];

export const isFortnoxEnabled = (regionSlug: string): boolean =>
	FORTNOX_ENABLED_REGIONS.includes(regionSlug);

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

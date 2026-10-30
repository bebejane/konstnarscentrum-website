/**
 * Regions allowed to use the Fortnox integration. Add a region's slug
 * (e.g. 'ost', 'vast') as it comes onboard; regions not listed are excluded
 * even if they have OAuth tokens configured in .env.
 *
 * Deliberately free of env access (`process.env` / node APIs) so the DatoCMS
 * plugin — which runs in the browser — can import the same allowlist that the
 * API routes enforce. `lib/fortnox/constants.ts` re-exports these.
 */
export const FORTNOX_ENABLED_REGIONS: string[] = ['ost'];

export const isFortnoxEnabled = (regionSlug: string): boolean =>
	FORTNOX_ENABLED_REGIONS.includes(regionSlug);

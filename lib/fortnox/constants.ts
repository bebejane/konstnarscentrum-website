import regions from '../../regions.json'

export const FORTNOX_API_BASE = 'https://api.fortnox.se/3'
export const FORTNOX_TOKEN_URL = 'https://apps.fortnox.se/oauth-v1/token'
export const FORTNOX_AUTH_URL = 'https://apps.fortnox.se/oauth-v1/auth'

export const FORTNOX_CLIENT_ID = process.env.FORTNOX_CLIENT_ID
export const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET
export const FORTNOX_REDIRECT_URI = process.env.FORTNOX_REDIRECT_URI

// Invoice defaults (hardcoded for now)
export const FORTNOX_INVOICE_ACCOUNT = Number(process.env.FORTNOX_INVOICE_ACCOUNT ?? 0)
export const FORTNOX_INVOICE_AMOUNT = Number(process.env.FORTNOX_INVOICE_AMOUNT ?? 0)
export const FORTNOX_INVOICE_DUE_DAYS = Number(process.env.FORTNOX_INVOICE_DUE_DAYS ?? 30)

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
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

export const isEmailAllowedToSend = (email?: string): boolean => {
  const allowlist = getEmailAllowlist()
  return allowlist.length === 0 || (email ? allowlist.includes(email.toLowerCase()) : false)
}

/**
 * Regions allowed to use the Fortnox integration. Add a region's slug
 * (e.g. 'ost', 'vast') as it comes onboard; regions not listed are excluded
 * even if they have OAuth tokens configured in .env.
 */
export const FORTNOX_ENABLED_REGIONS: string[] = ['ost']

export const isFortnoxEnabled = (regionSlug: string): boolean =>
  FORTNOX_ENABLED_REGIONS.includes(regionSlug)

/**
 * Region slugs in the system, mapped to the env prefix used for their
 * Fortnox OAuth tokens. The region `name` in regions.json may differ
 * (Öst vs ost), so we key off the stable `slug`.
 */
export const regionSlugs = regions.map(r => r.slug)

export const fortnoxTokenEnvKey = (regionSlug: string, kind: 'ACCESS' | 'REFRESH') =>
  `FORTNOX_${regionSlug.toUpperCase()}_${kind}_TOKEN`

export const getFortnoxTokenFromEnv = (regionSlug: string, kind: 'ACCESS' | 'REFRESH'): string | undefined =>
  process.env[fortnoxTokenEnvKey(regionSlug, kind)]

export const clientCredentials = (): { id: string; secret: string } => {
  if (!FORTNOX_CLIENT_ID || !FORTNOX_CLIENT_SECRET)
    throw new Error('FORTNOX_CLIENT_ID and FORTNOX_CLIENT_SECRET must be set in .env')
  return { id: FORTNOX_CLIENT_ID, secret: FORTNOX_CLIENT_SECRET }
}

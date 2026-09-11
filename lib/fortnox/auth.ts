import {
  FORTNOX_TOKEN_URL,
  clientCredentials,
  fortnoxTokenEnvKey,
  getFortnoxTokenFromEnv,
  isFortnoxEnabled
} from './constants'
import { hasKvStore, persistRefreshToken, readRefreshTokenFromEnv, readStoredRefreshToken } from './tokenStore'

type CachedToken = {
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

/**
 * In-memory cache of the freshest tokens per region. Kept so repeated calls
 * within the same process reuse a valid access token instead of refreshing
 * (and rotating) the refresh token on every single request.
 */
const tokenCache: Record<string, CachedToken> = {}

const ACCESS_TOKEN_TTL_MS = 4.5 * 60 * 1000 // Fortnox access tokens expire after ~5 min

const getRefreshTokenForRegion = async (regionSlug: string): Promise<string | undefined> =>
  tokenCache[regionSlug]?.refreshToken ?? (await readStoredRefreshToken(regionSlug))

/**
 * Exchange a refresh token for a fresh access token + rotated refresh token.
 * Fortnox access tokens expire after ~5 minutes.
 */
const refreshAccessToken = async (regionSlug: string): Promise<{ accessToken: string; refreshToken?: string }> => {
  const refreshToken = await getRefreshTokenForRegion(regionSlug)

  if (!refreshToken)
    throw new Error(`No FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN configured in .env`)

  const { id, secret } = clientCredentials()
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  })

  const res = await fetch(FORTNOX_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
    },
    body
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fortnox token refresh failed (${res.status}): ${text}`)
  }

  const data = await res.json()

  if (!data.access_token)
    throw new Error('Fortnox token refresh returned no access_token')

  return { accessToken: data.access_token, refreshToken: data.refresh_token }
}

/**
 * Get a valid access token for a region's Fortnox account.
 *
 * 1. Returns a cached, still-valid access token if present.
 * 2. Otherwise refreshes using the newest known refresh token (cached, KV, or
 *    `.env`), caches both, and persists the rotated refresh token (to KV on
 *    Vercel, `.env` locally — see `tokenStore`).
 * 3. Falls back to the static access token in `.env` if refresh fails.
 */
export const getAccessToken = async (regionSlug: string): Promise<string> => {
  const cached = tokenCache[regionSlug]
  if (cached?.accessToken && Date.now() < cached.expiresAt)
    return cached.accessToken

  const refreshOnce = async (): Promise<string> => {
    const { accessToken, refreshToken } = await refreshAccessToken(regionSlug)
    tokenCache[regionSlug] = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS
    }
    if (refreshToken) await persistRefreshToken(regionSlug, refreshToken)
    return accessToken
  }

  try {
    return await refreshOnce()
  } catch (err) {
    // A concurrent lambda may have rotated the refresh token mid-flight,
    // invalidating the token we just used. Re-read KV and retry once.
    const errMessage = err instanceof Error ? err.message : String(err)
    console.warn(`[fortnox] refresh failed for ${regionSlug}: ${errMessage}; retrying via KV`)
    if (hasKvStore()) {
      tokenCache[regionSlug] = { accessToken: '', refreshToken: undefined, expiresAt: 0 }
      try {
        return await refreshOnce()
      } catch (retryErr) {
        const retryMessage = retryErr instanceof Error ? retryErr.message : String(retryErr)
        console.warn(`[fortnox] KV retry failed for ${regionSlug}: ${retryMessage}; falling back to static access token`)
      }
    }
    // Fall back to the statically configured access token
    const accessToken = getFortnoxTokenFromEnv(regionSlug, 'ACCESS')
    if (accessToken) return accessToken
    throw err
  }
}

export const hasFortnoxCredentials = (regionSlug: string): boolean =>
  isFortnoxEnabled(regionSlug) &&
  !!(getFortnoxTokenFromEnv(regionSlug, 'ACCESS') || readRefreshTokenFromEnv(regionSlug))

export { fortnoxTokenEnvKey }
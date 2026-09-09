import {
  FORTNOX_TOKEN_URL,
  clientCredentials,
  fortnoxTokenEnvKey,
  getFortnoxTokenFromEnv,
  isFortnoxEnabled
} from './constants'

/**
 * Exchange a refresh token (or refresh the stored one) for a fresh access token.
 * Fortnox access tokens expire after ~5 minutes.
 */
const refreshAccessToken = async (regionSlug: string): Promise<string> => {
  const refreshToken = getFortnoxTokenFromEnv(regionSlug, 'REFRESH')

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

  return data.access_token
}

/**
 * Get a valid access token for a region's Fortnox account.
 *
 * Access tokens in `.env` are static and must be refreshed by the operator
 * after updating `.env`. Because the token is read server-side and Fortnox
 * short-lived tokens are refreshed on demand, we always attempt a refresh
 * from the stored refresh token to get a fresh one, falling back to the
 * static access token if refresh fails.
 */
export const getAccessToken = async (regionSlug: string): Promise<string> => {
  try {
    return await refreshAccessToken(regionSlug)
  } catch (err) {
    // Fall back to the statically configured access token
    const accessToken = getFortnoxTokenFromEnv(regionSlug, 'ACCESS')
    if (accessToken) return accessToken
    throw err
  }
}

export const hasFortnoxCredentials = (regionSlug: string): boolean =>
  isFortnoxEnabled(regionSlug) &&
  !!(getFortnoxTokenFromEnv(regionSlug, 'ACCESS') || getFortnoxTokenFromEnv(regionSlug, 'REFRESH'))

export { fortnoxTokenEnvKey }

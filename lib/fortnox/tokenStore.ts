import * as fs from 'fs'
import * as path from 'path'

/**
 * Fortnox token persistence.
 *
 * Fortnox rotates refresh tokens on every OAuth refresh: each successful
 * `refresh_token` exchange returns a NEW refresh token and invalidates the old
 * one. If we never store the rotated token, the one configured in env goes
 * stale after its first use and the next run fails.
 *
 * Two backends, selected at runtime:
 *  - Local runs (dev / scripts): write the rotated token back to `.env`.
 *  - Vercel: persist to an Upstash REST (Vercel KV) store so the value
 *    survives cold starts, configured via `KV_REST_API_URL` +
 *    `KV_REST_API_TOKEN`. The env refresh token acts as the bootstrap value
 *    on the first run; afterwards the freshest token lives in KV.
 *
 * KV is preferred whenever its env vars are present, so local runs that also
 * define KV would write there instead of `.env`.
 */

const envFile = () => path.resolve(process.cwd(), '.env')

const envTokenKey = (regionSlug: string) => `FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN`

export const canPersistTokens = (): boolean =>
  !process.env.VERCEL && typeof process !== 'undefined'

export const hasKvStore = (): boolean =>
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN

const kvKey = (regionSlug: string) => `fortnox:${regionSlug.toUpperCase()}:refresh_token`

const kvGet = async (regionSlug: string): Promise<string | undefined> => {
  const base = process.env.KV_REST_API_URL!.replace(/\/+$/, '')
  const res = await fetch(`${base}/get/${kvKey(regionSlug)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  })
  if (!res.ok) throw new Error(`KV get failed (${res.status})`)
  const data = (await res.json()) as { result?: unknown }
  return typeof data.result === 'string' && data.result ? data.result : undefined
}

const kvSet = async (regionSlug: string, value: string): Promise<void> => {
  const base = process.env.KV_REST_API_URL!.replace(/\/+$/, '')
  const res = await fetch(
    `${base}/set/${kvKey(regionSlug)}/${encodeURIComponent(value)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    }
  )
  if (!res.ok) throw new Error(`KV set failed (${res.status})`)
}

/**
 * Read the refresh token configured in `.env` (or the current process env).
 * Used as the sync bootstrap for credential checks and as the KV fallback.
 */
export const readRefreshTokenFromEnv = (regionSlug: string): string | undefined =>
  process.env[envTokenKey(regionSlug)]

/**
 * Read the freshest known refresh token: KV first, then the env value.
 */
export const readStoredRefreshToken = async (regionSlug: string): Promise<string | undefined> => {
  if (hasKvStore()) {
    try {
      const stored = await kvGet(regionSlug)
      if (stored) return stored
    } catch (err: any) {
      console.warn(`[fortnox] could not read refresh token from KV: ${err?.message ?? err}`)
    }
  }
  return readRefreshTokenFromEnv(regionSlug)
}

/**
 * Persist the latest refresh token: KV when configured, otherwise `.env`.
 * Returns true on success.
 */
export const persistRefreshToken = async (
  regionSlug: string,
  refreshToken: string
): Promise<boolean> => {
  if (!refreshToken) return false

  if (hasKvStore()) {
    try {
      await kvSet(regionSlug, refreshToken)
      process.env[envTokenKey(regionSlug)] = refreshToken
      return true
    } catch (err: any) {
      console.warn(`[fortnox] could not persist refresh token to KV: ${err?.message ?? err}`)
    }
  }

  return persistRefreshTokenToEnv(regionSlug, refreshToken)
}

/**
 * Best-effort: update (or append) `FORTNOX_<REGION>_REFRESH_TOKEN` in `.env`
 * and reflect it into the current process's env. Returns true on success.
 */
export const persistRefreshTokenToEnv = (
  regionSlug: string,
  refreshToken: string
): boolean => {
  if (!refreshToken) return false
  if (!canPersistTokens()) return false

  const file = envFile()
  try {
    if (!fs.existsSync(file)) return false

    const key = envTokenKey(regionSlug)
    const content = fs.readFileSync(file, 'utf8')
    const re = new RegExp(`^(${key}=).*$`, 'm')

    const updated = re.test(content)
      ? content.replace(re, `$1${refreshToken}`)
      : `${content.replace(/\s*$/, '\n')}${key}=${refreshToken}\n`

    fs.writeFileSync(file, updated)
    process.env[key] = refreshToken
    return true
  } catch (err: any) {
    console.warn(`[fortnox] could not persist refresh token to .env: ${err?.message ?? err}`)
    return false
  }
}
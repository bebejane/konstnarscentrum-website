import * as fs from 'fs'
import * as path from 'path'
import { eq } from 'drizzle-orm'

import { db, ensureDbSchema, fortnoxTokens, hasDb } from '../db'

export { hasDb } from '../db'

/**
 * Fortnox token persistence.
 *
 * Fortnox rotates refresh tokens on every OAuth refresh: each successful
 * `refresh_token` exchange returns a NEW refresh token and invalidates the old
 * one. If we never store the rotated token, the one configured in env goes
 * stale after its first use and the next run fails.
 *
 * Two backends, selected at runtime:
 *  - Turso database (preferred): a `fortnox_tokens` row per region, used when
 *    `TURSO_DATABASE_URL` is set (local dev can use `file:local.db`).
 *  - Local fallback: write the rotated token back to `.env`
 *    (`FORTNOX_<REGION>_REFRESH_TOKEN`), used when no database is configured.
 *
 * The env refresh token acts as the bootstrap value on the first run;
 * afterwards the freshest token lives in the database.
 */

const envFile = () => path.resolve(process.cwd(), '.env')

const envTokenKey = (regionSlug: string) => `FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN`

export const canPersistTokens = (): boolean =>
  !process.env.VERCEL && typeof process !== 'undefined'

const dbGet = async (regionSlug: string): Promise<string | undefined> => {
  await ensureDbSchema()
  const rows = await db()
    .select({ refreshToken: fortnoxTokens.refreshToken })
    .from(fortnoxTokens)
    .where(eq(fortnoxTokens.region, regionSlug))
    .limit(1)
  return rows[0]?.refreshToken
}

const dbSet = async (regionSlug: string, refreshToken: string): Promise<void> => {
  await ensureDbSchema()
  await db()
    .insert(fortnoxTokens)
    .values({ region: regionSlug, refreshToken, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: fortnoxTokens.region,
      set: { refreshToken, updatedAt: new Date() },
    })
}

/**
 * Read the refresh token configured in `.env` (or the current process env).
 * Used as the sync bootstrap for credential checks and as the DB fallback.
 */
export const readRefreshTokenFromEnv = (regionSlug: string): string | undefined =>
  process.env[envTokenKey(regionSlug)]

/**
 * Read the refresh token stored in the database only (no .env fallback).
 * Returns undefined when no database is configured or no row exists.
 */
export const readRefreshTokenFromDb = async (regionSlug: string): Promise<string | undefined> => {
  if (!hasDb()) return undefined
  try {
    return await dbGet(regionSlug)
  } catch (err: any) {
    console.warn(`[fortnox] could not read refresh token from database: ${err?.message ?? err}`)
    return undefined
  }
}

/**
 * Read the freshest known refresh token: database first, then the env value.
 */
export const readStoredRefreshToken = async (regionSlug: string): Promise<string | undefined> => {
  if (hasDb()) {
    try {
      const stored = await dbGet(regionSlug)
      if (stored) return stored
    } catch (err: any) {
      console.warn(`[fortnox] could not read refresh token from database: ${err?.message ?? err}`)
    }
  }
  return readRefreshTokenFromEnv(regionSlug)
}

/**
 * Persist the latest refresh token: database when configured, otherwise `.env`.
 * Returns true on success.
 */
export const persistRefreshToken = async (
  regionSlug: string,
  refreshToken: string
): Promise<boolean> => {
  if (!refreshToken) return false

  if (hasDb()) {
    try {
      await dbSet(regionSlug, refreshToken)
      process.env[envTokenKey(regionSlug)] = refreshToken
      return true
    } catch (err: any) {
      console.warn(`[fortnox] could not persist refresh token to database: ${err?.message ?? err}`)
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
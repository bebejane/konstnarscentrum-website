import * as fs from 'fs'
import * as path from 'path'

/**
 * Persist a refreshed Fortnox refresh token back to `.env`.
 *
 * Fortnox rotates refresh tokens on every OAuth refresh. If we never store the
 * new refresh token, the one in `.env` goes stale after the first use and the
 * next run fails. On local dev / scripts we can safely write `.env`.
 *
 * On Vercel the filesystem is ephemeral and `.env` isn't readable/writable the
 * same way, so persistence is skipped there — a deployment still needs its
 * refresh token refreshed via the OAuth callback periodically (or a proper
 * token store).
 */
const envFile = () => path.resolve(process.cwd(), '.env')

export const canPersistTokens = (): boolean =>
  !process.env.VERCEL && typeof process !== 'undefined'

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

    const key = `FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN`
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
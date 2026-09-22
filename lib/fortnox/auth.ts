import {
	FORTNOX_TOKEN_URL,
	clientCredentials,
	fortnoxTokenEnvKey,
	getFortnoxTokenFromEnv,
	isFortnoxEnabled,
} from './constants';
import {
	hasKvStore,
	persistRefreshToken,
	readRefreshTokenFromEnv,
	readStoredRefreshToken,
} from './tokenStore';

type CachedToken = {
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
};

/**
 * In-memory cache of the freshest tokens per region. Kept so repeated calls
 * within the same process reuse a valid access token instead of refreshing
 * (and rotating) the refresh token on every single request.
 */
const tokenCache: Record<string, CachedToken> = {};

const ACCESS_TOKEN_TTL_MS = 4.5 * 60 * 1000; // Fortnox access tokens expire after ~5 min

/**
 * Per-region mutex: only one refresh runs at a time. Other callers await the
 * same promise instead of firing a duplicate request with the same (already
 * invalidated) refresh token.
 */
const inflightRefresh: Record<string, Promise<string> | undefined> = {};

const getRefreshTokenForRegion = async (regionSlug: string): Promise<string | undefined> =>
	tokenCache[regionSlug]?.refreshToken ?? (await readStoredRefreshToken(regionSlug));

/**
 * Exchange a refresh token for a fresh access token + rotated refresh token.
 * Fortnox access tokens expire after ~5 minutes.
 */
const refreshAccessToken = async (
	regionSlug: string,
	tokenOverride?: string,
): Promise<{ accessToken: string; refreshToken?: string }> => {
	const refreshToken = tokenOverride ?? (await getRefreshTokenForRegion(regionSlug));

	if (!refreshToken)
		throw new Error(`No FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN configured in .env`);

	const { id, secret } = clientCredentials();
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
	});

	const res = await fetch(FORTNOX_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
		},
		body,
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Fortnox token refresh failed (${res.status}): ${text}`);
	}

	const data = await res.json();

	if (!data.access_token) throw new Error('Fortnox token refresh returned no access_token');

	return { accessToken: data.access_token, refreshToken: data.refresh_token };
};

/**
 * Get a valid access token for a region's Fortnox account.
 *
 * 1. Returns a cached, still-valid access token if present.
 * 2. Otherwise refreshes using the newest known refresh token (cached, KV, or
 *    `.env`), caches both, and persists the rotated refresh token (to KV on
 *    Vercel, `.env` locally — see `tokenStore`).
 * 3. Falls back to the statically configured access token in `.env` if refresh fails.
 *
 * Concurrent callers share a single in-flight refresh promise per region so
 * that Fortnox's single-use refresh token is never sent twice.
 */
export const getAccessToken = async (regionSlug: string): Promise<string> => {
	const cached = tokenCache[regionSlug];
	if (cached?.accessToken && Date.now() < cached.expiresAt) return cached.accessToken;

	if (inflightRefresh[regionSlug]) return inflightRefresh[regionSlug]!;

	inflightRefresh[regionSlug] = (async () => {
		try {
			const { accessToken, refreshToken } = await refreshAccessToken(regionSlug);
			tokenCache[regionSlug] = {
				accessToken,
				refreshToken,
				expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
			};
			if (refreshToken) await persistRefreshToken(regionSlug, refreshToken);
			return accessToken;
		} catch (err) {
			const errMessage = err instanceof Error ? err.message : String(err);
			console.warn(`[fortnox] refresh failed for ${regionSlug}: ${errMessage}; retrying`);
			// KV-stored token may be stale (rotated by another run). Retry via KV
			// then fall back to the .env bootstrap value before giving up.
			if (hasKvStore()) {
				tokenCache[regionSlug] = { accessToken: '', refreshToken: undefined, expiresAt: 0 };
				try {
					const { accessToken, refreshToken } = await refreshAccessToken(regionSlug);
					tokenCache[regionSlug] = {
						accessToken,
						refreshToken,
						expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
					};
					if (refreshToken) await persistRefreshToken(regionSlug, refreshToken);
					return accessToken;
				} catch (retryErr) {
					const retryMessage = retryErr instanceof Error ? retryErr.message : String(retryErr);
					console.warn(`[fortnox] KV retry failed for ${regionSlug}: ${retryMessage}`);
				}
			}
			// Try the .env bootstrap token directly (KV may shadow a valid .env token)
			const envRefresh = readRefreshTokenFromEnv(regionSlug);
			if (envRefresh) {
				try {
					const { accessToken, refreshToken } = await refreshAccessToken(regionSlug, envRefresh);
					tokenCache[regionSlug] = {
						accessToken,
						refreshToken,
						expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
					};
					if (refreshToken) await persistRefreshToken(regionSlug, refreshToken);
					return accessToken;
				} catch (envErr) {
					const envMessage = envErr instanceof Error ? envErr.message : String(envErr);
					console.warn(`[fortnox] .env refresh failed for ${regionSlug}: ${envMessage}`);
				}
			}
			// Fall back to the statically configured access token
			const accessToken = getFortnoxTokenFromEnv(regionSlug, 'ACCESS');
			if (accessToken) return accessToken;
			throw err;
		} finally {
			inflightRefresh[regionSlug] = undefined;
		}
	})();

	return inflightRefresh[regionSlug]!;
};

export const hasFortnoxCredentials = (regionSlug: string): boolean =>
	isFortnoxEnabled(regionSlug) &&
	!!(getFortnoxTokenFromEnv(regionSlug, 'ACCESS') || readRefreshTokenFromEnv(regionSlug));

export { fortnoxTokenEnvKey };

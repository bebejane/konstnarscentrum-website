import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { db, ensureDbSchema, fortnoxTokens, hasDb } from '../db';
import { readRefreshTokenFromEnv } from '../fortnox/tokenStore';

/**
 * One-time migration of refresh tokens from Vercel KV → Turso.
 *
 * For every region with a token, copies the FRESHEST known token into
 * fortnox_tokens:
 *   1. KV (fortnox:<REGION>:refresh_token) if KV_REST_* are still set
 *   2. otherwise the .env bootstrap value
 *
 * Run BEFORE removing KV_REST_* from .env / Vercel:
 *
 *   pnpm db:backfill
 */

const kvGet = async (regionSlug: string): Promise<string | undefined> => {
	const base = process.env.KV_REST_API_URL?.replace(/\/+$/, '');
	const authToken = process.env.KV_REST_API_TOKEN;
	if (!base || !authToken) return undefined;
	const key = `fortnox:${regionSlug.toUpperCase()}:refresh_token`;
	const res = await fetch(`${base}/get/${key}`, {
		headers: { Authorization: `Bearer ${authToken}` },
	});
	if (!res.ok) return undefined;
	const data = (await res.json()) as { result?: unknown };
	return typeof data.result === 'string' && data.result ? data.result : undefined;
};

const main = async () => {
	if (!hasDb()) {
		console.error('TURSO_DATABASE_URL is not set in .env — add it first.');
		process.exit(1);
	}

	await ensureDbSchema();

	const regions = ['riks', 'nord', 'vast', 'mitt', 'ost', 'syd'];
	let copied = 0;
	let skipped = 0;

	for (const region of regions) {
		// KV holds the freshest rotated token; .env is the bootstrap.
		const kv = await kvGet(region);
		const env = readRefreshTokenFromEnv(region);
		const token = kv ?? env;

		if (!token) {
			skipped++;
			continue;
		}

		await db()
			.insert(fortnoxTokens)
			.values({ region, refreshToken: token, updatedAt: new Date() })
			.onConflictDoUpdate({
				target: fortnoxTokens.region,
				set: { refreshToken: token, updatedAt: new Date() },
			});

		console.log(`  ${region}: copied ${kv ? 'KV' : '.env'} token ${token.slice(0, 6)}…${token.slice(-4)}`);
		copied++;
	}

	console.log(`\nBackfill complete — ${copied} copied, ${skipped} no token.`);
	if (copied > 0) console.log('Now remove KV_REST_* from .env and Vercel, then run `pnpm fortnoxenv` to verify.');
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
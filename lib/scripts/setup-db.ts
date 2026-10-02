import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { db, ensureDbSchema, fortnoxTokens, hasDb } from '../db';

/**
 * Creates the fortnox_tokens table (idempotent) and lists existing rows.
 * Run after configuring TURSO_DATABASE_URL / TURSO_AUTH_TOKEN in .env:
 *
 *   pnpm db:setup
 */

const main = async () => {
	if (!hasDb()) {
		console.error('TURSO_DATABASE_URL is not set in .env — add it first.');
		process.exit(1);
	}

	await ensureDbSchema();
	const rows = await db().select().from(fortnoxTokens);
	console.log(`fortnox_tokens table ready — ${rows.length} row(s):`);
	for (const r of rows) {
		console.log(
			`  ${r.region}: ${r.refreshToken.slice(0, 6)}…${r.refreshToken.slice(-4)} (updated ${r.updatedAt.toISOString()})`,
		);
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
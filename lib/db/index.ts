import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

import { fortnoxTokens } from './schema';

export { fortnoxTokens };

/**
 * Turso database access (via Drizzle + @libsql/client).
 *
 * - Remote Turso: TURSO_DATABASE_URL=libsql://... + TURSO_AUTH_TOKEN
 * - Local dev without a Turso account: TURSO_DATABASE_URL=file:./local.db
 *   (auth token not required for file: URLs)
 *
 * When TURSO_DATABASE_URL is unset, hasDb() is false and callers fall back to
 * the .env token bootstrap (see lib/fortnox/tokenStore.ts).
 */

export const hasDb = (): boolean => !!process.env.TURSO_DATABASE_URL;

let _client: ReturnType<typeof createClient> | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

const createDb = () => {
	const url = process.env.TURSO_DATABASE_URL;
	if (!url) throw new Error('TURSO_DATABASE_URL is not set');
	_client ??= createClient({
		url,
		authToken: process.env.TURSO_AUTH_TOKEN,
	});
	return drizzle(_client);
};

export const db = (): ReturnType<typeof drizzle> => {
	_db ??= createDb();
	return _db;
};

let _schemaEnsured = false;

/**
 * Idempotent DDL. Runs once per process (lazily, before the first DB access);
 * CREATE TABLE IF NOT EXISTS is safe under concurrent cold starts.
 */
export const ensureDbSchema = async (): Promise<void> => {
	if (_schemaEnsured) return;
	await db().run(sql`
		CREATE TABLE IF NOT EXISTS fortnox_tokens (
			region TEXT PRIMARY KEY NOT NULL,
			refresh_token TEXT NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);
	_schemaEnsured = true;
};
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Durable storage for Fortnox refresh tokens, one row per region.
 *
 * Refresh tokens are single-use and rotated by Fortnox on every refresh, so
 * they must be persisted somewhere that survives cold starts and process
 * restarts. Previously Vercel KV (Upstash), now a Turso database.
 */
export const fortnoxTokens = sqliteTable('fortnox_tokens', {
	region: text('region').primaryKey(),
	refreshToken: text('refresh_token').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export type FortnoxToken = typeof fortnoxTokens.$inferSelect;
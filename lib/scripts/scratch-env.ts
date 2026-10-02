import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { getAccessToken } from '../fortnox/auth';
import { FORTNOX_API_BASE } from '../fortnox/constants';
import { hasDb, readStoredRefreshToken } from '../fortnox/tokenStore';

/**
 * Quick Fortnox diagnostics: token store status + direct API calls.
 *
 * Usage:
 *   npx tsx lib/scripts/scratch-env.ts            # region ost
 *   npx tsx lib/scripts/scratch-env.ts --region syd
 */

const flagValue = (args: string[], name: string): string | undefined => {
	const i = args.indexOf(name);
	return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};

const main = async () => {
	const region = flagValue(process.argv.slice(2), '--region') ?? 'ost';

	const backend = hasDb() ? 'database (Turso)' : '.env fallback';
	const stored = await readStoredRefreshToken(region);
	console.log(`region     : ${region}`);
	console.log(`token store: ${backend}`);
	console.log(`token      : ${stored ? `${stored.slice(0, 6)}…${stored.slice(-4)}` : '(none)'}`);

	const token = await getAccessToken(region);

	for (const path of ['/companyinformation', '/me']) {
		try {
			const res = await fetch(`${FORTNOX_API_BASE}${path}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const body = await res.text();
			console.log(`\n=== ${path} → ${res.status} ===`);
			console.log(body.slice(0, 800));
		} catch (err) {
			console.log(`\n=== ${path} → fetch error ===`);
			console.log(String(err));
		}
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
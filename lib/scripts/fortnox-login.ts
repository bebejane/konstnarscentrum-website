import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { FORTNOX_ENABLED_REGIONS } from '../fortnox/constants';

// NOTE: read from process.env directly — constants.ts captures FORTNOX_CLIENT_ID /
// FORTNOX_REDIRECT_URI at module-load time, before dotenv.config() above runs.
const FORTNOX_CLIENT_ID = process.env.FORTNOX_CLIENT_ID;
const FORTNOX_REDIRECT_URI = process.env.FORTNOX_REDIRECT_URI;

/**
 * Prints (and optionally opens) the Fortnox OAuth authorization URL, filled in
 * from .env (FORTNOX_CLIENT_ID + FORTNOX_REDIRECT_URI), so you can log in and
 * mint a fresh refresh token.
 *
 * The actual consent happens in the browser — Fortnox requires an interactive
 * login + approval, so this can't be a fully headless flow:
 *
 *   1. Run `pnpm dev` (so http://localhost:3000/api/fortnox/callback is live).
 *   2. Log into the FORTNOX company you want (sandbox or live) in the browser.
 *   3. Run `pnpm fortnoxlogin`, open the printed URL, approve the consent.
 *   4. The callback page prints FORTNOX_<REGION>_REFRESH_TOKEN=<...> → paste it
 *      into .env, then run `pnpm fortnoxenv` to verify + sync.
 *
 * Important: the token belongs to whichever company is logged in when you click
 * the URL — sandbox login gives a sandbox token, live login gives a live one.
 * `pnpm fortnoxenv` will tell you which one you actually got.
 *
 * Usage:
 *   pnpm fortnoxlogin                # print the URL (region ost)
 *   pnpm fortnoxlogin --region syd   # different region / state param
 *   pnpm fortnoxlogin --open         # also open it in the default browser (macOS)
 */

const USAGE = `
Usage: pnpm fortnoxlogin [options]

Print (and optionally open) the Fortnox OAuth authorization URL built from .env.

Options:
  --region <slug>   State param + which FORTNOX_<REGION>_REFRESH_TOKEN to expect.
                    Default: first enabled region (${FORTNOX_ENABLED_REGIONS.join(', ') || 'none'}).
  --open            Open the URL in the default browser (macOS \`open\`).
  -h, --help        Show this help.
`;

const flagValue = (args: string[], name: string): string | undefined => {
	const i = args.indexOf(name);
	return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};

const main = async (): Promise<number> => {
	const args = process.argv.slice(2);

	if (args.includes('--help') || args.includes('-h')) {
		console.log(USAGE);
		return 0;
	}

	if (!FORTNOX_CLIENT_ID) {
		console.error('FORTNOX_CLIENT_ID is missing from .env — set it first (see the Fortnox Developer Portal).');
		return 1;
	}
	const redirectUri = FORTNOX_REDIRECT_URI || 'http://localhost:3000/api/fortnox/callback';

	const region = flagValue(args, '--region') ?? FORTNOX_ENABLED_REGIONS[0] ?? 'ost';

	// Scopes must be %20-separated (Fortnox docs). companyinformation is needed
	// for GET /companyinformation; it must also be enabled on the integration.
	const url =
		`https://apps.fortnox.se/oauth-v1/auth?client_id=${FORTNOX_CLIENT_ID}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&scope=customer%20invoice%20companyinformation` +
		`&access_type=offline&response_type=code&state=${region}`;

	console.log(url);
	console.log(
		`\nExpected env key: FORTNOX_${region.toUpperCase()}_REFRESH_TOKEN\n` +
			`Make sure \`pnpm dev\` is running and you are logged into the target company\n` +
			`(sandbox or live) before clicking the URL.`,
	);

	if (args.includes('--open')) {
		await import('child_process').then(({ execSync }) => execSync(`open "${url}"`));
		console.log('Opened in default browser.');
	}

	return 0;
};

main()
	.then((code) => process.exit(code))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
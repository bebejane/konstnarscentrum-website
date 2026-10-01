import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { refreshAccessToken } from '../fortnox/auth';
import {
	FORTNOX_API_BASE,
	FORTNOX_ENABLED_REGIONS,
	regionSlugs,
} from '../fortnox/constants';
import {
	hasKvStore,
	persistRefreshToken,
	persistRefreshTokenToEnv,
	readStoredRefreshToken,
} from '../fortnox/tokenStore';

/**
 * Fortnox environment verifier / syncer.
 *
 * Reads the refresh token currently configured in .env, validates it against
 * Fortnox, reports which company (sandbox vs live) it belongs to, and keeps the
 * two token stores (.env + KV) consistent.
 *
 * Switching environment = edit FORTNOX_<REGION>_REFRESH_TOKEN in .env manually,
 * then run this script to verify and sync.
 *
 * Why this exists: KV is preferred over .env when reading tokens. If KV holds a
 * token for a DIFFERENT environment than .env (e.g. a rotated sandbox token
 * while .env has the live one), every call silently uses the KV token — you get
 * the "same company information" back no matter which token you configure.
 *
 * Usage:
 *   pnpm fortnoxenv                        # validate + report + sync .env token(s)
 *   pnpm fortnoxenv --region ost           # target a single region
 *   pnpm fortnoxenv --help                 # help
 */

const USAGE = `
Usage: pnpm fortnoxenv [options]

Report which Fortnox environment (sandbox vs live) the refresh token configured
in .env points to, and sync the (rotated) token to both .env and KV so the two
stores never diverge.

The token is always read from .env (FORTNOX_<REGION>_REFRESH_TOKEN). To switch
environment, edit .env manually, then run this script again.

Options:
  --region <slug>   Target a single region. Default: every enabled region that
                    has a token in .env.
  -h, --help        Show this help.
`;

type CompanyInfo = {
	CompanyName?: string | null;
	OrganizationNumber?: string | null;
	DatabaseNumber?: number | null;
};

type Environment = 'sandbox' | 'live' | 'unknown';

/** 555555-5555 is Fortnox's standard dev-company org number. */
const classifyEnvironment = (info: CompanyInfo): Environment => {
	const org = (info.OrganizationNumber ?? '').trim();
	const name = (info.CompanyName ?? '').toLowerCase();
	if (org === '555555-5555' || name.includes('(dev)')) return 'sandbox';
	if (org) return 'live';
	return 'unknown';
};

const short = (token?: string) =>
	token ? `${token.slice(0, 6)}…${token.slice(-4)}` : '(none)';

const fetchCompanyInfo = async (accessToken: string): Promise<CompanyInfo | undefined> => {
	const res = await fetch(`${FORTNOX_API_BASE}/companyinformation`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) return undefined;
	const data = await res.json();
	return data?.CompanyInformation;
};

const processRegion = async (regionSlug: string): Promise<boolean> => {
	const envKey = `FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN`;
	console.log(`\n=== ${regionSlug} ===`);

	const current = process.env[envKey];
	if (!current) {
		console.warn(`No ${envKey} in .env — nothing to do. Add a token, then run again.`);
		return false;
	}

	// Warn if KV still points at a different environment (the classic bug).
	if (hasKvStore()) {
		const stored = await readStoredRefreshToken(regionSlug);
		if (stored && stored !== current) {
			console.warn(
				`KV holds a different token (${short(stored)}) than .env (${short(current)}). ` +
					`Using the .env token and syncing KV to it.`,
			);
		}
	}

	console.log(`Validating .env token ${short(current)} against Fortnox…`);

	let accessToken: string;
	let rotated: string | undefined;
	try {
		({ accessToken, refreshToken: rotated } = await refreshAccessToken(regionSlug, current));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error(
			`Token invalid or already rotated (${msg}). Re-authorize against the company you want and paste the new token into .env.`,
		);
		return false;
	}

	const info = await fetchCompanyInfo(accessToken);
	if (!info) {
		console.error(
			`/companyinformation failed with the validated token — the token works but may be missing the "companyinformation" scope.`,
		);
		return false;
	}

	const env = classifyEnvironment(info);
	const envLabel =
		env === 'sandbox' ? 'SANDBOX (test company)' : env === 'live' ? 'LIVE (production company)' : 'UNKNOWN';
	console.log(`Company : ${info.CompanyName ?? '(no name)'}`);
	console.log(`Org no. : ${info.OrganizationNumber ?? '(none)'}`);
	console.log(`DB      : ${info.DatabaseNumber ?? '(none)'}`);
	console.log(`Env     : ${envLabel}`);

	// Fortnox rotates the refresh token on every refresh — persist the rotated
	// one to both stores so the stored token stays valid and they don't diverge.
	if (rotated) {
		const envOk = persistRefreshTokenToEnv(regionSlug, rotated);
		const kvOk = await persistRefreshToken(regionSlug, rotated);
		console.log(
			`Rotated token persisted → .env: ${envOk ? 'yes' : 'no'}, KV: ${kvOk ? 'yes' : 'no'} (${short(rotated)})`,
		);
	}

	return true;
};

const main = async (): Promise<number> => {
	const args = process.argv.slice(2);

	if (args.includes('--help') || args.includes('-h')) {
		console.log(USAGE);
		return 0;
	}

	const regionArg = (() => {
		const i = args.indexOf('--region');
		return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
	})();

	if (regionArg && !regionSlugs.includes(regionArg)) {
		console.error(`Unknown region "${regionArg}". Known: ${regionSlugs.join(', ')}`);
		return 2;
	}

	const targets = regionArg
		? [regionArg]
		: FORTNOX_ENABLED_REGIONS.filter((r) => process.env[`FORTNOX_${r.toUpperCase()}_REFRESH_TOKEN`]);

	if (targets.length === 0) {
		console.warn('No target region found. Use --region <slug> or configure a token in .env.');
		console.log(USAGE);
		return 2;
	}

	let ok = true;
	for (const region of targets) {
		if (!(await processRegion(region))) ok = false;
	}

	return ok ? 0 : 1;
};

main()
	.then((code) => process.exit(code))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
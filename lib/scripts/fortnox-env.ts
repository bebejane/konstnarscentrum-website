import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { refreshAccessToken } from '../fortnox/auth';
import {
	FORTNOX_API_BASE,
	FORTNOX_ENABLED_REGIONS,
	regionSlugs,
} from '../fortnox/constants';
import {
	hasDb,
	persistRefreshToken,
	persistRefreshTokenToEnv,
	readRefreshTokenFromDb,
} from '../fortnox/tokenStore';

/**
 * Fortnox environment verifier / syncer.
 *
 * Reports which Fortnox company (sandbox vs live) the active refresh token
 * belongs to, and keeps the two token stores (.env + database) consistent.
 *
 * The database always holds the FRESHEST token (Fortnox rotates the refresh
 * token on every refresh and persistence writes to the database), so:
 *
 *  - Candidate selection: an .env token that DIFFERS from the database token is
 *    treated as a "switch environment" signal (paste a token for the other
 *    company into .env, then run this). Otherwise the database token wins.
 *  - If the .env token turns out to be invalid (stale bootstrap), the script
 *    falls back to the database token and reconciles .env with it.
 *  - The rotated token is written back to BOTH .env and the database so the two
 *    stores never diverge.
 */

const USAGE = `
Usage: pnpm fortnoxenv [options]

Report which Fortnox environment (sandbox vs live) the active refresh token
belongs to, and sync the (rotated) token to both .env and the database.

Candidate selection:
  - An .env token that differs from the database token is a switch signal:
    it wins and is validated first.
  - If it is invalid (stale bootstrap), the database token (freshest) is used
    and .env is reconciled with it.

Options:
  --region <slug>   Target a single region. Default: every enabled region that
                    has a token in .env or the database.
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

const envKeyFor = (regionSlug: string) => `FORTNOX_${regionSlug.toUpperCase()}_REFRESH_TOKEN`;

const processRegion = async (regionSlug: string): Promise<boolean> => {
	console.log(`\n=== ${regionSlug} ===`);

	const envToken = process.env[envKeyFor(regionSlug)];
	const dbToken = await readRefreshTokenFromDb(regionSlug);

	if (!envToken && !dbToken) {
		console.warn(`No token for ${regionSlug} (neither .env nor database). Re-authorize and paste a token into .env, then run again.`);
		return false;
	}

	// .env differs from the database → treat .env as a switch signal and try it first.
	const switched = !!envToken && !!dbToken && envToken !== dbToken;
	let candidate = envToken ?? dbToken!;
	let candidateSource = switched
		? '.env (switch signal)'
		: dbToken
			? 'database (freshest)'
			: '.env (bootstrap)';

	if (switched) {
		console.warn(
			`Different tokens: database ${short(dbToken)} vs .env ${short(envToken)}. Trying .env first (switch signal).`,
		);
	}

	let accessToken: string;
	let rotated: string | undefined;
	let sourceUsed = candidateSource;

	try {
		({ accessToken, refreshToken: rotated } = await refreshAccessToken(regionSlug, candidate));
	} catch (err) {
		// .env candidate invalid → fall back to the freshest database token.
		if (dbToken && dbToken !== candidate) {
			console.warn(`.env token ${short(candidate)} is invalid — falling back to database token ${short(dbToken)}.`);
			try {
				({ accessToken, refreshToken: rotated } = await refreshAccessToken(regionSlug, dbToken));
				sourceUsed = 'database (fallback)';
			} catch (dbErr) {
				const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
				console.error(`Both .env and database tokens are invalid (${msg}). Re-authorize and paste a fresh token into .env.`);
				return false;
			}
		} else {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`Token invalid or already rotated (${msg}). Re-authorize and paste a fresh token into .env.`);
			return false;
		}
	}

	console.log(`Validated ${short(accessToken ? rotated ?? candidate : candidate)} via ${sourceUsed}…`);

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
	console.log(`Source  : ${sourceUsed}`);

	// Fortnox rotates the refresh token on every refresh — persist the rotated
	// one to both stores so the stored token stays valid and they don't diverge.
	if (rotated) {
		const envOk = persistRefreshTokenToEnv(regionSlug, rotated);
		const dbOk = await persistRefreshToken(regionSlug, rotated);
		console.log(
			`Rotated token persisted → .env: ${envOk ? 'yes' : 'no'}, DB: ${dbOk ? 'yes' : 'no'} (${short(rotated)})`,
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

	let targets: string[];
	if (regionArg) {
		targets = [regionArg];
	} else {
		targets = [];
		for (const r of FORTNOX_ENABLED_REGIONS) {
			if (process.env[envKeyFor(r)] || (await readRefreshTokenFromDb(r))) targets.push(r);
		}
	}

	if (targets.length === 0) {
		console.warn('No target region found. Use --region <slug> or configure a token in .env / the database.');
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
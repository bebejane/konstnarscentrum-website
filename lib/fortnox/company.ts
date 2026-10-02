import { fortnoxFetch } from './client';

export const getCompany = async (regionSlug: string): Promise<any> => {
	const res = await fortnoxFetch(regionSlug, '/companyinformation');
	return res?.CompanyInformation;
};

/**
 * Which Fortnox company a region's token currently points at. Lets the UI warn
 * which environment (sandbox vs live) operations would run against.
 */
export type RegionCompany = {
	companyName?: string;
	organizationNumber?: string;
	databaseNumber?: number;
	environment: 'sandbox' | 'live' | 'unknown';
};

/** 555555-5555 is Fortnox's standard dev-company org number. */
export const classifyCompanyEnvironment = (info: any): RegionCompany | null => {
	if (!info) return null;
	const org = (info.OrganizationNumber ?? '').trim();
	const name = (info.CompanyName ?? '').toLowerCase();
	const environment: RegionCompany['environment'] =
		org === '555555-5555' || name.includes('(dev)') ? 'sandbox' : org ? 'live' : 'unknown';
	return {
		companyName: info.CompanyName ?? '',
		organizationNumber: org,
		databaseNumber: info.DatabaseNumber ?? undefined,
		environment,
	};
};
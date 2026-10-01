import { fortnoxFetch } from './client';

export const getCompany = async (regionSlug: string): Promise<any> => {
	const res = await fortnoxFetch(regionSlug, '/companyinformation');
	return res?.CompanyInformation;
};

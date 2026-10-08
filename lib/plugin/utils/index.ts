import regions from '../../../regions.json';
export const isDev = document.location.hostname === 'localhost';
export const siteUrl = isDev ? 'http://localhost:3000' : 'https://www.konstnarscentrum.org';

export const regionFromRoleName = (role: string) => {
	const roleName = role.toLowerCase() === 'admin' ? 'ost' : role.toLowerCase();
	const region = regions.find((r) => r.slug.toLowerCase() === roleName);
	return region;
};

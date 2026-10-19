import regions from '../../../regions.json';
export const isDev = document.location.hostname === 'localhost';
export const siteUrl = isDev ? 'http://localhost:3000' : 'https://www.konstnarscentrum.org';

export const regionFromRoleName = (role: string) => {
	const roleName = role.toLowerCase() === 'admin' ? 'ost' : role.toLowerCase();
	const region = regions.find((r) => r.slug.toLowerCase() === roleName);
	return region;
};

export const basicAuthHeader = (parameters: Record<string, unknown>) => {
	const { basicAuthUsername, basicAuthPassword } = parameters as {
		basicAuthUsername?: string;
		basicAuthPassword?: string;
	};
	return 'Basic ' + btoa(`${basicAuthUsername}:${basicAuthPassword}`);
};

export const filenameFromDisposition = (disposition: string | null) => {
	const match = disposition ? /filename="?([^";]+)"?/i.exec(disposition) : null;
	return match?.[1] ?? 'medlemmar.xlsx';
};

export const downloadBlob = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};

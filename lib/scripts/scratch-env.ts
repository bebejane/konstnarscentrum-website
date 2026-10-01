import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { getAccessToken } from '../fortnox/auth';
import { FORTNOX_API_BASE } from '../fortnox/constants';

const main = async () => {
	const token = await getAccessToken('ost');
	for (const path of ['/meta', '/me', '/settings', '/companies', '/companyinformation']) {
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
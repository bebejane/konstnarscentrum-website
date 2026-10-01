import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { buildClient } from '@datocms/cma-client-node';

const client = buildClient({
	apiToken: process.env.GRAPHQL_API_TOKEN_FULL,
	environment: process.env.DATOCMS_ENVIRONMENT!,
});

(async () => {
	console.log('environment:', process.env.DATOCMS_ENVIRONMENT);
	const models = await client.itemTypes.list();
	const matches = models.filter((m) => /variant|product/i.test(m.api_key) || /variant|produkt/i.test(m.name));
	console.log(
		'matching models:',
		matches.map((m) => ({ api_key: m.api_key, name: m.name, id: m.id }))
	);
	console.log(
		'all models:',
		models.map((m) => m.api_key)
	);
	for (const m of matches) {
		const fields = await client.fields.list(m.id);
		console.log(
			`fields for ${m.api_key}:`,
			fields.map((f) => ({ api_key: f.api_key, label: f.label, type: f.field_type }))
		);
	}
})().catch((e) => {
	console.error(e);
	process.exit(1);
});

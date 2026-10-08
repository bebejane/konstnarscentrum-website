require('dotenv').config({ path: './.env' });
const fs = require('fs');
const slugify = require('slugify');
const { buildClient } = require('@datocms/cma-client-node');

(async () => {
	const client = buildClient({
		apiToken: process.env.GRAPHQL_API_TOKEN_FULL,
		environment: process.env.DATOCMS_ENVIRONMENT,
	});

	const roles = await client.roles.list();
	const editor = roles.filter((r) => r.name.toLowerCase() === 'editor')[0];
	const tokens = await client.accessTokens.list();
	const users = await client.users.list();

	const districts = await client.items.list({
		filter: { type: 'region' },
		order_by: 'position_DESC',
	});

	const regions = roles
		.filter((r) => r.inherits_permissions_from?.find(({ id }) => id === editor.id))
		.sort((a, b) => (a.name < b.name ? -1 : 1))
		.map(({ id: roleId, name }) => ({
			id: districts.find((el) => el.slug === slugify(name, { lower: true })).id,
			roleId,
			name,
			userId: users.find((el) => el.role.id === roleId && el.email !== 'bjornthief@gmail.com')?.id,
			userName: users.find((el) => el.role.id === roleId && el.email !== 'bjornthief@gmail.com')
				?.full_name,
			//userId: users.find((el) => el.role.id === roleId)?.id,
			email: districts.find((el) => el.slug === slugify(name, { lower: true })).email,
			tokenId: tokens.find((t) => t.role?.id === roleId)?.id,
			slug: slugify(name, { lower: true }),
			global: districts.find((el) => el.slug === slugify(name, { lower: true })).global || false,
			position: districts.find((el) => el.slug === slugify(name, { lower: true })).position,
		}))
		.sort((a, b) => (a.position > b.position ? 1 : -1));

	if (!regions.length) throw new Error('No regions found!');

	fs.writeFileSync('regions.json', JSON.stringify(regions, null, 2));
	console.log(`generated regions.json (${regions.length})`);
})();

/*
const prebuildOld = async () => {
	console.log("generate regions.json");
	const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN });
	const roles = await client.roles.list();
	const tokens = await client.accessTokens.list();
	const editor = roles.filter((r) => r.name.toLowerCase() === "editor")[0];
	const regions = roles
		.filter((r) => r.inherits_permissions_from?.find(({ id }) => id === editor.id))
		.sort((a, b) => (a.name < b.name ? -1 : 1))
		.map(({ id, name }) => ({
			id,
			tokenId: tokens.find((t) => t.role?.id === id)?.id,
			name,
			slug: slugify(name, { lower: true }),
		}));

	if (!regions.length) throw new Error("No regions found!");

	fs.writeFileSync("regions.json", JSON.stringify(regions, null, 2));
	console.log("done!", regions.length);
};
*/

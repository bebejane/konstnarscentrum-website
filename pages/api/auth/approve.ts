import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { Email } from '/lib/emails';
import client, { buildClient } from '/lib/client';
import { regions } from '/lib/region';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await NextCors(req, res, {
		methods: ['POST', 'GET', 'HEAD', 'OPTIONS'],
		origin: '*',
		optionsSuccessStatus: 200,
	});

	try {
		const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
		const { id, region: regionId, approval_token, first_name, last_name, approved, ping } = body;
		const email = body?.email?.toLowerCase();

		if (ping) {
			console.log('ping endpoint');
			return res.status(200).json({ pong: true });
		}

		console.log('approve application', email);

		const basicAuth = req.headers.authorization;

		if (!basicAuth) {
			console.error('Access denied: no headers');
			return res.status(401).json({ error: 'Access denied' });
		}

		const auth = basicAuth.split(' ')[1];
		const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
		const isAuthorized =
			user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD;

		if (!isAuthorized) {
			console.error(
				'Access denied: wrong user/pass',
				process.env.BASIC_AUTH_USER,
				process.env.BASIC_AUTH_PASSWORD,
			);
			return res.status(401).send('Access denied');
		}

		if (!email || !approval_token || !first_name || !last_name) throw 'Ogitltig data';

		const region = regions.find((el) => el.id === regionId);
		if (!region) throw 'Ogiltig region';

		const accessTokens = await client.accessTokens.list();
		const accessToken = accessTokens.find((t) => t.role?.id === region.roleId).token;
		const models = await client.itemTypes.list();
		const memberModelId = models.find((el) => el.api_key === 'member')?.id;

		const roleClient = buildClient({
			apiToken: accessToken,
			environment: process.env.DATOCMS_ENVIRONMENT ?? 'main',
		});

		const application = await roleClient.items.find(id);
		if (!application) throw 'Ogiltig ansökan';
		let member = (
			await roleClient.items.list({
				filter: { type: 'member', fields: { email: { eq: application.email } } },
			})
		)?.[0];

		if (!member) {
			let slug = slugify(`${application.first_name} ${application.last_name}`, {
				lower: true,
				trim: true,
				strict: true,
			});

			for (
				let i = 0;
				(await client.items.list({ filter: { type: 'member', fields: { slug: { eq: slug } } } }))
					.length > 0;
				i++
			) {
				slug = slugify(`${application.first_name} ${application.last_name}`, {
					lower: true,
					trim: true,
					strict: true,
				});
			}

			member = await roleClient.items.create({
				item_type: { type: 'item_type', id: memberModelId },
				first_name: application.first_name,
				last_name: application.last_name,
				full_name: `${application.first_name} ${application.last_name}`,
				region: region.id,
				slug,
				email: application.email,
				application: application.id,
			});
		}

		await Email.applicationApproved({
			email,
			token: approval_token,
			name: `${first_name} ${last_name}`,
		});
		console.log('application successfully approved', email);
		res.status(200).json({ approved });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err?.message || err });
	}
}

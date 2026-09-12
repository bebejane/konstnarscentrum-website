import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { regions } from '/lib/region';
import client from '/lib/client';
import { parseDatoError } from '/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await NextCors(req, res, { methods: ['POST', 'GET'], origin: '*', optionsSuccessStatus: 200 });

	try {
		const payload = req.body;

		if (req.body.ping) return res.status(200).json({ pong: true });

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

		console.log('upload webhook');

		const tags = payload.entity.attributes.tags ?? [];
		const uploadId = payload.entity.id;
		const isUpload = tags.includes('upload');
		const region = regions.find(({ name }) => tags.includes(name.toLowerCase()));

		if (isUpload && region) {
			console.log('update upload creator', uploadId, region.name, region.userId, tags);
			await client.uploads.update(uploadId, { creator: { type: 'user', id: region.userId } });
			console.log('update upload creator', 'done');
			return res.status(200).json({ updated: true });
		} else console.log('not a user upload', tags);

		res.status(200).json({ updated: false });
	} catch (err) {
		console.log(err);

		res.status(500).json({ error: parseDatoError(err) });
	}
}

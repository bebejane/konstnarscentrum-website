import withAuthentication from '/lib/auth/withAuthentication';
import { buildClient, buildBlockRecord } from '@datocms/cma-client';
import { apiQuery } from 'dato-nextjs-utils/api';
import { sleep, parseDatoError } from '/lib/utils';
import { MemberDocument } from '/graphql';
import type { Item } from '@datocms/cma-client/dist/types/generated/SimpleSchemaTypes';
import getVimeoThumbnail from 'get-vimeo-thumbnail';
import { getYouTubeThumbnail } from 'yt-vimeo-thumbnail/dist/youtube/getYouTube';

export const client = buildClient({
	apiToken: process.env.GRAPHQL_API_TOKEN_FULL,
	environment: process.env.DATOCMS_ENVIRONMENT ?? 'main',
});

export default withAuthentication(async (req, res, session) => {
	if (req.body?.ping || req.query?.ping) return res.status(200).json({ pong: true });

	if (!req.body || !req.body?.id) return res.status(500).json({ error: `Invalid empty request` });

	const {
		id,
		image,
		content,
		firstName,
		lastName,
		bio,
		birthPlace,
		address,
		postalCode,
		city,
		yearOfBirth,
		webpage,
		instagram,
		memberCategory,
		active,
		showContact,
	} = req.body as MemberRecord;

	let record: Item;
	let imageBlockId: string;
	let videoBlockId: string;

	try {
		const res = await Promise.all([
			client.items.find(id, { nested: true }),
			client.itemTypes.list(),
		]);
		record = res[0];
		imageBlockId = res[1]?.find((el) => el.api_key === 'image')?.id;
		videoBlockId = res[1]?.find((el) => el.api_key === 'video')?.id;
		if (!imageBlockId || !videoBlockId) throw new Error('Cant find image/video block ids');
	} catch (err) {
		return res.status(500).json({ error: parseDatoError(err) });
	}

	if (!record) return res.status(500).json({ error: `User with id "${id}" not found!` });

	const images: FileField[] = [image];
	content?.forEach(
		(el) => el.__typename === 'ImageRecord' && el.image && images.push.apply(images, el.image),
	);

	try {
		for (let i = 0; content && i < content.length; i++) {
			//@ts-ignore
			if (content[i].__typename === 'VideoRecord' && content[i].video?.url !== undefined) {
				//@ts-ignore
				const thumbnailUrl =
					content[i].video.provider === 'youtube'
						? getYouTubeThumbnail(content[i].video.url)
						: (await getVimeoThumbnail(content[i].video.url))[0];
				//@ts-ignore
				content[i].video = { ...content[i].video, thumbnailUrl };
			}
		}
	} catch (err) {
		throw new Error("Can't get thumnail url for videos");
	}
	const newRecord = {
		first_name: firstName,
		last_name: lastName,
		full_name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
		birth_place: birthPlace,
		bio,
		address,
		postal_code: postalCode,
		city,
		year_of_birth: yearOfBirth,
		webpage,
		instagram,
		member_category: memberCategory,
		image: image && image?.id ? { upload_id: image.id } : undefined,
		active,
		show_contact: showContact,
		content: content
			? content.map((block) =>
					buildBlockRecord({
						item_type: {
							type: 'item_type',
							id: block.__typename === 'ImageRecord' ? imageBlockId : videoBlockId,
						},
						...{
							...block,
							__typename: undefined,
							type: undefined,
							index: undefined,
							image:
								block.__typename === 'ImageRecord'
									? block.image
											?.filter((i) => i?.id)
											.map((i) => ({
												upload_id: i.id,
											}))
									: undefined,
							video:
								block.__typename === 'VideoRecord' && block.video
									? {
											...(block.video || {}),
											provider: block.video.provider,
											provider_uid: block.video.providerUid,
											thumbnail_url:
												block.video.thumbnailUrl ??
												'https://konstnarscentrum.org/image/noimage.png',
											width: 0,
											height: 0,
											__typename: undefined,
											providerUid: undefined,
											thumbnailUrl: undefined,
										}
									: undefined,
						},
					}),
				)
			: undefined,
	};

	// Remove undefined
	Object.keys(newRecord).forEach((k) => newRecord[k] === undefined && delete newRecord[k]);

	try {
		await Promise.all([
			client.items.update(record.id, newRecord),
			...images
				.filter((i) => i?.id)
				.map(({ id, title, alt }) =>
					client.uploads.update(id, {
						default_field_metadata: { en: { alt, title, custom_data: {} } },
					}),
				),
		]);

		await sleep(3000); // Sleep to wait for GraphQL api to update
		const { member } = await apiQuery(MemberDocument, { variables: { email: record.email } });
		return res.status(200).json(member);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ ...parseDatoError(err) });
	}
});

import type { NextRequest, NextResponse } from 'next/server';
import { apiQuery } from 'dato-nextjs-utils/api';
import { apiQueryAll } from '/lib/utils';
import { buildClient } from '@datocms/cma-client';
import { SearchMembersDocument, SearchMembersFreeDocument, SiteSearchDocument } from '/graphql';
import { truncateParagraph, isEmptyObject, recordToSlug } from '/lib/utils';

export const runtime = 'edge';
export const maxDuration = 10;

const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN });

export default async function handler(req: NextRequest, res: NextResponse) {
	try {
		const params = await req.json();

		if (params.type === 'member') {
			const members = await memberSearch(params);
			return new Response(JSON.stringify({ members }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			});
		} else if (params.type === 'site') {
			const results = await siteSearch(params);
			return new Response(JSON.stringify(results), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			});
		} else {
			return new Response(JSON.stringify({}), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			});
		}
	} catch (err) {
		return new Response(JSON.stringify(err), {
			status: 500,
			headers: { 'content-type': 'application/json' },
		});
	}
}

const memberSearch = async (opt) => {
	const { query, regionId, memberCategoryIds } = opt;

	const variables = {
		regionId,
		memberCategoryIds,
		query: query
			? `${query
					.split(' ')
					.filter((el) => el)
					.join('|')}`
			: undefined,
		first: 100,
	};

	const { members } = await apiQueryAll(query ? SearchMembersFreeDocument : SearchMembersDocument, { variables });
	return members;
};

export const siteSearch = async (opt: any) => {
	const { query, regionId } = opt;

	const variables = {
		regionId,
		query: query
			? `${query
					.split(' ')
					.filter((el) => el)
					.join('|')}`
			: undefined,
	};

	if (isEmptyObject(variables)) return {};

	console.time(`search: "${query}"`);

	const itemTypes = await client.itemTypes.list();

	const search = (
		await client.items.list({
			filter: { type: itemTypes.map((m) => m.api_key).join(','), query },
			order_by: '_rank_DESC',
			allPages: true,
		})
	).map((el) => ({
		...el,
		_api_key: itemTypes.find((t) => t.id === el.item_type.id).api_key,
	}));

	const data: { [key: string]: unknown[] } = {};
	const first = 100;

	for (let i = 0; i < search.length; i += first) {
		const chunk = search.slice(i, first - 1);
		const res = await apiQuery(SiteSearchDocument, {
			variables: {
				memberIds: chunk.filter((el) => el._api_key === 'member').map((el) => el.id),
				newsIds: chunk.filter((el) => el._api_key === 'news').map((el) => el.id),
				memberNewsIds: chunk.filter((el) => el._api_key === 'member_news').map((el) => el.id),
				first,
				skip: i,
			},
		});
		Object.keys(res).forEach((k) => {
			data[k] = data[k] ?? [];
			data[k] = data[k].concat(res[k]);
		});
	}

	Object.keys(data).forEach((type) => {
		if (!data[type].length) delete data[type];
		else
			data[type] = data[type].map((el: any) => ({
				...el,
				category: itemTypes.find(({ api_key }) => api_key === el._modelApiKey).name,
				text: truncateParagraph(el.text, 1, false),
				slug: recordToSlug(el),
			}));
	});
	console.timeEnd(`search: "${query}"`);
	return data;
};

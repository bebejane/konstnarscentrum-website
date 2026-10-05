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
		query: query ? buildSearchPattern(query) : undefined,
		first: 100,
	};

	const { members } = await apiQueryAll(query ? SearchMembersFreeDocument : SearchMembersDocument, { variables });

	if (!query) return members;

	return rankMembers(members, query);
};

// Turn a free-text query into a case-insensitive regex matching any of its
// terms. The query may already be pipe-joined by the client, so split on both
// `|` and whitespace, and escape regex metacharacters so a stray "(" etc. can
// never produce an invalid pattern and 500 the request.
const buildSearchPattern = (query: string) =>
	query
		.split(/[|\s]+/)
		.map((term) => term.trim())
		.filter(Boolean)
		.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('|');

// Lowercase and strip diacritics so "a" matches "å/ä" and comparisons are
// accent- and case-insensitive.
const normalize = (str = '') =>
	str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

// DatoCMS can only sort members alphabetically, so score each hit by how well
// its name matches the query terms and return the most relevant first. Ties
// fall back to Swedish alphabetical order for a stable, deterministic result.
const rankMembers = (members: any[], query: string) => {
	const terms = normalize(query)
		.split(/[|\s]+/)
		.filter(Boolean);

	if (!terms.length) return members;

	const scoreMember = (member: any) => {
		const first = normalize(member.firstName);
		const last = normalize(member.lastName);
		const full = normalize(member.fullName);
		const words = full.split(/\s+/);
		const names = [first, last, full];

		let score = 0;
		let matched = 0;

		for (const term of terms) {
			const contains = names.some((name) => name.includes(term));
			if (contains) matched += 1;

			if (first === term || last === term) score += 100;
			else if (first.startsWith(term) || last.startsWith(term)) score += 60;
			else if (words.some((word) => word.startsWith(term))) score += 40;
			else if (contains) score += 10;
		}

		// Prefer members matching every term, and all else equal more of them.
		if (terms.length > 1 && matched === terms.length) score += 50;
		score += matched * 5;

		return score;
	};

	return members
		.map((member) => ({ member, score: scoreMember(member) }))
		.sort(
			(a, b) =>
				b.score - a.score ||
				(a.member.fullName ?? '').localeCompare(b.member.fullName ?? '', 'sv'),
		)
		.map(({ member }) => member);
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

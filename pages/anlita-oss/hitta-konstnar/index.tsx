import s from './index.module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { GetStaticProps } from 'next';
import {
	AllMemberCategoriesDocument,
	AllMembersWithPortfolioDocument,
	AllMembersCitiesDocument,
} from '/graphql';
import { FilterBar, CardContainer, Card, Thumbnail, Loader, RevealText } from '/components';
import { apiQueryAll } from '/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from 'rooks';

export type Props = {
	memberCategories: MemberCategoryRecord[];
	members: MemberRecord[];
	pagination: Pagination;
	regions: Region[];
	region: Region;
	cities: { name: string }[];
};

export default function Members({
	members,
	memberCategories,
	regions,
	region: regionFromProps,
	pagination,
}: Props) {
	const [results, setResults] = useState<MemberRecord[] | undefined>();
	const [error, setError] = useState<Error | undefined>();
	const [loading, setLoading] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');
	const [queryDebounced] = useDebouncedValue(query, 150);
	const [regionId, setRegionId] = useState<string | undefined>(regionFromProps?.id);
	const [memberCategoryIds, setMemberCategoryIds] = useState<string | string[] | undefined>();
	const abortController = useRef<AbortController | undefined>();

	// Signature of the active filters. The initial value matches the server-rendered
	// list, so we skip fetching until the user actually changes something.
	const searchKey = JSON.stringify([
		regionId ?? null,
		memberCategoryIds?.length ? memberCategoryIds : null,
		queryDebounced || null,
	]);
	const lastSearchKey = useRef<string>(searchKey);

	const handleSearch = useCallback(() => {
		const region = regions.find(({ id }) => id === regionId);
		const variables = {
			regionId: region && !region.global ? region.id : undefined,
			memberCategoryIds: memberCategoryIds?.length ? memberCategoryIds : undefined,
			query: queryDebounced || undefined,
		};

		// Supersede any in-flight request and only let the newest one commit.
		abortController.current?.abort();
		const controller = new AbortController();
		abortController.current = controller;

		setLoading(true);
		setError(undefined);

		fetch('/api/search', {
			body: JSON.stringify({ ...variables, type: 'member' }),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			signal: controller.signal,
		})
			.then(async (res) => {
				if (res.status !== 200) throw new Error('Internal server error');
				return (await res.json()).members;
			})
			.then((members) => {
				if (controller.signal.aborted) return;
				setResults(members);
			})
			.catch((err) => {
				if (controller.signal.aborted) return;
				setError(err);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
	}, [queryDebounced, regionId, memberCategoryIds, regions]);

	useEffect(() => {
		if (searchKey === lastSearchKey.current) return;
		lastSearchKey.current = searchKey;
		handleSearch();
	}, [searchKey, handleSearch]);

	// Cancel any in-flight request when leaving the page.
	useEffect(() => () => abortController.current?.abort(), []);

	return (
		<div className={s.container}>
			<h1>
				<RevealText>Hitta konstnärer</RevealText>
				<sup className='amount'>{results ? results.length : pagination.count}</sup>
			</h1>
			<div className={s.search}>
				<form className='mid'>
					<span>Namn: </span>
					<input
						id='search'
						name='search'
						type='text'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<span>Plats: </span>
					<select
						key={regionId}
						value={regionId}
						onChange={({ target: { value } }) => setRegionId(value)}
					>
						{regions.map(({ id, name, global }, idx) => (
							<option key={idx} value={id}>
								{name}
							</option>
						))}
					</select>
				</form>
				<div className={s.background}></div>
			</div>
			<FilterBar
				multi={true}
				options={memberCategories.map(({ id, categoryType }) => ({ label: categoryType, id }))}
				onChange={(ids) => setMemberCategoryIds(ids)}
			/>
			{error && (
				<div className={s.error}>
					<>{error?.message ?? error}</>
				</div>
			)}
			{loading ? (
				<Loader className={s.loader} />
			) : results ? (
				<>
					{results.length === 0 && <div className={s.nomatches}>Inga träffar...</div>}

					<CardContainer columns={3} className={s.results}>
						{results.map(({ id, firstName, lastName, image, region, slug }) => (
							<Card key={id}>
								<Thumbnail
									image={image}
									title={`${firstName} ${lastName}`}
									slug={`/${region.slug}/anlita-oss/hitta-konstnar/${slug}`}
									regional={false}
								/>
							</Card>
						))}
					</CardContainer>
				</>
			) : (
				<CardContainer columns={3}>
					{members.map(({ id, firstName, lastName, image, region, slug }) => (
						<Card key={id}>
							<Thumbnail
								image={image}
								title={`${firstName} ${lastName}`}
								slug={`/${region.slug}/anlita-oss/hitta-konstnar/${slug}`}
								regional={false}
							/>
						</Card>
					))}
				</CardContainer>
			)}
		</div>
	);
}

Members.page = {
	title: 'Hitta konstnär',
	crumbs: [{ title: 'Hitta konstnär' }],
	regional: false,
} as PageProps;

export const getStaticProps: GetStaticProps = withGlobalProps(
	{
		queries: [AllMemberCategoriesDocument, AllMembersCitiesDocument],
	},
	async ({ props, revalidate }: any) => {
		const regionId = !props.region.global ? props.region.id : undefined;
		const { members, pagination } = await apiQueryAll(AllMembersWithPortfolioDocument, {
			variables: { regionId },
		});

		return {
			props: {
				...props,
				members,
				cities: props.cities.filter((v, i, a) => a.findIndex((v2) => v2.name === v.name) === i),
				pagination,
			},
			revalidate,
		};
	},
);

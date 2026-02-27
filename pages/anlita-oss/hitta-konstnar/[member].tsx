import s from './[member].module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { GetStaticProps } from 'next';
import { apiQuery } from 'dato-nextjs-utils/api';
import {
	MemberBySlugDocument,
	AllMembersWithPortfolioDocument,
	RelatedMembersDocument,
} from '/graphql';
import {
	Article,
	Block,
	MetaSection,
	RelatedSection,
	Portfolio,
	Loader,
	ErrorModal,
} from '/components';
import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DatoSEO } from 'dato-nextjs-utils/components';
import { capitalize } from '/lib/utils';
import useStore from '/lib/store';

export type Props = {
	member: MemberRecord;
	related: MemberRecord[];
	region: Region;
};

export default function Member({
	member: {
		id,
		firstName,
		lastName,
		bio,
		birthPlace,
		instagram,
		yearOfBirth,
		webpage,
		memberCategory,
		email,
		city,
		showContact,
	},
	member: memberFromProps,
	related,
}: Props) {
	const [imageId, setImageId, setImages] = useStore((state) => [
		state.imageId,
		state.setImageId,
		state.setImages,
	]);
	const [member, setMember] = useState<MemberRecord | undefined>(memberFromProps);
	const [mainImage, setMainImage] = useState<FileField | undefined>();
	const [block, setBlock] = useState<ImageRecord | VideoRecord | undefined>();
	const [error, setError] = useState<Error | undefined>();
	const [saving, setSaving] = useState(false);
	const [preview, setPreview] = useState(false);
	const { data, status } = useSession();
	const isEditable = status === 'authenticated' && data.user.email === email;
	//@ts-ignore
	const isIncomplete =
		!member.content ||
		member.content?.length === 0 ||
		member.content?.filter((block) => block.image?.length > 0 || block.video).length === 0;
	const weblinks = [
		webpage ? { label: 'Hemsida', url: webpage } : undefined,
		instagram ? { label: 'Instagram', url: instagram } : undefined,
	].filter((el) => el);

	const handleSave = useCallback(
		async (data: MemberModelContentField[], image?: FileField) => {
			if (status !== 'authenticated') return;

			setSaving(true);
			setBlock(undefined);
			setMainImage(undefined);

			const rollbackData = { ...member };

			try {
				setMember({ ...member, content: data, image });

				const res = await fetch('/api/account', {
					method: 'POST',
					body: JSON.stringify({ id: member.id, image, content: data, active: member.active }),
					headers: { 'Content-Type': 'application/json' },
				});

				if (res.status !== 200) {
					const error = await res.json();
					throw error;
				}
				const updatedMember = await res.json();
				setMember(updatedMember);
			} catch (err) {
				setMember(rollbackData);
				setError(err);
			}

			setSaving(false);
		},
		[status, member],
	);

	const handleBlockChange = (block: MemberModelContentField) =>
		handleSave(member.content.map((b) => (b.id === block.id ? block : b)));
	const handleContentChange = (content: MemberModelContentField[]) => handleSave(content);
	const handleRemove = (id: string) =>
		handleSave(member.content.filter((block) => block.id !== id));

	const handleMainImageChange = async (image: FileField) => {
		setMainImage(undefined);
		handleSave(null, image);
	};

	useEffect(() => setMember(memberFromProps), [memberFromProps]);
	useEffect(() => error && console.error(error), [error]);

	useEffect(() => {
		const images = [member.image];
		member.content.forEach(
			(el) => el.__typename === 'ImageRecord' && images.push.apply(images, el.image),
		);
		setImages(imageId ? images : undefined);
	}, [imageId]);

	return (
		<>
			<DatoSEO title={member.fullName} description={member.bio} seo={member._seoMetaTags} />
			<div className={s.container}>
				{member.active ? (
					<Article
						id={id}
						key={id}
						image={member.image}
						title={`${firstName} ${lastName}`}
						text={bio?.replace(/\n/g, ' ')}
						editable={JSON.stringify({ ...member.image, nodelete: true })}
						onClick={(id) => setImageId(id)}
					>
						<MetaSection
							key={`${id}-meta`}
							items={[
								{
									title: 'Född',
									value: `${[yearOfBirth, birthPlace].filter((el) => el).join(', ')}`,
								},
								{ title: 'Verksam', value: city },
								{ title: 'Kontakt', value: showContact ? email : undefined },
								{
									title: 'Typ',
									value: memberCategory
										?.map(({ categoryType }) => capitalize(categoryType))
										.join(', '),
								},
								{
									title: 'Besök',
									value:
										!weblinks.length || !showContact
											? undefined
											: weblinks.map(({ label, url }, idx) => (
													<React.Fragment key={idx}>
														<a href={url}>{label}</a>
														{idx + 1 < weblinks.length ? ', ' : ''}
													</React.Fragment>
											  )),
								},
							]}
						/>
						{!isIncomplete && (
							<>
								<h2 className='noPadding'>Utvalda verk</h2>
								{member.content?.map((block, idx) => (
									<Block
										key={`${id}-${idx}`}
										data={block}
										record={member}
										onClick={(id) => setImageId(id)}
										editable={{
											...block,
											id: block.id,
											type: block.__typename,
											index: idx,
										}}
									/>
								))}
							</>
						)}
						{isEditable && (
							<Portfolio
								key={member.id}
								member={member}
								block={block}
								setBlock={setBlock}
								content={member.content || memberFromProps.content}
								onChange={handleBlockChange}
								onContentChange={handleContentChange}
								onChangeMainImage={handleMainImageChange}
								onRemove={handleRemove}
								mainImage={mainImage}
								setMainImage={setMainImage}
								preview={preview}
								onPreview={() => setPreview(!preview)}
								onClose={() => setBlock(undefined)}
								onError={(err) => setError(err)}
							/>
						)}
					</Article>
				) : (
					<Article id={id}>
						<p className={s.inactive}>Konstnärens profil är inaktiverat</p>
					</Article>
				)}
				<RelatedSection
					key={`${id}-related`}
					title='Upptäck fler'
					slug={'/anlita-oss/hitta-konstnar'}
					regional={false}
					items={related.map(({ firstName, lastName, image, slug }) => ({
						title: `${firstName} ${lastName}`,
						image,
						slug: `/anlita-oss/hitta-konstnar/${slug}`,
					}))}
				/>

				<div className={cn(s.overlay, saving && s.show)}>
					<div className={s.loader}>
						<Loader />
					</div>
				</div>
				{error && <ErrorModal error={error} onClose={() => setError(undefined)} />}
			</div>
		</>
	);
}

Member.page = {
	noBottom: true,
	crumbs: [{ slug: 'anlita-oss/hitta-konstnar', title: 'Hitta konstnär' }],
	regional: false,
} as PageProps;

export async function getStaticPaths(context) {
	const { members }: { members: MemberRecord[] } = await apiQuery(AllMembersWithPortfolioDocument);
	const paths = members.map(({ slug, region }) => ({
		params: { member: slug, region: region.slug },
	}));

	return {
		paths,
		fallback: 'blocking',
	};
}

export const getStaticProps: GetStaticProps = withGlobalProps(
	{ queries: [] },
	async ({ props, revalidate, context }: any) => {
		const regionId = props.region.global ? undefined : props.region.id;
		const slug = context.params.member;
		const { member } = await apiQuery(MemberBySlugDocument, {
			variables: { slug },
			preview: context.preview,
		});

		if (!member) return { notFound: true };

		const { members: related } = await apiQuery(RelatedMembersDocument, {
			variables: {
				first: 100,
				regionId,
				memberId: member.id,
			},
			preview: context.preview,
		});

		return {
			props: {
				...props,
				member,
				related: related.sort(() => (Math.random() > 0.5 ? 1 : -1)).slice(0, 6),
			},
			revalidate,
		};
	},
);

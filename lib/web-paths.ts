import regions from '../regions.json'

type Record = { model: { api_key?: string }; slug?: string; region?: string }
type PreviewItem = { attributes: { slug?: string; global?: boolean } }
type PreviewItemType = { attributes: { api_key?: string } }

export const regionalPaths = (path: string, slug?: string): string[] => {
	return regions.map(r => `${r.global ? '' : `/${r.slug}`}${path}${slug ? `/${slug}` : ''}`)
}

/**
 * Given a DatoCMS revalidate webhook record (as produced by withRevalidate),
 * return the paths that should be revalidated. Empty means unmapped.
 */
export const getRevalidatePaths = (record: Record): string[] => {
	const { api_key: apiKey } = record.model
	const { slug, region: regionId } = record
	const region = regions.find(({ id }) => regionId === id)
	const paths: string[] = []

	switch (apiKey) {
		case 'region':
			if (regions.find(r => r.slug === slug && r.global))
				paths.push(`/`)
			else
				paths.push(`/${slug}`)
			break
		case 'about':
			paths.push(`/om/${slug}`)
			break
		case 'commission':
			paths.push(`/anlita-oss/uppdrag/${slug}`)
			break
		case 'commission_category':
			paths.push(`/anlita-oss/uppdrag`)
			break
		case 'consult':
			paths.push(`/anlita-oss/${slug}`)
			break
		case 'apply':
			paths.push(`/konstnar/bli-medlem`)
			break
		case 'member_news':
			paths.push(`/konstnar/aktuellt/${slug}`)
			paths.push(`/${region.slug}/konstnar/aktuellt/${slug}`)
			break
		case 'project':
			paths.push(`/vara-initiativ`)
			break
		case 'news':
			paths.push(`/nyheter/${slug}`)
			paths.push(`/${region.slug}/nyheter/${slug}`)
			break
		case 'employee':
			paths.push(`/kontakt/konstkonsulter`)
			paths.push.apply(paths, regionalPaths(`/kontakt/personal`))
			paths.push.apply(paths, regionalPaths(`/kontakt/styrelse`))
			break
		case 'press':
			paths.push(`/about/press`)
			break
		case 'member':
			paths.push(`/anlita-oss/hitta-konstnar/${slug}`)
			paths.push(`/anlita-oss/hitta-konstnar`)
			paths.push.apply(paths, regionalPaths(`/for-konstnarer/medlemmar`))
			break
		case 'member_category':
			paths.push.apply(paths, regionalPaths(`/anlita-oss/hitta-konstnar`))
			break
		case 'member_news_category':
			paths.push.apply(paths, regionalPaths(`/konstnar/aktuellt`))
			break
		case 'members_list':
			paths.push.apply(paths, regionalPaths(`/for-konstnarer/medlemmar`))
			break
		case 'contact_intro':
			paths.push(`/kontakt/personal`)
			paths.push(`/kontakt/konstkonsulter`)
			paths.push(`/kontakt/styrelse`)
			break
		case 'board':
			paths.push(`/kontakt/styrelse`)
			break
		case 'consultant':
			paths.push(`/kontakt/konstkonsulter`)
			break
		case 'for_artist':
			paths.push(`/for-konstnarer/${slug}`)
			break
		case 'in_english':
			paths.push(`/english`)
			break
		case 'intro_initiative':
			paths.push.apply(paths, regionalPaths(`/vara-initiativ`))
			break
		case 'footer':
			paths.push(`/`)
			break
		default:
			break
	}

	return paths
}

/**
 * Given a DatoCMS web-previews payload item/itemType, return the preview path or null.
 * Used by withWebPreviewsEdge.
 */
export const getWebPreviewPath = (itemType: PreviewItemType, item: PreviewItem): string | null => {
	const { slug, global } = item.attributes

	let path: string | null = null

	switch (itemType.attributes.api_key) {
		case 'region':
			path = global ? `/` : `/${slug}`
			break
		case 'about':
			path = `/om/${slug}`
			break
		case 'in_english':
			path = `/english`
			break
		case 'consult':
			path = `/anlita-oss/${slug}`
			break
		case 'commission':
			path = `/anlita-oss/uppdrag/${slug}`
			break
		case 'commission_category':
			path = `/anlita-oss/uppdrag`
			break
		case 'for_artist':
			path = `/for-konstnarer/${slug}`
			break
		case 'members_list':
			path = `/for-konstnarer/medlemmar`
			break
		case 'apply':
			path = `/konstnar/bli-medlem`
			break
		case 'news':
			path = `/nyheter/${slug}`
			break
		case 'member_news_category':
			path = `/konstnar/aktuellt`
			break
		case 'project':
		case 'intro_initiative':
			path = `/vara-initiativ`
			break
		case 'member':
			path = `/anlita-oss/hitta-konstnar/${slug}`
			break
		case 'member_category':
			path = `/anlita-oss/hitta-konstnar`
			break
		case 'member_news':
			path = `/konstnar/aktuellt/${slug}`
			break
		case 'footer':
			path = `/`
			break
		case 'contact_intro':
			path = `/kontakt/styrelse`
			break
		case 'employee':
			path = `/kontakt/personal`
			break
		case 'board':
			path = `/kontakt/styrelse`
			break
		case 'consultant':
			path = `/kontakt/konstkonsulter`
			break
		default:
			break
	}

	return path
}
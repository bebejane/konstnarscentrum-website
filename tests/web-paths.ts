import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import { buildClient } from '@datocms/cma-client-node'
import { getRevalidatePaths, getWebPreviewPath } from '../lib/web-paths'
import regions from '../regions.json'

const TEST_SLUG = 'test-slug'

const parseArgs = (): { includeBlocks: boolean; regionSlug: string } => {
	const args = process.argv.slice(2)
	let includeBlocks = false
	let regionSlug = regions[0]?.slug ?? 'riks'

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--all') includeBlocks = true
		if (args[i] === '--region' && args[i + 1]) regionSlug = args[++i]
	}

	return { includeBlocks, regionSlug }
}

const main = async () => {
	if (!process.env.GRAPHQL_API_TOKEN_FULL) {
		console.error('Error: GRAPHQL_API_TOKEN_FULL not set in .env')
		process.exit(1)
	}

	const { includeBlocks, regionSlug } = parseArgs()
	const region = regions.find(r => r.slug === regionSlug)

	if (!region) {
		console.error(`Region "${regionSlug}" not found. Available: ${regions.map(r => r.slug).join(', ')}`)
		process.exit(1)
	}

	console.log(`Region:     ${region.name} (${region.slug}, id=${region.id}, global=${region.global})`)
	console.log(`Include blocks: ${includeBlocks}`)

	const client = buildClient({
		apiToken: process.env.GRAPHQL_API_TOKEN_FULL,
		environment: process.env.DATOCMS_ENVIRONMENT,
	})

	const itemTypes = await client.itemTypes.list()
	const models = includeBlocks
		? itemTypes
		: itemTypes.filter(t => !(t as any).modular_block)

	if (!models.length) {
		console.error('No item types found.')
		process.exit(1)
	}

	type Row = {
		api_key: string
		name: string
		revalidate: string
		preview: string
	}

	const rows: Row[] = []

	for (const model of models) {
		const apiKey = (model as any).api_key as string
		const name = model.name

		let revalidateOut = ''
		let revalidatePaths: string[] = []

		try {
			revalidatePaths = getRevalidatePaths({
				id: '0',
				slug: TEST_SLUG,
				region: region.id,
				model: { api_key: apiKey },
			} as any)

			revalidateOut = revalidatePaths.length
				? `${revalidatePaths.length} path(s)`
				: '—'
		} catch (err: any) {
			revalidateOut = `ERROR: ${err.message}`
		}

		let previewOut = ''
		let previewPath: string | null = null

		try {
			previewPath = getWebPreviewPath(
				{ attributes: { api_key: apiKey } } as any,
				{ attributes: { slug: TEST_SLUG, global: region.global } } as any,
			)

			previewOut = previewPath ?? '—'
		} catch (err: any) {
			previewOut = `ERROR: ${err.message}`
		}

		rows.push({ api_key: apiKey, name, revalidate: revalidateOut, preview: previewOut })
	}

	// ── Full table ──────────────────────────────────────────────────────────
	console.log(`\nModels: ${models.length}\n`)

	console.table(rows)

	// ── Region model special: both global and non-global ────────────────────
	const regionModel = models.find(m => (m as any).api_key === 'region')
	if (regionModel) {
		console.log('\n── region model (additional payloads) ──')
		const allRegions = regions.map(r => {
			const revalidate = getRevalidatePaths({
				id: r.id, slug: r.slug, region: r.id,
				model: { api_key: 'region' },
			} as any)
			const preview = getWebPreviewPath(
				{ attributes: { api_key: 'region' } } as any,
				{ attributes: { slug: r.slug, global: r.global } } as any,
			)
			return { slug: r.slug, global: r.global, revalidate: revalidate.join(', '), preview: preview ?? '—' }
		})
		console.table(allRegions)
	}

	// ── Coverage summary ────────────────────────────────────────────────────
	const coveredByRevalidate = rows.filter(r => !r.revalidate.startsWith('ERROR') && r.revalidate !== '—')
	const coveredByPreview = rows.filter(r => !r.preview.startsWith('ERROR') && r.preview !== '—')
	const coveredByBoth = coveredByRevalidate.filter(r => coveredByPreview.some(p => p.api_key === r.api_key))
	const coveredByRevalidateOnly = coveredByRevalidate.filter(r => !coveredByPreview.some(p => p.api_key === r.api_key))
	const coveredByPreviewOnly = coveredByPreview.filter(r => !coveredByRevalidate.some(p => p.api_key === r.api_key))
	const notCoveredByEither = rows.filter(r => !coveredByRevalidate.some(p => p.api_key === r.api_key) && !coveredByPreview.some(p => p.api_key === r.api_key))

	console.log('\n── Coverage summary ──')
	console.log(`  Covered by both:          ${coveredByBoth.length}`)
	console.log(`  Covered by revalidate only: ${coveredByRevalidateOnly.length}`)
	console.log(`  Covered by preview only:  ${coveredByPreviewOnly.length}`)
	console.log(`  Not covered by either:    ${notCoveredByEither.length}`)

	if (coveredByRevalidateOnly.length) {
		console.log(`\n  Revalidate only:          ${coveredByRevalidateOnly.map(r => r.api_key).join(', ')}`)
	}

	if (coveredByPreviewOnly.length) {
		console.log(`\n  Preview only:             ${coveredByPreviewOnly.map(r => r.api_key).join(', ')}`)
	}

	if (notCoveredByEither.length) {
		console.log(`\n  Not covered:              ${notCoveredByEither.map(r => r.api_key).join(', ')}`)
	}

	const errors = rows.filter(r => r.revalidate.startsWith('ERROR') || r.preview.startsWith('ERROR'))
	if (errors.length) {
		console.log(`\n  Errors:`)
		errors.forEach(r => {
			if (r.revalidate.startsWith('ERROR')) console.log(`    [revalidate] ${r.api_key}: ${r.revalidate}`)
			if (r.preview.startsWith('ERROR')) console.log(`    [preview]    ${r.api_key}: ${r.preview}`)
		})
	}

	console.log()
}

main()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { buildClient } from '@datocms/cma-client-node'

const environment = process.env.DATOCMS_ENVIRONMENT ?? 'main'
const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string, environment })

const REGION_MODEL = 'region'
const FIELD_API_KEY = 'invoice_amount'

/**
 * Adds `region.invoice_amount` — the yearly membership amount, in SEK, that the
 * Fortnox invoicing uses for the region. Required at invoicing time (there is no
 * code fallback), but not a schema-level required field so existing region
 * records stay publishable while the amounts are filled in.
 *
 * Run per environment:
 *   DATOCMS_ENVIRONMENT=dev  pnpm run migrateinvoiceamount
 *   DATOCMS_ENVIRONMENT=main pnpm run migrateinvoiceamount
 */
const FIELD = {
  label: 'Medlemsavgift per år',
  api_key: FIELD_API_KEY,
  field_type: 'float' as const,
  hint: 'Belopp i kronor som medlemmarna i regionen faktureras varje år. Krävs för att kunna skapa årsfakturor i Fortnox.',
  validators: { number_range: { min: 1 } },
  appearance: { editor: 'float', parameters: {}, addons: [] },
}

async function run() {
  let regionType
  try {
    regionType = await client.itemTypes.find(REGION_MODEL)
  } catch {
    regionType = null
  }

  if (!regionType) {
    console.error(`✗ Could not find model "${REGION_MODEL}" in environment "${environment}".`)
    process.exitCode = 1
    return
  }

  const existing = (await client.fields.list(regionType.id)).find(
    (f: any) => f.api_key === FIELD_API_KEY
  )

  try {
    if (existing) {
      await client.fields.update(existing.id, {
        label: FIELD.label,
        hint: FIELD.hint,
        validators: FIELD.validators as any,
      })
      console.log(`✓ Updated field "${FIELD_API_KEY}" on ${REGION_MODEL} (${regionType.id})`)
    } else {
      await client.fields.create(regionType.id, FIELD as any)
      console.log(`✓ Created field "${FIELD_API_KEY}" on ${REGION_MODEL} (${regionType.id})`)
    }
  } catch (err: any) {
    console.error(`✗ Failed to upsert "${FIELD_API_KEY}" on ${REGION_MODEL}: ${err?.message ?? err}`)
    process.exitCode = 1
    return
  }

  // Report which regions still need a value — invoicing fails for those.
  const regions = await client.items.list({ filter: { type: REGION_MODEL } })
  const missing = regions.filter((r: any) => {
    const v = r[FIELD_API_KEY]
    return typeof v !== 'number' || !Number.isFinite(v) || v < 1
  })

  if (missing.length) {
    console.log(`\n• ${missing.length} region(s) without a ${FIELD.label}:`)
    for (const r of missing) console.log(`    - ${r.name} (${r.slug})`)
    console.log(`  Set the amount on those regions, otherwise invoicing them fails.`)
  } else {
    console.log(`\n✓ All ${regions.length} region(s) have a ${FIELD.label}.`)
  }

  console.log(`\nDone. Changes applied in environment "${environment}".`)
}

run()

import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { buildClient } from '@datocms/cma-client-node'

const environment = process.env.DATOCMS_ENVIRONMENT ?? 'main'
const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string, environment })

const REGION_MODEL = 'region'
const FIELD_API_KEY = 'invoice_email_text'

/**
 * Adds `region.invoice_email_text` — the message body Fortnox includes when it
 * e-mails the region's annual membership invoice.
 *
 * Optional on purpose: an empty field means Fortnox's own default text is used,
 * so existing region records work exactly as before and invoicing is never
 * blocked by a missing text. Line breaks are kept as-is (the text is sent
 * trimmed, but otherwise unmodified).
 *
 * Run per environment:
 *   DATOCMS_ENVIRONMENT=dev  pnpm run migrateinvoiceemail
 *   DATOCMS_ENVIRONMENT=main pnpm run migrateinvoiceemail
 */
const FIELD = {
  label: 'Text i fakturamejl',
  api_key: FIELD_API_KEY,
  field_type: 'text' as const,
  hint: 'Texten som står i själva mejlet när Fortnox skickar årsfakturan. Lämna tom för att använda Fortnox standardtext. Du kan använda {name} (kundnamn) och {no} (fakturanummer). Radbrytningar skickas med som de är.',
  appearance: { editor: 'textarea', parameters: {}, addons: [] },
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
        appearance: FIELD.appearance as any,
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

  // Informational only — regions without a text keep using Fortnox's default.
  const regions = await client.items.list({ filter: { type: REGION_MODEL } })
  const missing = regions.filter((r: any) => {
    const v = r[FIELD_API_KEY]
    return typeof v !== 'string' || !v.trim()
  })

  if (missing.length) {
    console.log(`\n• ${missing.length} region(s) without a ${FIELD.label} (Fortnox default will be used):`)
    for (const r of missing) console.log(`    - ${r.name} (${r.slug})`)
  } else {
    console.log(`\n✓ All ${regions.length} region(s) have a ${FIELD.label}.`)
  }

  console.log(`\nDone. Changes applied in environment "${environment}".`)
}

run()

import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { buildClient } from '@datocms/cma-client-node'

const environment = process.env.DATOCMS_ENVIRONMENT ?? 'main'
const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string, environment })

const REGION_MODEL = 'region'

/**
 * Adds the two optional invoice e-mail fields on the region model:
 * - `invoice_email_text`   — the message body Fortnox includes when it e-mails the
 *                            region's annual membership invoice
 * - `invoice_email_subject` — the subject line of that e-mail
 *
 * Both are optional: empty means Fortnox's own default e-mail is used, so existing
 * region records work exactly as before and invoicing is never blocked by a
 * missing text. Line breaks in the body are kept as-is (the text is sent trimmed,
 * but otherwise unmodified); the subject is collapsed to one line.
 *
 * Fortnox requires a subject as soon as EmailInformation is sent (error 2001578
 * "Ämne för e-post saknas"), so the code falls back to "Medlemsavgift <år>" when
 * the subject is empty but a body is set.
 *
 * Run per environment:
 *   DATOCMS_ENVIRONMENT=dev  pnpm run migrateinvoiceemail
 *   DATOCMS_ENVIRONMENT=main pnpm run migrateinvoiceemail
 */
const FIELDS = [
  {
    label: 'Text i faktura mail',
    api_key: 'invoice_email_text',
    field_type: 'text' as const,
    hint: 'Texten som står i själva mejlet när Fortnox skickar årsfakturan. Lämna tom för att använda Fortnox standardtext. Du kan använda {name} (kundnamn) och {no} (fakturanummer). Radbrytningar skickas med som de är.',
    appearance: { editor: 'textarea', parameters: {}, addons: [] },
  },
  {
    label: 'Invoice e-post rubrik',
    api_key: 'invoice_email_subject',
    field_type: 'string' as const,
    hint: 'Rubriken på mejlet. Lämna tom för att använda "Medlemsavgift <år>". Du kan använda {name} (kundnamn) och {no} (fakturanummer).',
    appearance: { editor: 'single_line', parameters: {}, addons: [] },
  },
]

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

  const existing = await client.fields.list(regionType.id)

  for (const field of FIELDS) {
    const current = existing.find((f: any) => f.api_key === field.api_key)
    try {
      if (current) {
        await client.fields.update(current.id, {
          label: field.label,
          hint: field.hint,
          appearance: field.appearance as any,
        })
        console.log(`✓ Updated field "${field.api_key}" on ${REGION_MODEL} (${regionType.id})`)
      } else {
        await client.fields.create(regionType.id, field as any)
        console.log(`✓ Created field "${field.api_key}" on ${REGION_MODEL} (${regionType.id})`)
      }
    } catch (err: any) {
      console.error(`✗ Failed to upsert "${field.api_key}" on ${REGION_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
      return
    }
  }

  // Informational only — regions without a text keep using Fortnox's default.
  const regions = await client.items.list({ filter: { type: REGION_MODEL } })
  const missing = regions.filter((r: any) => {
    const v = r.invoice_email_text
    return typeof v !== 'string' || !v.trim()
  })

  if (missing.length) {
    console.log(`\n• ${missing.length} region(s) without a "Text i faktura mail" (Fortnox default will be used):`)
    for (const r of missing) console.log(`    - ${r.name} (${r.slug})`)
  } else {
    console.log(`\n✓ All ${regions.length} region(s) have a "Text i faktura mail".`)
  }

  console.log(`\nDone. Changes applied in environment "${environment}".`)
}

run()

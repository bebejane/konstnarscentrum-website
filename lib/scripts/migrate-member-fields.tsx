import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { buildClient } from '@datocms/cma-client-node'

const environment = process.env.DATOCMS_ENVIRONMENT ?? 'main'
const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string, environment })

const INVOICE_MODEL = 'invoice'
const MEMBER_MODEL = 'member'

const FIELD_TYPE_TO_EDITOR: Record<string, string> = {
  string: 'single_line',
  integer: 'integer',
  float: 'float',
  boolean: 'boolean',
  date: 'date'
}

type FieldSpec = {
  api_key: string
  label: string
  field_type: 'string' | 'integer' | 'float' | 'boolean' | 'date'
  hint?: string
  validators?: Record<string, unknown>
}

// Model + fields for the new `invoice` record type. One record per Fortnox invoice,
// linked to its member via member.invoices. Kept in sync by the cron / dispatch code.
const INVOICE_FIELDS: FieldSpec[] = [
  {
    api_key: 'fortnox_document_number',
    label: 'Fortnox dokumentnummer',
    field_type: 'string',
    hint: 'Fortnox document number (invoice id).'
  },
  {
    api_key: 'payment_status',
    label: 'Betalningsstatus',
    field_type: 'string',
    hint: 'Fortnox invoice status, e.g. UNPAID / PARTIALLYPAID / FULLYPAID. Uppdateras av cron.'
  },
  {
    api_key: 'payment_date',
    label: 'Betalningsdatum',
    field_type: 'date',
    hint: 'Datum när fakturan betalades i Fortnox. Uppdateras av cron.'
  },
  {
    api_key: 'invoice_year',
    label: 'Faktureringsår',
    field_type: 'integer',
    hint: 'Det år medlemsavgiften avser.'
  },
  {
    api_key: 'total',
    label: 'Belopp',
    field_type: 'float',
    hint: 'Fakturabelopp inkl. moms.'
  },
  {
    api_key: 'fortnox_customer_number',
    label: 'Fortnox kundnummer',
    field_type: 'string',
    hint: 'Fortnox customer number fakturan hör till.'
  },
  {
    api_key: 'region',
    label: 'Region',
    field_type: 'string',
    hint: 'Regionens slug (ex. nord) fakturan fakturerades på.'
  }
]

async function findItemType(apiKey: string) {
  try {
    return await client.itemTypes.find(apiKey)
  } catch {
    return null
  }
}

async function createFields(itemTypeId: string, spec: FieldSpec[]) {
  for (const field of spec) {
    try {
      await client.fields.create(itemTypeId, {
        label: field.label,
        api_key: field.api_key,
        field_type: field.field_type,
        hint: field.hint,
        validators: field.validators ?? {},
        appearance: {
          editor: FIELD_TYPE_TO_EDITOR[field.field_type],
          parameters: {},
          addons: []
        }
      })
      console.log(`✓ Created field "${field.api_key}" on ${itemTypeId}`)
    } catch (err: any) {
      console.error(`✗ Failed to create field "${field.api_key}" on ${itemTypeId}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  }
}

async function run() {
  // 1) Create the `invoice` model if it doesn't exist
  let invoiceType = await findItemType(INVOICE_MODEL)
  if (!invoiceType) {
    try {
      invoiceType = await client.itemTypes.create({
        name: 'Invoice',
        api_key: INVOICE_MODEL,
        collection_appearance: 'table',
        hint: 'En faktura från Fortnox. Synkas och länkas till en medlem.'
      })
      console.log(`✓ Created model "${INVOICE_MODEL}" (${invoiceType.id})`)
    } catch (err: any) {
      console.error(`✗ Failed to create model "${INVOICE_MODEL}": ${err?.message ?? err}`)
      process.exitCode = 1
      return
    }
  }

  // 2) Create the invoice fields (only missing ones)
  const invoiceFields = await client.fields.list(invoiceType.id)
  const existingInvoiceFields = new Set(invoiceFields.map((f: any) => f.api_key))
  const missingInvoiceFields = INVOICE_FIELDS.filter((f) => !existingInvoiceFields.has(f.api_key))
  if (missingInvoiceFields.length) {
    await createFields(invoiceType.id, missingInvoiceFields)
  } else {
    console.log('• All invoice model fields already exist')
  }

  // 3) Add `member.invoices` multiple-links field pointing to the invoice model
  const memberType = await findItemType(MEMBER_MODEL)
  if (!memberType) {
    console.error(`✗ Could not find model "${MEMBER_MODEL}" in environment "${environment}".`)
    process.exitCode = 1
    return
  }

  const memberFields = new Set((await client.fields.list(MEMBER_MODEL)).map((f: any) => f.api_key))

  if (!memberFields.has('invoices')) {
    try {
      await client.fields.create(MEMBER_MODEL, {
        label: 'Fakturor',
        api_key: 'invoices',
        field_type: 'links',
        hint: 'Medlemmens fakturor (Fortnox). Uppdateras automatiskt.',
        validators: { items_item_type: { item_types: [INVOICE_MODEL] } }
      })
      console.log(`✓ Created field "invoices" on ${MEMBER_MODEL} → ${INVOICE_MODEL}`)
    } catch (err: any) {
      console.error(`✗ Failed to create "invoices" on ${MEMBER_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  } else {
    console.log(`• "invoices" field already exists on ${MEMBER_MODEL}`)
  }

  // 4) Remove the obsolete fields from the member model (now stored on invoice records)
  const toRemove = ['latest_invoice_year', 'invoice_paid', 'fortknox_invoice_number']
  const memberFieldList = await client.fields.list(MEMBER_MODEL)
  for (const apiKey of toRemove) {
    const field = memberFieldList.find((f: any) => f.api_key === apiKey)
    if (!field) {
      console.log(`• "${apiKey}" not present on ${MEMBER_MODEL} — nothing to remove`)
      continue
    }
    try {
      await client.fields.destroy(field.id)
      console.log(`✓ Removed obsolete field "${apiKey}" from ${MEMBER_MODEL}`)
    } catch (err: any) {
      console.error(`✗ Failed to remove field "${apiKey}" from ${MEMBER_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  }

  console.log(`\nDone. Migrations applied in environment "${environment}".`)
}

run()
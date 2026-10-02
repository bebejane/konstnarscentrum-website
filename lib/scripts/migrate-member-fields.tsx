import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { buildClient } from '@datocms/cma-client-node'

const environment = process.env.DATOCMS_ENVIRONMENT ?? 'main'
const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string, environment })

const INVOICE_MODEL = 'invoice'
const MEMBER_MODEL = 'member'
const REGION_MODEL = 'region'

const FIELD_TYPE_TO_EDITOR: Record<string, string> = {
  string: 'single_line',
  integer: 'integer',
  float: 'float',
  boolean: 'boolean',
  date: 'date_picker'
}

type FieldSpec = {
  api_key: string
  label: string
  field_type: 'string' | 'integer' | 'float' | 'boolean' | 'date'
  hint?: string
  validators?: Record<string, unknown>
}

// Model + fields for the new `invoice` record type. One record per Fortnox invoice,
// linked to its member via invoice.member and to a region via invoice.region.
// All fields are required except `payment_date`. Kept in sync by the cron / dispatch code.
const INVOICE_FIELDS: FieldSpec[] = [
  {
    api_key: 'fortnox_document_number',
    label: 'Fortnox dokumentnummer',
    field_type: 'string',
    hint: 'Fortnox document number (invoice id).',
    validators: { required: {} }
  },
  {
    api_key: 'payment_status',
    label: 'Betalningsstatus',
    field_type: 'string',
    hint: 'Fortnox invoice status, e.g. UNPAID / PARTIALLYPAID / FULLYPAID. Uppdateras av cron.',
    validators: { required: {} }
  },
  {
    api_key: 'payment_date',
    label: 'Betalningsdatum',
    field_type: 'date',
    hint: 'Datum när fakturan betalades i Fortnox. Uppdateras av cron.'
  },
  {
    api_key: 'due_date',
    label: 'Förfallodatum',
    field_type: 'date',
    hint: 'Datum när fakturan förfaller till betalning i Fortnox. Uppdateras av cron.',
    validators: { required: {} }
  },
  {
    api_key: 'invoice_year',
    label: 'Faktureringsår',
    field_type: 'integer',
    hint: 'Det år medlemsavgiften avser.',
    validators: { required: {} }
  },
  {
    api_key: 'total',
    label: 'Belopp',
    field_type: 'float',
    hint: 'Fakturabelopp inkl. moms.',
    validators: { required: {} }
  },
  {
    api_key: 'fortnox_customer_number',
    label: 'Fortnox kundnummer',
    field_type: 'string',
    hint: 'Fortnox customer number fakturan hör till.',
    validators: { required: {} }
  }
]

async function findItemType(apiKey: string) {
  try {
    return await client.itemTypes.find(apiKey)
  } catch {
    return null
  }
}

async function upsertFields(itemTypeId: string, spec: FieldSpec[]) {
  const existing = new Map(
    (await client.fields.list(itemTypeId)).map((f: any) => [f.api_key, f])
  )
  for (const field of spec) {
    const current = existing.get(field.api_key)
    try {
      if (current) {
        await client.fields.update(current.id, { validators: field.validators ?? {} })
        console.log(`✓ Updated field "${field.api_key}" on ${itemTypeId} (validators ${JSON.stringify(field.validators ?? {})})`)
      } else {
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
      }
    } catch (err: any) {
      console.error(`✗ Failed to upsert field "${field.api_key}" on ${itemTypeId}: ${err?.message ?? err}`)
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

  // 2) Create/update the invoice scalar fields (all required except payment_date)
  await upsertFields(invoiceType.id, INVOICE_FIELDS)

  // 3) Link invoices to members: ensure the required `invoice.member` link field
  //    and drop the obsolete `member.invoices` links field.
  const memberType = await findItemType(MEMBER_MODEL)
  if (!memberType) {
    console.error(`✗ Could not find model "${MEMBER_MODEL}" in environment "${environment}".`)
    process.exitCode = 1
    return
  }

  const invoiceFields = await client.fields.list(invoiceType.id)
  const invoiceFieldKeys = new Set(invoiceFields.map((f: any) => f.api_key))
  const memberField = invoiceFields.find((f: any) => f.api_key === 'member')
  const memberValidators = {
    required: {},
    item_item_type: { item_types: [memberType.id] }
  }
  try {
    if (memberField) {
      await client.fields.update(memberField.id, { validators: memberValidators })
      console.log(`✓ Updated field "member" on ${INVOICE_MODEL} (required + item type)`)
    } else {
      await client.fields.create(INVOICE_MODEL, {
        label: 'Medlem',
        api_key: 'member',
        field_type: 'link',
        hint: 'Medlemmen fakturan avser.',
        validators: memberValidators
      })
      console.log(`✓ Created field "member" on ${INVOICE_MODEL} → ${MEMBER_MODEL}`)
    }
  } catch (err: any) {
    console.error(`✗ Failed to upsert "member" on ${INVOICE_MODEL}: ${err?.message ?? err}`)
    process.exitCode = 1
  }

  // 4) Convert `invoice.region` from a free-text slug to a required link to the
  //    `region` model. Field types can't be changed in place, so a string field
  //    is destroyed and recreated as a link, backfilling each record from its
  //    old slug value.
  const regionType = await findItemType(REGION_MODEL)
  if (!regionType) {
    console.error(`✗ Could not find model "${REGION_MODEL}" in environment "${environment}".`)
    process.exitCode = 1
    return
  }

  const regionField = (await client.fields.list(invoiceType.id)).find((f: any) => f.api_key === 'region')
  const regionValidators = {
    required: {},
    item_item_type: { item_types: [regionType.id] }
  }
  if (!regionField) {
    try {
      await client.fields.create(INVOICE_MODEL, {
        label: 'Region',
        api_key: 'region',
        field_type: 'link',
        hint: 'Regionen fakturan fakturerades på.',
        validators: regionValidators
      })
      console.log(`✓ Created field "region" on ${INVOICE_MODEL} → ${REGION_MODEL}`)
    } catch (err: any) {
      console.error(`✗ Failed to create "region" on ${INVOICE_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  } else if (regionField.field_type === 'link') {
    try {
      await client.fields.update(regionField.id, { validators: regionValidators })
      console.log(`✓ Updated field "region" on ${INVOICE_MODEL} (required + item type)`)
    } catch (err: any) {
      console.error(`✗ Failed to update "region" on ${INVOICE_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  } else {
    try {
      // Read the old string values before destroying the field
      const slugToRegionId = new Map<string, string>()
      for await (const region of client.items.listPagedIterator({ filter: { type: REGION_MODEL } })) {
        const rec = region as any
        if (rec.slug) slugToRegionId.set(rec.slug, rec.id)
      }

      const backfill: { id: string; regionId: string }[] = []
      for await (const invoice of client.items.listPagedIterator({ filter: { type: INVOICE_MODEL } })) {
        const rec = invoice as any
        if (typeof rec.region !== 'string' || !rec.region) continue
        const regionId = slugToRegionId.get(rec.region)
        if (regionId) backfill.push({ id: rec.id, regionId })
      }

      await client.fields.destroy(regionField.id)
      console.log(`✓ Removed string field "region" from ${INVOICE_MODEL}`)

      await client.fields.create(INVOICE_MODEL, {
        label: 'Region',
        api_key: 'region',
        field_type: 'link',
        hint: 'Regionen fakturan fakturerades på.',
        validators: regionValidators
      })
      console.log(`✓ Created link field "region" on ${INVOICE_MODEL} → ${REGION_MODEL}`)

      let linked = 0
      for (const b of backfill) {
        await client.items.update(b.id, { region: b.regionId })
        linked++
      }
      console.log(`✓ Backfilled "region" on ${linked} invoice record(s)`)
    } catch (err: any) {
      console.error(`✗ Failed to migrate "region" on ${INVOICE_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  }

  const memberFieldList = await client.fields.list(MEMBER_MODEL)
  const memberFields = new Set(memberFieldList.map((f: any) => f.api_key))
  const legacyInvoicesField = memberFieldList.find((f: any) => f.api_key === 'invoices')
  if (legacyInvoicesField) {
    try {
      await client.fields.destroy(legacyInvoicesField.id)
      memberFields.delete('invoices')
      console.log(`✓ Removed obsolete field "invoices" from ${MEMBER_MODEL}`)
    } catch (err: any) {
      console.error(`✗ Failed to remove "invoices" from ${MEMBER_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  } else {
    console.log(`• "invoices" not present on ${MEMBER_MODEL} — nothing to remove`)
  }

  // 5) Rename member.fortknox_customer_number -> member.fortnox_customer_number
  //    (legacy misspelling; copy values, then drop the old field)
  const legacyField = memberFieldList.find((f: any) => f.api_key === 'fortknox_customer_number')

  if (!memberFields.has('fortnox_customer_number')) {
    try {
      await client.fields.create(MEMBER_MODEL, {
        label: 'Fortnox kundnummer',
        api_key: 'fortnox_customer_number',
        field_type: 'string',
        hint: 'Kundnumret medlemmen har i regionens Fortnox.',
        validators: {},
        appearance: { editor: 'single_line', parameters: {}, addons: [] }
      })
      console.log(`✓ Created field "fortnox_customer_number" on ${MEMBER_MODEL}`)
    } catch (err: any) {
      console.error(`✗ Failed to create "fortnox_customer_number" on ${MEMBER_MODEL}: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  } else {
    console.log(`• "fortnox_customer_number" field already exists on ${MEMBER_MODEL}`)
  }

  if (legacyField) {
    try {
      let copied = 0
      for await (const item of client.items.listPagedIterator({ filter: { type: MEMBER_MODEL } })) {
        const value = (item as any).fortknox_customer_number
        if (!value) continue
        await client.items.update(item.id, { fortnox_customer_number: value })
        copied++
      }
      await client.fields.destroy(legacyField.id)
      console.log(`✓ Renamed fortknox_customer_number -> fortnox_customer_number (copied ${copied} member(s))`)
    } catch (err: any) {
      console.error(`✗ Failed to rename fortknox_customer_number: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  } else {
    console.log(`• "fortknox_customer_number" not present on ${MEMBER_MODEL} — nothing to rename`)
  }

  // 6) Remove the obsolete fields from the member model (now stored on invoice records)
  const toRemove = ['latest_invoice_year', 'invoice_paid', 'fortknox_invoice_number']
  for (const apiKey of toRemove) {
    const field = (await client.fields.list(MEMBER_MODEL)).find((f: any) => f.api_key === apiKey)
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
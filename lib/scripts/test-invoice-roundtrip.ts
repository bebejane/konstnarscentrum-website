import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import client from '../client'
import regions from '../../regions.json'
import {
  createAnnualInvoiceForMember,
  syncMemberInvoicePaymentStatus
} from '../fortnox/invoiceDispatch'
import { getInvoice, isInvoicePaid } from '../fortnox/invoices'

/**
 * Single-member invoice round-trip test.
 *
 * Creates (and possibly emails, via the allowlist) an annual invoice for ONE
 * member in the dev DatoCMS environment, links the resulting invoice record,
 * then polls payment status. Safe because only FORTNOX_EMAIL_ALLOWLIST emails
 * receive the Fortnox email.
 *
 * Usage: npm run testroundtrip -- <member-email> [invoiceYear]
 * Example: npm run testroundtrip -- mattias@konst-teknik.se 2026
 */
const main = async () => {
  const email = process.argv[2]
  const invoiceYear = Number(process.argv[3] ?? new Date().getFullYear())

  if (!email) {
    console.error('Usage: npm run testroundtrip -- <member-email> [invoiceYear]')
    process.exit(1)
  }

  console.log(`DatoCMS environment: ${process.env.DATOCMS_ENVIRONMENT ?? 'main'}`)
  console.log(`Looking up member ${email} for invoice year ${invoiceYear}...`)

  const members = await client.items.list({
    filter: {
      type: 'member',
      fields: { email: { eq: email.toLowerCase() } }
    }
  })
  const member = members[0]
  if (!member) {
    console.error(`No member found with email "${email}" in this DatoCMS environment.`)
    process.exit(1)
  }

  const region = regions.find(r => r.id === member.region)
  console.log(`Member: ${member.first_name ?? ''} ${member.last_name ?? ''} (${member.id})`)
  console.log(`Region: ${region?.name ?? member.region ?? 'NONE'}`)

  if (!member.fortnox_customer_number) {
    console.error('Member has no fortnox_customer_number. Run "npm run syncfortknox" first.')
    process.exit(1)
  }
  if (!region) {
    console.error('Member has no matching region.')
    process.exit(1)
  }

  console.log(`\nCreating Fortnox invoice + DatoCMS invoice record...`)
  const result = await createAnnualInvoiceForMember(member, invoiceYear)
  console.log(`✓ Invoice created. Document number: ${result.documentNumber}`)
  console.log(`✓ DatoCMS invoice record: ${result.invoiceRecordId} (linked to member)`)

  console.log('\nFetching invoice from Fortnox...')
  const fortnoxInvoice = await getInvoice(region.slug, result.documentNumber)
  console.log(`  Status: ${fortnoxInvoice.Status}`)
  console.log(`  Total:  ${fortnoxInvoice.Total}`)
  console.log(`  Paid:   ${isInvoicePaid(fortnoxInvoice)}`)

  console.log('\nPolling payment status (sync to DatoCMS)...')
  const freshMember = await client.items.find(member.id)
  const sync = await syncMemberInvoicePaymentStatus(freshMember)
  console.log(`  Updated records: ${sync?.updated ?? 0}`)

  console.log('\nRound-trip complete.')
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err?.message ?? err)
    process.exit(1)
  })
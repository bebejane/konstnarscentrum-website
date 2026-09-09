import client from '/lib/client'
import regions from '../../regions.json'

let invoiceItemTypeId: string | null = null

const getInvoiceItemTypeId = async (): Promise<string> => {
  if (invoiceItemTypeId) return invoiceItemTypeId
  const types = await client.itemTypes.list()
  const invoiceType = types.find(t => (t as any).name === 'Invoice')
  if (!invoiceType) throw new Error('DatoCMS model "Invoice" not found')
  invoiceItemTypeId = invoiceType.id
  return invoiceItemTypeId
}
import {
  FORTNOX_INVOICE_ACCOUNT,
  FORTNOX_INVOICE_AMOUNT,
  FORTNOX_INVOICE_DUE_DAYS,
  getFortnoxTokenFromEnv,
  isEmailAllowedToSend
} from './constants'
import { createInvoice, sendInvoiceAsEmail, getInvoice, isInvoicePaid, isInvoicePartiallyPaid } from './invoices'
import { hasFortnoxCredentials } from './auth'
import type { MemberItem } from './sync'
import { format } from 'date-fns'

export type InvoiceRecord = {
  id: string
  fortnox_document_number?: string
  payment_status?: string
  payment_date?: string | null
  invoice_year?: number
  total?: number
  fortnox_customer_number?: string
  region?: string
  [key: string]: any
}

/**
 * Normalize the member's `invoices` link field into a list of invoice ids.
 * CMA may return link fields as arrays of full objects or arrays of ids.
 */
const getMemberInvoiceIds = (member: MemberItem): string[] => {
  const inv = member.invoices
  if (!Array.isArray(inv)) return []
  return inv
    .map((i) => (typeof i === 'string' ? i : (i as any)?.id))
    .filter(Boolean)
}

/**
 * Fetch the full invoice records linked to a member.
 */
const getMemberInvoices = async (member: MemberItem): Promise<InvoiceRecord[]> => {
  const ids = getMemberInvoiceIds(member)
  const records: InvoiceRecord[] = []
  for (const id of ids) {
    try {
      records.push(await client.items.find(id))
    } catch {
      // Incomplete/linked-to-missing record — skip
    }
  }
  return records
}

/**
 * Pure eligibility check given a member, the target invoice year, its linked
 * invoice records, and whether Fortnox credentials exist for the member's
 * region. Extracted from `isEligibleForInvoice` so it can be unit-tested
 * without network access.
 */
export const isEligibleForInvoiceFromRecords = (
  member: MemberItem,
  invoiceYear: number,
  records: InvoiceRecord[],
  hasCredentials: boolean
): { eligible: boolean; reason?: string } => {
  const region = regions.find(r => r.id === member.region)

  if (!region) return { eligible: false, reason: 'no region' }
  if (!hasCredentials)
    return { eligible: false, reason: `no fortnox credentials (${region.slug})` }
  if (!member.fortnox_customer_number)
    return { eligible: false, reason: 'no fortnox customer number' }
  if (member.vilande) return { eligible: false, reason: 'vilande' }

  if (records.some(inv => inv.invoice_year === invoiceYear))
    return { eligible: false, reason: `already invoiced ${invoiceYear}` }

  return { eligible: true }
}

/**
 * Eligibility for receiving the annual invoice:
 * - has region + fortnox credentials
 * - has a linked fortnox customer number
 * - not dormant (vilande)
 * - does not already have a linked invoice record for `invoiceYear`
 */
export const isEligibleForInvoice = async (
  member: MemberItem,
  invoiceYear: number
): Promise<{ eligible: boolean; reason?: string }> => {
  const region = regions.find(r => r.id === member.region)
  const records = await getMemberInvoices(member)
  return isEligibleForInvoiceFromRecords(
    member,
    invoiceYear,
    records,
    region ? hasFortnoxCredentials(region.slug) : false
  )
}

/**
 * Create and send the annual membership invoice for a member via Fortnox,
 * then create a matching DatoCMS `invoice` record and link it to the member.
 */
export const createAnnualInvoiceForMember = async (
  member: MemberItem,
  invoiceYear: number
): Promise<{ documentNumber: string; invoiceRecordId: string }> => {
  const region = regions.find(r => r.id === member.region)
  if (!region) throw new Error(`Member ${member.id} has no region`)
  if (!member.fortnox_customer_number)
    throw new Error(`Member ${member.id} has no Fortnox customer number`)
  if (!hasFortnoxCredentials(region.slug))
    throw new Error(`Fortnox is disabled or not configured for region ${region.slug}`)

  const invoiceDate = new Date()
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + FORTNOX_INVOICE_DUE_DAYS)

  const invoice = await createInvoice(region.slug, {
    CustomerNumber: member.fortnox_customer_number,
    InvoiceDate: format(invoiceDate, 'yyyy-MM-dd'),
    DueDate: format(dueDate, 'yyyy-MM-dd'),
    InvoiceRows: [
      {
        Description: `Medlemsavgift ${invoiceYear}`,
        Price: FORTNOX_INVOICE_AMOUNT,
        DeliveredQuantity: 1,
        ...(FORTNOX_INVOICE_ACCOUNT ? { AccountNumber: FORTNOX_INVOICE_ACCOUNT } : {})
      }
    ]
  })

  // Send via Fortnox email (guarded by the email allowlist)
  if (isEmailAllowedToSend(member.email)) {
    await sendInvoiceAsEmail(region.slug, invoice.DocumentNumber)
  } else {
    console.log(
      `[${member.id}] invoice ${invoice.DocumentNumber} created but NOT emailed (email not in FORTNOX_EMAIL_ALLOWLIST)`
    )
  }

  // Create a DatoCMS invoice record linked to the member
  const invoiceRecord = await client.items.create({
    item_type: { type: 'item_type', id: await getInvoiceItemTypeId() },
    ...({
      fortnox_document_number: String(invoice.DocumentNumber),
      payment_status: invoice.Status ?? 'UNPAID',
      payment_date: null,
      invoice_year: invoiceYear,
      total: typeof invoice.Total === 'number' ? invoice.Total : 0,
      fortnox_customer_number: member.fortnox_customer_number,
      region: region.slug
    } as any)
  })

  // Link it into the member's `invoices` field
  await client.items.update(member.id, {
    invoices: [...getMemberInvoiceIds(member), invoiceRecord.id]
  })

  return { documentNumber: invoice.DocumentNumber, invoiceRecordId: invoiceRecord.id }
}

/**
 * Poll Fortnox for the current payment state of a member's linked invoice
 * records and update each DatoCMS `invoice` record accordingly.
 *
 * Returns the number of records updated (0 when nothing changed).
 */
export const syncMemberInvoicePaymentStatus = async (member: MemberItem): Promise<{ updated: number }> => {
  const region = regions.find(r => r.id === member.region)
  if (!region) return { updated: 0 }
  if (!hasFortnoxCredentials(region.slug)) return { updated: 0 }

  const invoices = await getMemberInvoices(member)
  let updated = 0

  for (const rec of invoices) {
    const docNumber = rec.fortnox_document_number
    const recRegion = rec.region ?? region.slug
    if (!docNumber) continue

    try {
      const invoice = await getInvoice(recRegion, docNumber)
      const payment_status = String(invoice.Status ?? rec.payment_status ?? 'UNPAID')
      const payment_date =
        invoice.FinalPayDate ?? (isInvoicePaid(invoice) || isInvoicePartiallyPaid(invoice) ? invoice.FinalPayDate ?? null : null)
      const changes: Record<string, unknown> = {
        payment_status,
        total: typeof invoice.Total === 'number' ? invoice.Total : rec.total ?? 0
      }
      if (payment_date) changes.payment_date = payment_date

      const needsUpdate =
        rec.payment_status !== changes.payment_status ||
        (payment_date && rec.payment_date !== payment_date)

      if (needsUpdate) {
        await client.items.update(rec.id, changes as any)
        updated++
      }
    } catch {
      // Unreachable/invalid document — leave as-is
    }
  }

  return { updated }
}
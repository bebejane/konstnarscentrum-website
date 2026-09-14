import { fortnoxFetch } from './client'
import { FORTNOX_API_BASE } from './constants'
import { getAccessToken } from './auth'

export type FortnoxInvoice = {
  DocumentNumber: string
  CustomerNumber: string
  InvoiceDate: string
  DueDate: string
  Total: number
  VATIncluded: boolean
  Sent?: boolean
  FinalPayDate?: string
  Balance?: number
  Name?: string
  EmailInformation?: Record<string, any>
  URL?: string
  [key: string]: any
}

export type CreateInvoiceInput = {
  CustomerNumber: string
  InvoiceDate: string
  DueDate: string
  Currency?: string
  InvoiceRows: {
    Description: string
    Price: number
    DeliveredQuantity: number
    AccountNumber?: number
    VATCode?: string
  }[]
}

/**
 * Create an invoice in Fortnox. Returns the created invoice (usually as a draft
 * unless `Sent` or the send flow is triggered separately).
 */
export const createInvoice = async (regionSlug: string, input: CreateInvoiceInput): Promise<FortnoxInvoice> => {
  const res = await fortnoxFetch(regionSlug, '/invoices', {
    method: 'POST',
    body: { Invoice: input }
  })
  return res?.Invoice
}

/**
 * Send the invoice as an email via Fortnox's own sending (EmailInformation on
 * the customer / invoice is used for the recipient).
 */
export const sendInvoiceAsEmail = async (regionSlug: string, documentNumber: string): Promise<void> => {
  await fortnoxFetch(regionSlug, `/invoices/${encodeURIComponent(documentNumber)}/email`, { method: 'GET' })
}

/**
 * Send the invoice as a printed letter (e-print). Available if paper sending
 * is enabled on the account.
 */
export const sendInvoiceAsEPrint = async (regionSlug: string, documentNumber: string): Promise<void> => {
  await fortnoxFetch(regionSlug, `/invoices/${encodeURIComponent(documentNumber)}/eprint`, { method: 'GET' })
}

export const getInvoice = async (regionSlug: string, documentNumber: string): Promise<FortnoxInvoice> => {
  const res = await fortnoxFetch(regionSlug, `/invoices/${encodeURIComponent(documentNumber)}`)
  return res?.Invoice
}

/**
 * Fetch the invoice PDF (printout) from Fortnox. Returns the raw PDF bytes.
 */
export const getInvoicePdf = async (
  regionSlug: string,
  documentNumber: string
): Promise<ArrayBuffer> => {
  const accessToken = await getAccessToken(regionSlug)
  const url = `${FORTNOX_API_BASE}/invoices/${encodeURIComponent(documentNumber)}/print`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!res.ok) {
    let detail = ''
    try {
      const errBody = await res.json()
      detail = errBody?.ErrorInformation?.Message ?? JSON.stringify(errBody)
    } catch {
      detail = await res.text()
    }
    throw new Error(`Fortnox PDF fetch failed (${res.status}): ${detail}`)
  }

  return res.arrayBuffer()
}

export const listInvoicesForCustomer = async (
  regionSlug: string,
  customerNumber: string
): Promise<FortnoxInvoice[]> => {
  const invoices: FortnoxInvoice[] = []
  let offset = 0
  const limit = 100
  let hasMore = true

  while (hasMore) {
    const res = await fortnoxFetch(
      regionSlug,
      `/invoices?customernumber=${encodeURIComponent(customerNumber)}&limit=${limit}&offset=${offset}`
    )
    const page: FortnoxInvoice[] = res?.Invoices ?? []
    invoices.push(...page)
    offset += limit
    hasMore = page.length === limit
  }

  return invoices
}

/**
 * Determine whether an invoice is fully paid.
 * Fortnox statuses: PAID / PARTIALLYPAID / SENT / UNPAID / OVERDUE / etc.
 * A fully paid invoice has status "FULLYPAID" or a FinalPayDate set or a zero balance.
 */
export const isInvoicePaid = (invoice: FortnoxInvoice): boolean => {
  const status = String(invoice?.Status ?? '').toUpperCase()
  if (status === 'FULLYPAID' || status === 'PAID') return true
  // PARTIALLYPAID should not count as fully paid
  if (status === 'PARTIALLYPAID' || status === 'PARTLYPAID') return false
  // Heuristic fallback
  if (invoice?.FinalPayDate) return true
  if (typeof invoice?.Balance === 'number' && invoice.Balance === 0) return true
  return false
}

export const isInvoicePartiallyPaid = (invoice: FortnoxInvoice): boolean => {
  const status = String(invoice?.Status ?? '').toUpperCase()
  return status === 'PARTIALLYPAID' || status === 'PARTLYPAID'
}

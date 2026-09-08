import { NextApiRequest, NextApiResponse } from 'next'
import client from '/lib/client'
import { getAllMembers } from '/lib/fortnox/sync'
import { createAnnualInvoiceForMember, isEligibleForInvoice } from '/lib/fortnox/invoiceDispatch'
import { parseDatoError } from '/lib/utils'

export const config = {
  maxDuration: 300
}

const isAuthorized = (req: NextApiRequest) => {
  const auth = req.headers.authorization
  if (!auth) return false
  const [user, pwd] = Buffer.from(auth.split(' ')[1] ?? '', 'base64').toString().split(':')
  return user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD
}

/**
 * Bulk-create and send annual invoices to all eligible members.
 *
 * POST /api/fortnox/invoices
 * Body: { invoiceYear?: number }  (defaults to current year)
 *
 * Auth: Basic Auth (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)
 *
 * This is triggered by the DatoCMS plugin's "Skicka fakturor" button.
 * Idempotency: members already invoiced for `invoiceYear` are skipped.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' })

  if (req.body?.ping) return res.status(200).json({ pong: true })

  const invoiceYear = Number(req.body?.invoiceYear ?? new Date().getFullYear())

  try {
    const members = await getAllMembers()
    const results = { created: 0, skipped: 0, failed: 0, errors: [] as string[], invoices: [] as string[] }

    for (const member of members) {
      const { eligible, reason } = await isEligibleForInvoice(member, invoiceYear)
      if (!eligible) {
        results.skipped++
        continue
      }

      try {
        const { documentNumber } = await createAnnualInvoiceForMember(member, invoiceYear)
        results.created++
        results.invoices.push(documentNumber)
      } catch (err: any) {
        results.failed++
        results.errors.push(`[${member.id}] ${err?.message ?? err}`)
      }
    }

    return res.status(200).json({ ...results, invoiceYear })
  } catch (err) {
    return res.status(500).json({ error: parseDatoError(err) })
  }
}

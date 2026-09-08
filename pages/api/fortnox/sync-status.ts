import { NextApiRequest, NextApiResponse } from 'next'
import client from '/lib/client'
import { getAllMembers } from '/lib/fortnox/sync'
import { syncMemberInvoicePaymentStatus } from '/lib/fortnox/invoiceDispatch'
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
 * Poll Fortnox for updated invoice payment statuses and persist to DatoCMS.
 *
 * GET/POST /api/fortnox/sync-status
 * Auth: Basic Auth (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)
 *
 * Runs on a daily cron (see vercel.json).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' })

  if (req.body?.ping) return res.status(200).json({ pong: true })

  try {
    const members = await getAllMembers()
    const results = { polled: 0, updated: 0, skipped: 0, failed: 0, errors: [] as string[] }

    for (const member of members) {
      if (!Array.isArray(member.invoices) || member.invoices.length === 0) {
        results.skipped++
        continue
      }

      try {
        const change = await syncMemberInvoicePaymentStatus(member)
        results.polled++
        results.updated += change?.updated ?? 0
      } catch (err: any) {
        results.failed++
        results.errors.push(`[${member.id}] ${err?.message ?? err}`)
      }
    }

    return res.status(200).json(results)
  } catch (err) {
    return res.status(500).json({ error: parseDatoError(err) })
  }
}

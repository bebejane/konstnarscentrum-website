import withAuthentication from '/lib/auth/withAuthentication'
import client from '/lib/client'

/**
 * List the logged-in member's invoice records stored in DatoCMS.
 * The records are kept in sync with Fortnox by the invoice dispatch + cron.
 *
 * GET /api/fortnox/member-invoices
 * Auth: NextAuth session
 */
export default withAuthentication(async (req, res, session) => {
  const email = session.user?.email
  if (!email) return res.status(401).json({ error: 'Unauthorized' })

  const members = await client.items.list({
    filter: {
      type: 'member',
      fields: { email: { eq: email.toLowerCase() } }
    }
  })
  const member = members[0] as
    | {
        id: string;
        email?: string;
        region?: string;
        fortnox_customer_number?: string;
        invoices?: (string | { id: string; [key: string]: any })[];
      }
    | undefined;

  if (!member)
    return res.status(404).json({ error: 'Member not found' })

  if (!member.fortnox_customer_number || !Array.isArray(member.invoices) || member.invoices.length === 0)
    return res.status(200).json({ invoices: [], customerNumber: member.fortnox_customer_number ?? null })

  // Normalize links to full invoice records if CMA returns them nested, else fetch
  const ids = member.invoices.map(i => (typeof i === 'string' ? i : (i as any).id))
  const records: any[] = []
  for (const id of ids) {
    const nested = member.invoices.find(i => typeof i !== 'string' && (i as any).id === id)
    if (nested && typeof nested !== 'string') {
      records.push(nested)
    } else {
      try {
        records.push(await client.items.find(id))
      } catch {
        // skip missing
      }
    }
  }

  const list = records
    .map(inv => ({
      id: inv.id,
      documentNumber: inv.fortnox_document_number ?? null,
      invoiceYear: inv.invoice_year ?? null,
      paymentStatus: inv.payment_status ?? null,
      paymentDate: inv.payment_date ?? null,
      total: typeof inv.total === 'number' ? inv.total : null,
      region: inv.region ?? null
    }))
    .sort((a, b) => String(b.invoiceYear ?? '').localeCompare(String(a.invoiceYear ?? '')))

  return res.status(200).json({ invoices: list, customerNumber: member.fortnox_customer_number })
})
import client from '/lib/client'
import regions from '../../regions.json'
import { createCustomer, getCustomer, listCustomers, updateCustomer } from './customers'
import { hasFortnoxCredentials } from './auth'
import type { FortnoxCustomer } from './customers'

export type MemberItem = {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  city?: string
  region?: string
  active?: boolean
  vilande?: boolean
  fortnox_customer_number?: string
  invoices?: (string | { id: string })[]
  [key: string]: any
}

/**
 * Strip characters Fortnox rejects in free-text fields (e.g. emoji / Unicode
 * symbols). Keeps letters, digits, whitespace and punctuation, collapses
 * repeated whitespace, and trims. Returns undefined when nothing remains.
 */
export const sanitizeText = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  const cleaned = value.replace(/[\p{S}]/gu, '').replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

/**
 * Map a DatoCMS member to the data we send to Fortnox as a customer.
 * Email is the join key between the systems.
 */
export const memberToCustomer = (member: MemberItem): Partial<FortnoxCustomer> => {
  const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ') || undefined
  return {
    Name: sanitizeText(fullName),
    Email: member.email,
    City: sanitizeText(member.city || undefined),
    // Store the DatoCMS member id for reverse lookup
    ExternalReference: member.id
  }
}

/**
 * Best-effort lookup: find the first Fortnox customer in a region whose email
 * matches. Fortnox's /customers list does not support an email filter, so we
 * fetch and match client-side. Returns null when no match is found.
 */
const findCustomerByEmail = async (regionSlug: string, email: string): Promise<FortnoxCustomer | null> => {
  const needle = (email ?? '').toLowerCase()
  if (!needle) return null
  const all = await listCustomers(regionSlug)
  return all.find(c => (c.Email ?? '').toLowerCase() === needle) ?? null
}

/**
 * Sync a single member to its region's Fortnox account.
 * - If member already has a customer number, update that Fortnox customer.
 * - Else try to link an existing Fortnox customer by email.
 * - Else create a new Fortnox customer.
 *
 * Returns the Fortnox customer number and whether a new customer was created.
 */
export const syncMemberToFortKnox = async (member: MemberItem): Promise<{ customerNumber: string; created: boolean }> => {
  const region = regions.find(r => r.id === member.region)

  if (!region) throw new Error(`Member ${member.id} has no matching region`)
  if (!member.email) throw new Error(`Member ${member.id} has no email`)
  if (!member.first_name && !member.last_name) throw new Error(`Member ${member.id} has no name`)
  if (!hasFortnoxCredentials(region.slug))
    throw new Error(`Fortnox is disabled or not configured for region ${region.slug}`)

  const data = memberToCustomer(member)

  // 1) Already linked to a customer?
  if (member.fortnox_customer_number) {
    const existing = await getCustomer(region.slug, member.fortnox_customer_number)
    if (existing) {
      await updateCustomer(region.slug, member.fortnox_customer_number, data)
      return { customerNumber: member.fortnox_customer_number, created: false }
    }
    // Number set but missing in Fortnox -> fall through and create
  }

  // 2) Match an existing Fortnox customer by email (handles pre-existing customers)
  const match = await findCustomerByEmail(region.slug, member.email)
  if (match) {
    await client.items.update(member.id, { fortnox_customer_number: match.CustomerNumber })
    await updateCustomer(region.slug, match.CustomerNumber, data)
    return { customerNumber: match.CustomerNumber, created: false }
  }

  // 3) Create a new customer
  const created = await createCustomer(region.slug, data)
  await client.items.update(member.id, { fortnox_customer_number: created.CustomerNumber })
  return { customerNumber: created.CustomerNumber, created: true }
}

/**
 * Fetch all members from DatoCMS (paginated via CMA).
 */
export const getAllMembers = async (): Promise<MemberItem[]> => {
  const members: MemberItem[] = []
  for await (const record of client.items.listPagedIterator({ filter: { type: 'member' } })) {
    members.push(record as MemberItem)
  }
  return members
}

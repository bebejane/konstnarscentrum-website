import { fortnoxFetch } from './client'

export type FortnoxCustomer = {
  CustomerNumber: string
  Name?: string
  Email?: string
  City?: string
  ZipCode?: string
  Address1?: string
  YourReference?: string
  ExternalReference?: string
  [key: string]: any
}

export const getCustomer = async (regionSlug: string, customerNumber: string): Promise<FortnoxCustomer | null> => {
  try {
    const res = await fortnoxFetch(regionSlug, `/customers/${encodeURIComponent(customerNumber)}`)
    return res?.Customer ?? null
  } catch (err: any) {
    // 404 means the customer doesn't exist
    if (err?.message?.includes('(404)')) return null
    throw err
  }
}

export const listCustomers = async (regionSlug: string): Promise<FortnoxCustomer[]> => {
  const customers: FortnoxCustomer[] = []
  let offset = 0
  const limit = 100
  let hasMore = true

  while (hasMore) {
    const res = await fortnoxFetch(regionSlug, `/customers?limit=${limit}&offset=${offset}`)
    const page: FortnoxCustomer[] = res?.Customers ?? []
    customers.push(...page)
    offset += limit
    hasMore = page.length === limit
  }

  return customers
}

export const createCustomer = async (
  regionSlug: string,
  data: Partial<FortnoxCustomer>
): Promise<FortnoxCustomer> => {
  const res = await fortnoxFetch(regionSlug, '/customers', { method: 'POST', body: { Customer: data } })
  return res?.Customer
}

export const updateCustomer = async (
  regionSlug: string,
  customerNumber: string,
  data: Partial<FortnoxCustomer>
): Promise<FortnoxCustomer> => {
  const res = await fortnoxFetch(regionSlug, `/customers/${encodeURIComponent(customerNumber)}`, {
    method: 'PUT',
    body: { Customer: data }
  })
  return res?.Customer
}

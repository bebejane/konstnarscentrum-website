import { FORTNOX_API_BASE } from './constants'
import { getAccessToken } from './auth'

export type FortnoxRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, any>
}

/**
 * Low-level Fortnox API helper. Adds Bearer auth and JSON handling.
 * Throws a descriptive Error on non-2xx responses.
 */
export const fortnoxFetch = async (
  regionSlug: string,
  path: string,
  { method = 'GET', body }: FortnoxRequestOptions = {}
): Promise<any> => {
  const accessToken = await getAccessToken(regionSlug)
  const url = `${FORTNOX_API_BASE}${path}`

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  if (!res.ok) {
    let detail = ''
    try {
      const errBody = await res.json()
      detail = errBody?.ErrorInformation?.Message ?? JSON.stringify(errBody)
    } catch {
      detail = await res.text()
    }
    throw new Error(`Fortnox ${method} ${path} failed (${res.status}): ${detail}`)
  }

  if (res.status === 204) return undefined

  const contentType = res.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

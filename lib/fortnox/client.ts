import { FORTNOX_API_BASE } from './constants';
import { getAccessToken } from './auth';

export type FortnoxRequestOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: Record<string, any>;
};

/**
 * Low-level Fortnox API helper. Adds Bearer auth and JSON handling.
 * Throws a descriptive Error on non-2xx responses.
 */
export const fortnoxFetch = async (
	regionSlug: string,
	path: string,
	{ method = 'GET', body }: FortnoxRequestOptions = {},
): Promise<any> => {
	const accessToken = await getAccessToken(regionSlug);
	const url = `${FORTNOX_API_BASE}${path}`;
	const res = await fetch(url, {
		method,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	if (!res.ok) {
		// Read the body exactly once — undici throws "Body has already been read"
		// if .json()/.text() is called twice, which was masking real errors.
		const raw = await res.text();
		let detail = raw;
		try {
			const parsed = JSON.parse(raw);
			detail = parsed?.ErrorInformation?.Message ?? JSON.stringify(parsed);
		} catch {
			// not JSON — keep the raw body as detail
		}
		throw new Error(`Fortnox ${method} ${path} failed (${res.status}): ${detail}`);
	}

	if (res.status === 204) return undefined;

	const contentType = res.headers.get('content-type') ?? '';
	return contentType.includes('application/json') ? res.json() : res.text();
};

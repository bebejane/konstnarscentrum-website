import { NextApiRequest, NextApiResponse } from 'next'
import regions from '../../../regions.json'
import { hasFortnoxCredentials } from '/lib/fortnox/auth'
import { syncMemberToFortKnox, webhookEntityToMember, webhookModelApiKey } from '/lib/fortnox/sync'
import { parseDatoError } from '/lib/utils'

export const config = {
	maxDuration: 60,
}

const isAuthorized = (req: NextApiRequest) => {
	const auth = req.headers.authorization
	if (!auth) return false
	const [user, pwd] = Buffer.from(auth.split(' ')[1] ?? '', 'base64').toString().split(':')
	return user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD
}

/**
 * DatoCMS webhook → Fortnox customer sync.
 *
 * POST /api/fortnox/customer-sync
 * Auth: Basic Auth (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)
 *
 * Configure a DatoCMS webhook subscription (entity_type "item", events
 * item::create / item::update) pointing at this URL. When a `member` item is
 * created or edited its contact data is mirrored to that member's regional
 * Fortnox customer:
 * - member already has a `fortnox_customer_number`          → update that customer
 * - a Fortnox customer with the same email already exists   → link it + update
 * - otherwise (new member)                                  → create the customer and
 *   store the returned number on the member in DatoCMS (that single follow-up
 *   webhook ends as an update — no further loop).
 *
 * Anything that is not a member item returns 200 "skipped" so DatoCMS does not
 * retry; transient Fortnox/API errors return 500 so DatoCMS will retry them.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' })

	const body = req.body ?? {}
	if (body.ping) return res.status(200).json({ pong: true })

	const { entity, entity_type: entityType, event_type: eventType } = body

	if (entityType !== 'item' || !entity?.id || eventType === 'item::destroy') {
		return res.status(200).json({ skipped: true, reason: 'not a member item event' })
	}

	if (webhookModelApiKey(body) !== 'member')
		return res.status(200).json({ skipped: true, reason: 'not a member item' })

	const member = webhookEntityToMember(entity)

	const region = regions.find((r) => r.id === member.region)
	if (!region) return res.status(200).json({ skipped: true, reason: 'member has no region' })
	if (!hasFortnoxCredentials(region.slug))
		return res.status(200).json({ skipped: true, reason: `fortnox not configured for ${region.slug}` })
	if (!member.email) return res.status(200).json({ skipped: true, reason: 'member has no email' })
	if (!member.first_name && !member.last_name)
		return res.status(200).json({ skipped: true, reason: 'member has no name' })

	try {
		const { customerNumber, created } = await syncMemberToFortKnox(member)
		return res
			.status(200)
			.json({ synced: true, memberId: member.id, customerNumber, created, event_type: eventType })
	} catch (err) {
		console.error(`[fortnox] customer sync failed for member ${member.id}`, err)
		return res.status(500).json({ error: parseDatoError(err) })
	}
}
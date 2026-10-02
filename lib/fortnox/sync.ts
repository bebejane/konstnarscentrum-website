import client from '/lib/client';
import regions from '../../regions.json';
import { createCustomer, getCustomer, listCustomers, updateCustomer } from './customers';
import { hasFortnoxCredentials } from './auth';
import type { FortnoxCustomer } from './customers';

export type MemberItem = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	city?: string;
	region?: string;
	active?: boolean;
	vilande?: boolean;
	fortnox_customer_number?: string;
	[key: string]: any;
};

/**
 * Strip characters Fortnox rejects in free-text fields (e.g. emoji / Unicode
 * symbols). Keeps letters, digits, whitespace and punctuation, collapses
 * repeated whitespace, and trims. Returns undefined when nothing remains.
 */
export const sanitizeText = (value: string | undefined): string | undefined => {
	if (!value) return undefined;
	const cleaned = value
		.replace(/[\p{S}]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
	return cleaned || undefined;
};

/**
 * undefined/null → omitted from the request (Fortnox keeps its current value).
 * "" / whitespace  → sent as "" so Fortnox clears the field.
 */
const optionalClearingString = (value: string | undefined | null): string | undefined => {
	if (value === undefined || value === null) return undefined;
	return sanitizeText(value) ?? '';
};

/**
 * Map a DatoCMS member to the data we send to Fortnox as a customer.
 * Email is the join key between the systems.
 */
export const memberToCustomer = (member: MemberItem): Partial<FortnoxCustomer> => {
	const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ') || undefined;
	return {
		Name: sanitizeText(fullName),
		Email: member.email,
		City: optionalClearingString(member.city),
		// Store the DatoCMS member id for reverse lookup
		ExternalReference: member.id,
	};
};

/**
 * Best-effort lookup: find the first Fortnox customer in a region whose email
 * matches. Fortnox's /customers list does not support an email filter, so we
 * fetch and match client-side. Returns null when no match is found.
 */
const findCustomerByEmail = async (
	regionSlug: string,
	email: string,
): Promise<FortnoxCustomer | null> => {
	const needle = (email ?? '').toLowerCase();
	if (!needle) return null;
	const all = await listCustomers(regionSlug);
	return all.find((c) => (c.Email ?? '').toLowerCase() === needle) ?? null;
};

/**
 * Only write the customer number back to DatoCMS when it actually changes.
 * DatoCMS fires an item::update webhook on *every* update call, so writing an
 * unchanged value would trigger a redundant sync round-trip (and, if the payload
 * kept missing the field, an endless loop via the email-match path).
 */
const writeBackCustomerNumber = async (
	member: MemberItem,
	customerNumber: string,
): Promise<void> => {
	if (member.fortnox_customer_number === customerNumber) return;
	await client.items.update(member.id, { fortnox_customer_number: customerNumber });
	member.fortnox_customer_number = customerNumber;
};

/**
 * When the webhook payload does not carry `fortnox_customer_number`, read it
 * from DatoCMS so an already-linked member takes the "update existing
 * customer" path instead of the write-back paths (email-match / create). This
 * is the guard that makes the webhook chain terminate even if DatoCMS ever
 * sends partial attributes.
 */
const resolveStoredCustomerNumber = async (member: MemberItem): Promise<void> => {
	if (member.fortnox_customer_number) return;
	try {
		const record = (await client.items.find(member.id)) as unknown as MemberItem;
		if (record?.fortnox_customer_number)
			member.fortnox_customer_number = record.fortnox_customer_number;
	} catch (err: any) {
		console.warn(
			`[fortnox] could not read member ${member.id} for customer number: ${err?.message ?? err}`,
		);
	}
};

/**
 * Sync a single member to its region's Fortnox account.
 * - If member already has a customer number, update that Fortnox customer.
 * - Else try to link an existing Fortnox customer by email.
 * - Else create a new Fortnox customer.
 *
 * Webhook-safe: the DatoCMS write-back in the link/create paths happens only
 * when the number actually changes, and a stored number is authoritative even
 * when the payload omits it — so the feedback webhook terminates instead of
 * looping.
 *
 * Returns the Fortnox customer number and whether a new customer was created.
 */
export const syncMemberToFortKnox = async (
	member: MemberItem,
): Promise<{ customerNumber: string; created: boolean }> => {
	const region = regions.find((r) => r.id === member.region);

	if (!region) throw new Error(`Member ${member.id} has no matching region`);
	if (!member.email) throw new Error(`Member ${member.id} has no email`);
	if (!member.first_name && !member.last_name) throw new Error(`Member ${member.id} has no name`);
	if (!hasFortnoxCredentials(region.slug))
		throw new Error(`Fortnox is disabled or not configured for region ${region.slug}`);

	// The payload may omit the linked number — trust the stored DatoCMS value.
	await resolveStoredCustomerNumber(member);

	const data = memberToCustomer(member);

	// 1) Already linked to a customer?
	if (member.fortnox_customer_number) {
		const existing = await getCustomer(region.slug, member.fortnox_customer_number);
		if (existing) {
			await updateCustomer(region.slug, member.fortnox_customer_number, data);
			return { customerNumber: member.fortnox_customer_number, created: false };
		}
		// Number set but missing in Fortnox -> fall through and (re)link/create
	}

	// 2) Match an existing Fortnox customer by email (handles pre-existing customers)
	const match = await findCustomerByEmail(region.slug, member.email);
	if (match) {
		await writeBackCustomerNumber(member, match.CustomerNumber);
		await updateCustomer(region.slug, match.CustomerNumber, data);
		return { customerNumber: match.CustomerNumber, created: false };
	}

	// 3) Create a new customer — re-check first so concurrent webhooks for a
	//    brand-new member link instead of creating duplicate Fortnox customers.
	const recheck = await findCustomerByEmail(region.slug, member.email);
	if (recheck) {
		await writeBackCustomerNumber(member, recheck.CustomerNumber);
		await updateCustomer(region.slug, recheck.CustomerNumber, data);
		return { customerNumber: recheck.CustomerNumber, created: false };
	}

	const created = await createCustomer(region.slug, data);
	await writeBackCustomerNumber(member, created.CustomerNumber);
	return { customerNumber: created.CustomerNumber, created: true };
};

/**
 * Fetch all members from DatoCMS (paginated via CMA).
 */
export const getAllMembers = async (regionId?: string): Promise<MemberItem[]> => {
	const members: MemberItem[] = [];

	for await (const record of client.items.listPagedIterator({
		filter: {
			type: 'member',
			fields: regionId
				? {
						region: {
							eq: regionId,
						},
					}
				: {},
		},
	})) {
		members.push(record as MemberItem);
	}
	return members;
};

export type DatoWebhookEntity = {
	id: string;
	type?: string;
	attributes?: Record<string, any>;
	relationships?: Record<string, { data?: { id?: string; type?: string } }>;
};

export type DatoWebhookPayload = {
	event_type?: string;
	entity_type?: string;
	entity?: DatoWebhookEntity;
	related_entities?: Array<{ id?: string; attributes?: { api_key?: string } }>;
};

/**
 * The model `api_key` (e.g. 'member') of the entity in a DatoCMS webhook
 * payload. Mirrors the lookup `withRevalidate` does: find the item_type in
 * `related_entities` whose id matches `entity.relationships.item_type`.
 */
export const webhookModelApiKey = (payload: DatoWebhookPayload): string | undefined => {
	const itemTypeId = payload?.entity?.relationships?.item_type?.data?.id;
	if (!itemTypeId) return undefined;
	return payload?.related_entities?.find(({ id }) => id === itemTypeId)?.attributes?.api_key;
};

/**
 * Build a `MemberItem` from a DatoCMS webhook `entity` so the payload can be
 * fed straight into `syncMemberToFortKnox`. Field values live in
 * `entity.attributes`; single-link fields (region) are the record id there,
 * with `entity.relationships` as a fallback.
 */
export const webhookEntityToMember = (entity: DatoWebhookEntity): MemberItem => {
	const attrs = entity.attributes ?? {};
	const region =
		(typeof attrs.region === 'string' && attrs.region) ||
		attrs.region?.id ||
		entity.relationships?.region?.data?.id;
	return {
		id: entity.id,
		email: attrs.email,
		first_name: attrs.first_name,
		last_name: attrs.last_name,
		city: attrs.city,
		active: attrs.active,
		vilande: attrs.vilande,
		fortnox_customer_number: attrs.fortnox_customer_number,
		region,
	};
};

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
 * Result of syncing a member to Fortnox. `skipped` means a write was refused
 * for safety (ambiguous or foreign customer) rather than performed.
 */
export type SyncResult = {
	customerNumber?: string;
	created: boolean;
	skipped?: boolean;
	reason?: string;
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

/** Fortnox's documented sentinel for "delete/clear this field". */
const FORTNOX_BLANK = 'API_BLANK';

/**
 * undefined/null → omitted from the request (Fortnox keeps its current value).
 * "" / whitespace  → sent as "API_BLANK" so Fortnox clears the field — a plain
 * empty string is ignored on update (see Fortnox "Delete Values" docs).
 */
const optionalClearingString = (value: string | undefined | null): string | undefined => {
	if (value === undefined || value === null) return undefined;
	const cleaned = sanitizeText(value);
	return cleaned === undefined ? FORTNOX_BLANK : cleaned;
};

/**
 * Map a DatoCMS member to the data we send to Fortnox as a customer.
 * Email is the join key between the systems.
 */
export const memberToCustomer = (member: MemberItem): Partial<FortnoxCustomer> => {
	const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ') || undefined;
	const data = {
		Name: sanitizeText(fullName),
		Email: member.email,
		City: optionalClearingString(member.city),
		// Store the DatoCMS member id for reverse lookup
		ExternalReference: member.id,
	};
	return data;
};

const normalizeEmail = (email?: string): string => (email ?? '').trim().toLowerCase();

/**
 * Pick the single Fortnox customer whose email matches `email`, or report why
 * no safe choice can be made. Fortnox's /customers list has no email filter, so
 * matching happens client-side. More than one match is ambiguous — we refuse
 * rather than overwrite an arbitrary customer.
 */
export const selectUniqueCustomerByEmail = (
	customers: FortnoxCustomer[],
	email: string,
): { customer?: FortnoxCustomer; error?: string } => {
	const needle = normalizeEmail(email);
	if (!needle) return {};
	const matches = customers.filter((c) => normalizeEmail(c.Email) === needle);
	if (matches.length > 1)
		return {
			error: `${matches.length} Fortnox customers share the email ${email} (#${matches
				.map((c) => c.CustomerNumber)
				.join(', #')})`,
		};
	return { customer: matches[0] };
};

const findUniqueCustomerByEmail = async (
	regionSlug: string,
	email: string,
): Promise<{ customer?: FortnoxCustomer; error?: string }> =>
	selectUniqueCustomerByEmail(await listCustomers(regionSlug), email);

type Ownership = { ok: boolean; reason?: string };

/**
 * Decide whether a Fortnox customer may safely be overwritten from a member.
 * We only ever write to a customer we can prove belongs to the member:
 * - `ExternalReference` is the DatoCMS member id we store on create; if it is
 *   set and points at another member, the customer belongs to someone else.
 * - Without that reference, a matching email is the only evidence available, so
 *   the customer's email must equal the member's (a stale customer number
 *   pointing at a different customer is refused).
 * Anything else is refused so we never overwrite the wrong customer.
 */
export const checkCustomerOwnership = (
	customer: FortnoxCustomer,
	member: MemberItem,
): Ownership => {
	const ref = (customer.ExternalReference ?? '').trim();
	if (ref && ref !== member.id)
		return {
			ok: false,
			reason: `customer #${customer.CustomerNumber} is linked to another member (${ref})`,
		};

	if (ref !== member.id && normalizeEmail(customer.Email) !== normalizeEmail(member.email))
		return {
			ok: false,
			reason: `customer #${customer.CustomerNumber} has email ${
				customer.Email ?? '(none)'
			} which does not match member ${member.id} (${member.email})`,
		};

	return { ok: true };
};

/**
 * Drop `API_BLANK` clears for fields Fortnox already has empty — an API_BLANK
 * write is only meaningful when there is a value to clear. Keeps unrelated
 * member edits from pointlessly rewriting (and re-triggering webhooks on) the
 * Fortnox customer.
 */
export const dropRedundantClears = (
	data: Partial<FortnoxCustomer>,
	existing: FortnoxCustomer,
): Partial<FortnoxCustomer> => {
	const out: Partial<FortnoxCustomer> = { ...data };
	for (const key of Object.keys(out)) {
		if ((out as any)[key] === FORTNOX_BLANK && !sanitizeText(String((existing as any)[key] ?? '')))
			delete (out as any)[key];
	}
	return out;
};

/** True when applying `data` would actually change one of the sent fields. */
export const dataWouldChange = (
	data: Partial<FortnoxCustomer>,
	existing: FortnoxCustomer,
): boolean =>
	Object.entries(data).some(([key, value]) => {
		if (value === undefined || value === null) return false;
		if (value === FORTNOX_BLANK) return !!sanitizeText(String((existing as any)[key] ?? ''));
		return String((existing as any)[key] ?? '').trim() !== String(value).trim();
	});

const skipSync = (member: MemberItem, reason: string): SyncResult => {
	console.warn(`[fortnox] skipping customer sync for member ${member.id}: ${reason}`);
	return { created: false, skipped: true, reason };
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
 * Overwrite-safe: a customer is only written when we can prove it belongs to
 * the member (`checkCustomerOwnership`), the email match is unambiguous
 * (`selectUniqueCustomerByEmail`), and the write would actually change a field
 * (`dataWouldChange`). Anything that can't be proven safe is skipped rather
 * than overwritten.
 *
 * Webhook-safe: the DatoCMS write-back in the link/create paths happens only
 * when the number actually changes, and a stored number is authoritative even
 * when the payload omits it — so the feedback webhook terminates instead of
 * looping.
 *
 * Returns the Fortnox customer number and whether a new customer was created,
 * or `{ skipped: true, reason }` when a write was refused.
 */
export const syncMemberToFortKnox = async (member: MemberItem): Promise<SyncResult> => {
	const region = regions.find((r) => r.id === member.region);

	if (!region) throw new Error(`Member ${member.id} has no matching region`);
	if (!member.email) throw new Error(`Member ${member.id} has no email`);
	if (!member.first_name && !member.last_name) throw new Error(`Member ${member.id} has no name`);
	if (!hasFortnoxCredentials(region.slug))
		throw new Error(`Fortnox is disabled or not configured for region ${region.slug}`);

	// The payload may omit the linked number — trust the stored DatoCMS value.
	await resolveStoredCustomerNumber(member);

	// 1) Already linked to a customer? Only update a customer we can prove is
	//    the member's — a mismatched reference or email means it is not.
	if (member.fortnox_customer_number) {
		const existing = await getCustomer(region.slug, member.fortnox_customer_number);
		if (existing) {
			const ownership = checkCustomerOwnership(existing, member);
			if (!ownership.ok) return skipSync(member, ownership.reason ?? 'refused');

			const data = dropRedundantClears(memberToCustomer(member), existing);
			if (dataWouldChange(data, existing))
				await updateCustomer(region.slug, member.fortnox_customer_number, data);

			await writeBackCustomerNumber(member, existing.CustomerNumber);
			return { customerNumber: existing.CustomerNumber, created: false };
		}
		// Number set but missing in Fortnox -> fall through and (re)link/create
	}

	// 2) Match an existing Fortnox customer by email (handles pre-existing
	//    customers). Ambiguous or foreign matches are skipped, not overwritten.
	const match = await findUniqueCustomerByEmail(region.slug, member.email);
	if (match.error) return skipSync(member, match.error);
	if (match.customer) {
		const ownership = checkCustomerOwnership(match.customer, member);
		if (!ownership.ok) return skipSync(member, ownership.reason ?? 'refused');

		const data = dropRedundantClears(memberToCustomer(member), match.customer);
		await writeBackCustomerNumber(member, match.customer.CustomerNumber);
		if (dataWouldChange(data, match.customer))
			await updateCustomer(region.slug, match.customer.CustomerNumber, data);
		return { customerNumber: match.customer.CustomerNumber, created: false };
	}

	// 3) Create a new customer.
	const created = await createCustomer(region.slug, memberToCustomer(member));
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

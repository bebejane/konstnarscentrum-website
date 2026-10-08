import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { buildClient } from '@datocms/cma-client';
import regions from '../../regions.json';
import { createCustomer, listCustomers } from '../fortnox/customers';
import { getAccessToken, hasFortnoxCredentials } from '../fortnox/auth';
import { memberToCustomer } from '../fortnox/sync';

const environment = process.env.DATOCMS_ENVIRONMENT!;
const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string, environment });

type MemberItem = {
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
	console.log('Loading all members from DatoCMS...');

	const members: MemberItem[] = [];
	for await (const record of client.items.listPagedIterator({ filter: { type: 'member' } })) {
		members.push(record as MemberItem);
	}
	console.log(`Loaded ${members.length} members`);

	// Group members by region so we can batch per region's Fortnox account
	for (const region of regions) {
		if (!hasFortnoxCredentials(region.slug)) {
			console.warn(`[${region.name}] No Fortnox credentials configured, skipping`);
			continue;
		}

		const regionMembers = members.filter((m) => m.region === region.id);
		console.log(`\n[${region.name}] Found ${regionMembers.length} members`);

		console.log(`[${region.name}] Fetching existing Fortnox customers...`);
		const customers = await listCustomers(region.slug);
		// Group by email; a duplicate email makes the match ambiguous and is
		// refused below rather than linking a member to an arbitrary customer.
		const customersByEmail = new Map<string, typeof customers>();
		for (const c of customers) {
			const key = (c.Email ?? '').trim().toLowerCase();
			if (!key) continue;
			customersByEmail.set(key, [...(customersByEmail.get(key) ?? []), c]);
		}
		const notMembers = customers.filter((c) => !regionMembers.find((m) => m.email === c.Email));

		console.log(`[${region.name}] Loaded ${customers.length} existing customers`);

		let created = 0;
		let linked = 0;
		let updated = 0;
		let skipped = 0;
		let errored = 0;
		const errors: string[] = [];

		for (const member of regionMembers) {
			process.stdout.write('.');
			try {
				if (!member.email) {
					skipped++;
					errors.push(`[${member.id}] No email, skipped`);
					continue;
				}

				if (!member.first_name && !member.last_name) {
					skipped++;
					errors.push(`[${member.id}] No name, skipped`);
					continue;
				}

				// 1) Already linked by number?
				if (member.fortnox_customer_number) {
					await client.items.update(member.id, {
						fortnox_customer_number: member.fortnox_customer_number,
					});
					skipped++;
					continue;
				}

				// 2) Link by email — only a single, unambiguous match that isn't
				//    already linked to another member.
				const matches = customersByEmail.get(member.email.trim().toLowerCase()) ?? [];
				if (matches.length > 1) {
					errored++;
					errors.push(
						`[${member.id}] ${matches.length} Fortnox customers share ${member.email} (#${matches
							.map((c) => c.CustomerNumber)
							.join(', #')}), skipped`,
					);
					continue;
				}
				const match = matches[0];
				if (match) {
					if (match.ExternalReference && match.ExternalReference !== member.id) {
						errored++;
						errors.push(
							`[${member.id}] customer #${match.CustomerNumber} belongs to ${match.ExternalReference}, skipped`,
						);
						continue;
					}
					await client.items.update(member.id, { fortnox_customer_number: match.CustomerNumber });
					linked++;
					continue;
				}

				// 3) Create new customer
				const data = memberToCustomer(member);
				const createdCustomer = await createCustomer(region.slug, data);
				await client.items.update(member.id, {
					fortnox_customer_number: createdCustomer.CustomerNumber,
				});
				created++;
				await sleep(200); // be gentle with rate limits
			} catch (err: any) {
				errored++;
				errors.push(`[${member.id}] ${err?.message ?? err}`);
			}
		}

		console.log(
			`\n[${region.name}] Done: ${created} created, ${linked} linked by email, ${updated} already linked, ${errors.length} errors`,
		);

		notMembers.length &&
			console.log(
				'Non members\n' +
					notMembers.map((c) => `${c.CustomerNumber}#${c.Name.trim()}#${c.Email}`).join('\r\n'),
			);

		if (errors.length) {
			console.log(`[${region.name}] Errors:`);
			errors.forEach((e) => console.log('  -', e));
		}
	}

	console.log('\nSync complete.');
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

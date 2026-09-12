import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import readline from 'readline';
import client from '../client';

const BATCH_SIZE = 100;
const CONCURRENCY = 4;

type InvoiceItem = {
	id: string;
};

const ask = (question: string): Promise<string> => {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) =>
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		}),
	);
};

const chunk = <T>(items: T[], size: number): T[][] => {
	const out: T[][] = [];
	for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
	return out;
};

type DestroyResult = { ok: number; failed: string[] };

/**
 * Delete a batch with one bulk_destroy call. If that fails, fall back to
 * per-item destroys so no record is silently skipped.
 */
const destroyBatch = async (batch: InvoiceItem[]): Promise<DestroyResult> => {
	try {
		await client.items.bulkDestroy({
			items: batch.map((item) => ({ id: item.id, type: 'item' })),
		});
		return { ok: batch.length, failed: [] };
	} catch (err: any) {
		const failed: string[] = [];
		let ok = 0;
		for (const item of batch) {
			try {
				await client.items.destroy(item.id);
				ok++;
			} catch (e: any) {
				failed.push(`[${item.id}] ${e?.message ?? e}`);
			}
		}
		return { ok, failed };
	}
};

const main = async () => {
	console.log(`DatoCMS environment: ${process.env.DATOCMS_ENVIRONMENT ?? 'main'}`);

	const types = await client.itemTypes.list();
	const invoiceType = types.find((t: any) => t.api_key === 'invoice');
	if (!invoiceType) {
		console.error('Invoice model (api_key "invoice") not found in DatoCMS');
		process.exit(1);
	}

	const invoices: InvoiceItem[] = [];
	for await (const record of client.items.listPagedIterator({ filter: { type: 'invoice' } })) {
		invoices.push(record as InvoiceItem);
	}

	console.log(`Found ${invoices.length} items in model "invoice"`);
	if (invoices.length === 0) {
		console.log('Nothing to delete.');
		return;
	}

	const answer = await ask(
		`About to PERMANENTLY delete ${invoices.length} invoice items. Type "yes" to continue: `,
	);
	if (answer.trim().toLowerCase() !== 'yes') {
		console.log('Aborted.');
		return;
	}

	const batches = chunk(invoices, BATCH_SIZE);
	let deleted = 0;
	const errors: string[] = [];

	let next = 0;
	const workers = Array.from(
		{ length: Math.min(CONCURRENCY, batches.length) },
		async () => {
			while (next < batches.length) {
				const index = next++;
				const result = await destroyBatch(batches[index]);
				deleted += result.ok;
				errors.push(...result.failed);
				process.stdout.write(`\n${deleted}/${invoices.length} deleted`);
			}
		},
	);
	await Promise.all(workers);

	console.log(`\nDeleted ${deleted}/${invoices.length} invoice items`);
	if (errors.length) {
		console.log('Errors:');
		errors.forEach((e) => console.log('  -', e));
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err?.message ?? err);
		process.exit(1);
	});
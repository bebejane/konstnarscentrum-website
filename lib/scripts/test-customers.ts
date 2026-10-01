import 'dotenv/config';
import { listCustomers, updateCustomer } from '../../lib/fortnox/customers';
import { getCompany } from '../../lib/fortnox/company';
import diffs from '../../email-diffs.json';
import activity from '../../customer-activity-2026-09-22.json';

async function main(): Promise<void> {
	const customers = await listCustomers('ost');
	console.log(JSON.stringify(customers, null, 2));
}
async function sync(): Promise<void> {
	const company = await getCompany('ost');
	console.log(company);
	const updates = [];
	for (const c of diffs.differentEmails) {
		updates.push({
			id: c.CustomerNumber,
			data: {
				Email: c.OldEmail,
				Name: c.OldName,
				City: c.OldCity,
			},
		});
	}

	const notInUpdates = activity.filter(
		(a) => !updates.find((u) => String(u.id) === String(a.customerId)),
	);

	notInUpdates.forEach((a) => {
		const data = {};
		a.changes && a.changes.email?.from && (data.Email = a.changes.email.from);
		a.changes && a.changes.name?.from && (data.Name = a.changes.name.from);
		a.changes &&
			a.changes.invoiceAddress?.townCity?.from &&
			(data.City = a.changes.invoiceAddress.townCity.from);
		if (Object.keys(data).length > 0 && a.customerId) {
			updates.push({
				id: String(a.customerId),
				data,
			});
		}
	});

	//console.log(notInUpdates.length);

	//console.log(JSON.stringify(updates, null, 2));
	//console.log('updating ' + updates.length);
	for (const u of updates) {
		try {
			await updateCustomer('ost', u.id, u.data);
			console.log('updated', u.id, u.data.Email);
		} catch (err) {
			console.log('failed', u.id, u.data.Email);
			console.log(err);
		}
	}
}

if (process.env.SKIP !== '1') {
	main().catch((err) => {
		console.error(err);
		err.errors && console.log(JSON.stringify(err.errors, null, 2));
		process.exitCode = 1;
	});
}

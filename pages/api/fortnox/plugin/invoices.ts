import { NextApiRequest, NextApiResponse } from 'next';
import client from '/lib/client';
import regions from '/regions.json';
import { getAllMembers, MemberItem } from '/lib/fortnox/sync';
import {
  createAnnualInvoiceForMember,
  getYearlyInvoicesByMember,
  isEligibleForInvoice,
} from '/lib/fortnox/invoiceDispatch';
import { parseDatoError } from '/lib/utils';

export const config = {
	maxDuration: 300,
};

type MemberStatus = 'created' | 'skipped' | 'failed';

type MemberResult = {
	status: MemberStatus;
	reason?: string;
	documentNumber?: string;
	invoiceRecordId?: string;
};

type Task = {
	id: string;
	member: MemberItem | null;
};

const isAuthorized = (req: NextApiRequest) => {
	const auth = req.headers.authorization;
	if (!auth) return false;
	const [user, pwd] = Buffer.from(auth.split(' ')[1] ?? '', 'base64')
		.toString()
		.split(':');
	return user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD;
};

const findRegionByRole = (roleName: string) =>
	regions.find((r) => r.slug.toLowerCase() === roleName.toLowerCase()) ??
	regions.find((r) => r.slug.toLowerCase() === 'ost');

const filterMembersByRegion = (members: MemberItem[], regionId: string) =>
	members.filter((m) => m.region === regionId);

const memberName = (member: MemberItem) =>
	[member.first_name, member.last_name].filter(Boolean).join(' ') || member.email || member.id;

/**
 * Resolve a single member id and make sure it belongs to the given region.
 * Returns null when the record is missing or lives in another region.
 */
const resolveMember = async (id: string, regionId: string): Promise<MemberItem | null> => {
	try {
		const member = (await client.items.find(id)) as unknown as MemberItem;
		if (member?.region === regionId) return member;
	} catch {
		// missing / inaccessible record
	}
	return null;
};

/**
 * Create (and email) the annual invoice for a single member.
 * Never throws: failures are surfaced as a `failed` result.
 */
const processMember = async (member: MemberItem, invoiceYear: number): Promise<MemberResult> => {
	try {
		const { eligible, reason } = await isEligibleForInvoice(member, invoiceYear);
		if (!eligible) return { status: 'skipped', reason };

		const { documentNumber, invoiceRecordId } = await createAnnualInvoiceForMember(member, invoiceYear);
		return { status: 'created', documentNumber, invoiceRecordId };
	} catch (err: any) {
		return { status: 'failed', reason: err?.message ?? String(err) };
	}
};

const emptySummary = () => ({
	created: 0,
	skipped: 0,
	failed: 0,
	errors: [] as string[],
	invoices: [] as string[],
});

const accumulate = (summary: ReturnType<typeof emptySummary>, task: Task, result: MemberResult) => {
	if (result.status === 'created') {
		summary.created++;
		if (result.documentNumber) summary.invoices.push(result.documentNumber);
	} else if (result.status === 'skipped') {
		summary.skipped++;
	} else {
		summary.failed++;
		summary.errors.push(`[${task.id}] ${result.reason ?? 'unknown error'}`);
	}
};

/**
 * GET /api/fortnox/plugin/invoices?role=<roleName>
 * List members for the region matching the given DatoCMS role name.
 *
 * POST /api/fortnox/plugin/invoices
 * Body: { invoiceYear?: number, role: string, memberIds?: string[], stream?: boolean }
 * Create invoices for all eligible members matching the role. When `memberIds`
 * is given, only those members are processed (verified against the region).
 * When `stream` is true the response is NDJSON with one progress event per
 * member, ending with a `done` event carrying the summary.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!isAuthorized(req)) return res.status(401).json({ error: 'Access denied' });

	if (req.method === 'GET') {
		const roleName = (req.query.role as string) || '';
		if (!roleName) return res.status(400).json({ error: 'Missing role query parameter' });

		const region = findRegionByRole(roleName);
		if (!region) return res.status(404).json({ error: `No region found for role "${roleName}"` });

		try {
			const allMembers = await getAllMembers(region.id);
			const members = filterMembersByRegion(allMembers, region.id);
			const invoiceYear = new Date().getFullYear();
			const yearlyInvoices = await getYearlyInvoicesByMember(invoiceYear, region.slug);
			const membersWithInvoices = members.map((m) => ({
				...m,
				invoice: yearlyInvoices[m.id] ?? null,
			}));
			return res
				.status(200)
				.json({ members: membersWithInvoices, region: region.slug, invoiceYear });
		} catch (err) {
			return res.status(500).json({ error: parseDatoError(err) });
		}
	}

	if (req.method === 'POST') {
		if (req.body?.ping) return res.status(200).json({ pong: true });

		const roleName = req.body?.role as string;
		if (!roleName) return res.status(400).json({ error: 'Missing role in request body' });

		const region = findRegionByRole(roleName);
		if (!region) return res.status(404).json({ error: `No region found for role "${roleName}"` });

		const invoiceYear = Number(req.body?.invoiceYear ?? new Date().getFullYear());
		const memberIds: string[] | null = Array.isArray(req.body?.memberIds)
			? (req.body.memberIds as string[])
			: null;
		const stream = req.body?.stream === true;

		try {
			const tasks: Task[] = memberIds
				? await Promise.all(
						memberIds.map(async (id) => ({ id, member: await resolveMember(id, region.id) })),
					)
				: filterMembersByRegion(await getAllMembers(region.id), region.id).map((member) => ({
						id: member.id,
						member,
					}));

			if (stream) {
				res.setHeader('Content-Type', 'application/x-ndjson');
				res.setHeader('Cache-Control', 'no-cache, no-transform');
				res.setHeader('X-Accel-Buffering', 'no');
				res.flushHeaders?.();

				let closed = false;
				res.on('close', () => {
					closed = true;
				});

				const summary = emptySummary();
				const write = (payload: unknown) => {
					if (closed || res.writableEnded) return false;
					res.write(`${JSON.stringify(payload)}\n`);
					return true;
				};

				write({ type: 'start', total: tasks.length, invoiceYear, region: region.slug });

				for (let i = 0; i < tasks.length; i++) {
					if (closed || res.writableEnded) break;

					const task = tasks[i];
					const result: MemberResult = task.member
						? await processMember(task.member, invoiceYear)
						: { status: 'failed', reason: 'Member not found in region' };
					accumulate(summary, task, result);

					const ok = write({
						type: 'member',
						index: i,
						id: task.id,
						name: task.member ? memberName(task.member) : '',
						status: result.status,
						...(result.reason ? { reason: result.reason } : {}),
						...(result.documentNumber ? { documentNumber: result.documentNumber } : {}),
						...(result.invoiceRecordId ? { invoiceRecordId: result.invoiceRecordId } : {}),
					});
					if (!ok) break;
				}

				if (!res.writableEnded) {
					write({ type: 'done', summary, invoiceYear, region: region.slug });
					res.end();
				}
				return;
			}

			const results = emptySummary();
			for (const task of tasks) {
				const result: MemberResult = task.member
					? await processMember(task.member, invoiceYear)
					: { status: 'failed', reason: 'Member not found in region' };
				accumulate(results, task, result);
			}

			return res.status(200).json({ ...results, invoiceYear, region: region.slug });
		} catch (err) {
			if (res.headersSent) {
				try {
					res.write(`${JSON.stringify({ type: 'error', message: parseDatoError(err) })}\n`);
					res.end();
				} catch {
					// connection already gone
				}
				return;
			}
			return res.status(500).json({ error: parseDatoError(err) });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
}

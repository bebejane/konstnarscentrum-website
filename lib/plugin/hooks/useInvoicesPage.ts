import { useEffect, useRef, useState } from 'react';
import type { RenderPageCtx } from 'datocms-plugin-sdk';
import { regionFromRoleName } from '/lib/plugin/utils';
import type { InvoiceRecord } from '/lib/fortnox/invoiceDispatch';

export type Member = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	city: string;
	postal_code: string;
	active?: boolean;
	region?: string;
	fortnox_customer_number?: string;
	invoice?: InvoiceRecord | null;
};

export type MemberStatus = 'created' | 'skipped' | 'failed';

export type MemberRunState = {
	status: MemberStatus;
	reason?: string;
	documentNumber?: string;
	invoiceRecordId?: string;
};

export type InvoiceResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: string[];
	invoices: string[];
	invoiceYear: number;
};

export type RunProgress = {
	processed: number;
	total: number;
	currentName: string;
	created: number;
	skipped: number;
	failed: number;
	done: boolean;
};

type StreamEvent =
	| { type: 'start'; total: number; invoiceYear: number; region: string }
	| {
			type: 'member';
			index: number;
			id: string;
			name: string;
			status: MemberStatus;
			reason?: string;
			documentNumber?: string;
			invoiceRecordId?: string;
	  }
	| {
			type: 'done';
			summary: Omit<InvoiceResult, 'invoiceYear'>;
			invoiceYear: number;
			region: string;
	  }
	| { type: 'error'; message: string };

const BATCH_SIZE = 20;

export const sortSwedish = (arr: any[], key: string): any[] => {
	const sorter = new Intl.Collator('sv', { usage: 'sort' });
	return arr.sort((a: any, b: any) => sorter.compare(a[key], b[key]));
};

const basicAuthHeaders = (ctx: RenderPageCtx): Record<string, string> => {
	const { basicAuthUsername, basicAuthPassword } = ctx.plugin.attributes.parameters;
	return {
		'Authorization': 'Basic ' + btoa(`${basicAuthUsername}:${basicAuthPassword}`),
		'Content-Type': 'application/json',
	};
};

/**
 * POST a batch of member ids and consume the NDJSON progress stream, invoking
 * the given handlers for each event type.
 */
const streamBatch = async (
	memberIds: string[],
	ctx: RenderPageCtx,
	role: string,
	invoiceYear: number,
	signal: AbortSignal,
	handlers: {
		onMember: (event: Extract<StreamEvent, { type: 'member' }>) => void;
		onDone: (event: Extract<StreamEvent, { type: 'done' }>) => void;
	},
) => {
	const res = await fetch('/api/fortnox/plugin/invoices', {
		method: 'POST',
		headers: basicAuthHeaders(ctx),
		signal,
		body: JSON.stringify({ invoiceYear, role, memberIds, stream: true }),
	});

	if (!res.ok || !res.body) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `HTTP ${res.status}`);
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });

		let newline: number;
		while ((newline = buffer.indexOf('\n')) >= 0) {
			const line = buffer.slice(0, newline).trim();
			buffer = buffer.slice(newline + 1);
			if (!line) continue;

			let event: StreamEvent;
			try {
				event = JSON.parse(line) as StreamEvent;
			} catch {
				continue;
			}

			if (event.type === 'member') handlers.onMember(event);
			else if (event.type === 'done') handlers.onDone(event);
			else if (event.type === 'error') throw new Error(event.message);
		}
	}
};

export type UseInvoicesPage = {
	members: Member[];
	pendingMembers: Member[];
	loading: boolean;
	running: boolean;
	aborted: boolean;
	error?: string | null;
	results: InvoiceResult | null;
	progress: RunProgress | null;
	statusById: Record<string, MemberRunState>;
	percent: number;
	invoiceYear: number;
	region: ReturnType<typeof regionFromRoleName>;
	submit: () => Promise<void>;
	abort: () => void;
	dismissError: () => void;
	refresh: () => void;
};

export function useInvoicesPage(ctx: RenderPageCtx): UseInvoicesPage {
	const roleName = ctx.currentRole.attributes.name.toLowerCase();
	const region = regionFromRoleName(roleName);

	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [running, setRunning] = useState(false);
	const [aborted, setAborted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [results, setResults] = useState<InvoiceResult | null>(null);
	const [progress, setProgress] = useState<RunProgress | null>(null);
	const [statusById, setStatusById] = useState<Record<string, MemberRunState>>({});
	const abortRef = useRef<AbortController | null>(null);

	const invoiceYear = new Date().getFullYear();
	const pendingMembers = members.filter((m) => !m.invoice);
	const percent = progress ? (progress.processed / Math.max(progress.total, 1)) * 100 : 0;

	const refresh = async () => {
		setLoading(true);
		fetch(`/api/fortnox/plugin/invoices?role=${encodeURIComponent(roleName)}`, {
			headers: basicAuthHeaders(ctx),
		})
			.then(async (res) => {
				if (!res.ok) {
					const body = await res.json();
					throw new Error(body.error || `HTTP ${res.status}`);
				}
				return res.json();
			})
			.then((data) => setMembers(data.members))
			.catch((err) => setError(err.message || String(err)))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		refresh();
	}, [ctx]);

	useEffect(() => {
		if (!error) return;
		ctx.alert(error);
	}, [error]);

	const submit = async () => {
		if (running) return;

		setError(null);
		setResults(null);
		setStatusById({});
		setAborted(false);
		setRunning(true);

		const ordered = sortSwedish([...pendingMembers], 'last_name');
		const total = ordered.length;
		const counts = { created: 0, skipped: 0, failed: 0 };
		const summary: Omit<InvoiceResult, 'invoiceYear'> = {
			created: 0,
			skipped: 0,
			failed: 0,
			errors: [],
			invoices: [],
		};
		let processed = 0;

		setProgress({
			processed: 0,
			total,
			currentName: '',
			created: 0,
			skipped: 0,
			failed: 0,
			done: false,
		});

		const controller = new AbortController();
		abortRef.current = controller;

		try {
			for (let start = 0; start < ordered.length; start += BATCH_SIZE) {
				if (controller.signal.aborted) break;

				const batch = ordered.slice(start, start + BATCH_SIZE);

				await streamBatch(
					batch.map((m) => m.id),
					ctx,
					roleName,
					invoiceYear,
					controller.signal,
					{
						onMember: (event) => {
							processed++;
							if (event.status === 'created') counts.created++;
							else if (event.status === 'skipped') counts.skipped++;
							else counts.failed++;

							setStatusById((prev) => ({
								...prev,
								[event.id]: {
									status: event.status,
									reason: event.reason,
									documentNumber: event.documentNumber,
									invoiceRecordId: event.invoiceRecordId,
								},
							}));
							setProgress({
								processed,
								total,
								currentName: event.name || '',
								created: counts.created,
								skipped: counts.skipped,
								failed: counts.failed,
								done: false,
							});
						},
						onDone: (event) => {
							summary.created += event.summary.created;
							summary.skipped += event.summary.skipped;
							summary.failed += event.summary.failed;
							summary.errors.push(...event.summary.errors);
							summary.invoices.push(...event.summary.invoices);
						},
					},
				);
			}
		} catch (err: any) {
			if (!controller.signal.aborted) setError(err?.message || String(err));
		}

		if (total > 0 && !controller.signal.aborted) setResults({ ...summary, invoiceYear });
		setAborted(controller.signal.aborted);
		setProgress((prev) => (prev ? { ...prev, done: true, currentName: '' } : prev));
		setRunning(false);
		abortRef.current = null;
	};

	const abort = () => abortRef.current?.abort();
	const dismissError = () => setError(null);

	return {
		members,
		pendingMembers,
		loading,
		running,
		aborted,
		error,
		results,
		progress,
		statusById,
		percent,
		invoiceYear,
		region,
		submit,
		abort,
		dismissError,
		refresh,
	};
}

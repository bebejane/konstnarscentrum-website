import s from './InvoicesPage.module.scss';
import 'datocms-react-ui/styles.css';
import cn from 'classnames';
import { RenderPageCtx } from 'datocms-plugin-sdk';
import { Button, Spinner, Canvas, Toolbar, ToolbarStack, ToolbarTitle } from 'datocms-react-ui';
import { useEffect, useRef, useState } from 'react';
import { regions } from '/lib/region';
import { regionFromRoleName } from '/lib/plugin/utils';

type Props = { ctx: RenderPageCtx };

type Member = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	city: string;
	postal_code: string;
	active?: boolean;
	region?: string;
	fortnox_customer_number?: string;
};

type MemberStatus = 'created' | 'skipped' | 'failed';

type MemberRunState = {
	status: MemberStatus;
	reason?: string;
	documentNumber?: string;
};

type InvoiceResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: string[];
	invoices: string[];
	invoiceYear: number;
};

type RunProgress = {
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
	  }
	| {
			type: 'done';
			summary: Omit<InvoiceResult, 'invoiceYear'>;
			invoiceYear: number;
			region: string;
	  }
	| { type: 'error'; message: string };

const BATCH_SIZE = 20;

const sortSwedish = (arr: any[], key: string): any[] => {
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

export default function InvoicesPage({ ctx }: Props) {
	const roleName = ctx.currentRole.attributes.name.toLowerCase();
	const region = regionFromRoleName(roleName);

	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [running, setRunning] = useState(false);
	const [error, setError] = useState<string | null>();
	const [results, setResults] = useState<InvoiceResult | null>();
	const [progress, setProgress] = useState<RunProgress | null>(null);
	const [statusById, setStatusById] = useState<Record<string, MemberRunState>>({});
	const abortRef = useRef<AbortController | null>(null);

	const invoiceYear = new Date().getFullYear();

	useEffect(() => {
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
	}, [ctx]);

	const handleSubmit = async () => {
		if (running) return;

		setError(null);
		setResults(null);
		setStatusById({});
		setRunning(true);

		const ordered = sortSwedish([...members], 'last_name');
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

		if (total > 0) setResults({ ...summary, invoiceYear });
		setProgress((prev) => (prev ? { ...prev, done: true, currentName: '' } : prev));
		setRunning(false);
		abortRef.current = null;
	};

	const handleAbort = () => abortRef.current?.abort();

	const renderRunStatus = (state?: MemberRunState) => {
		if (!state) return '';
		const label =
			state.status === 'created' ? 'Skickad' : state.status === 'skipped' ? 'Skippad' : 'Fel';
		const className =
			state.status === 'created'
				? s.badgeCreated
				: state.status === 'skipped'
					? s.badgeSkipped
					: s.badgeFailed;
		return (
			<span className={className} title={state.reason || state.documentNumber || ''}>
				{label}
			</span>
		);
	};

	const percent = progress ? (progress.processed / Math.max(progress.total, 1)) * 100 : 0;

	return (
		<Canvas ctx={ctx}>
			<div className={s.container}>
				{loading ? (
					<div className={s.loading}>
						<Spinner /> Laddar medlemmar...
					</div>
				) : error ? (
					<div className={s.error}>
						<p>Fel: {error}</p>
						<button onClick={() => setError(null)}>Stäng</button>
					</div>
				) : (
					<>
						<Toolbar style={{ minHeight: 60, maxHeight: 60 }}>
							<ToolbarStack stackSize='m' style={{ paddingRight: 0 }}>
								<ToolbarTitle>Fakturera: {region?.name}</ToolbarTitle>
								<div style={{ flex: '1' }} />
								{running && (
									<Button buttonType='muted' onClick={handleAbort} style={{ marginRight: 8 }}>
										Avbryt
									</Button>
								)}
								<Button
									buttonType='primary'
									onClick={handleSubmit}
									disabled={running || members.length === 0}
									className={s.submit}
								>
									{running ? <Spinner /> : `Skicka fakturor (${invoiceYear})`}
								</Button>
							</ToolbarStack>
						</Toolbar>
						<div className={s.invoices}>
							{progress && progress.total > 0 && (
								<div className={s.progress}>
									<div className={s.bar}>
										<div className={s.barFill} style={{ width: `${percent}%` }} />
									</div>
									<div className={s.progressLabel}>
										{running
											? `Bearbetar ${progress.processed} / ${progress.total}${
													progress.currentName ? `: ${progress.currentName}` : ''
												}`
											: `Klart: ${progress.processed} / ${progress.total} bearbetade`}
									</div>
									<div className={s.legend}>
										<span className={s.badgeCreated}>{progress.created} skickade</span>
										<span className={s.badgeSkipped}>{progress.skipped} skippade</span>
										{progress.failed > 0 && (
											<span className={s.badgeFailed}>{progress.failed} misslyckade</span>
										)}
									</div>
								</div>
							)}

							{results && (
								<div className={cn(s.results, results.failed > 0 ? s.failed : s.ok)}>
									<strong>Resultat ({results.invoiceYear}):</strong>
									<ul>
										<li>{results.created} skapade</li>
										<li>{results.skipped} hoppade över</li>
										{results.failed > 0 && <li>{results.failed} misslyckades</li>}
									</ul>
									{results.errors.length > 0 && (
										<div>
											{results.errors.map((err, i) => (
												<div key={i}>{err}</div>
											))}
										</div>
									)}
								</div>
							)}

							{members.length > 0 && (
								<table>
									<thead>
										<tr>
											<th>Namn</th>
											<th>E-post</th>
											<th>Stad</th>
											<th>Kundnr.</th>
											<th>Status</th>
											<th>Faktura</th>
										</tr>
									</thead>
									<tbody>
										{sortSwedish([...members], 'last_name').map((m) => (
											<tr key={m.id} onClick={() => ctx.editItem(m.id)}>
												<td>
													<a>{[m.last_name, m.first_name].filter(Boolean).join(', ') || ''}</a>
												</td>
												<td>{m.email || ''}</td>
												<td>{m.city || ''}</td>

												<td>{m.fortnox_customer_number || ''}</td>
												<td>
													{m.active ? (
														<span style={{ color: 'var(--color--ink-success)' }}>Aktiv</span>
													) : (
														<span style={{ color: 'var(--color--ink-subtle)' }}>Inaktiv</span>
													)}
												</td>
												<td>{renderRunStatus(statusById[m.id])}</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</>
				)}
			</div>
		</Canvas>
	);
}

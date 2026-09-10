import s from './InvoicesPage.module.scss';
import 'datocms-react-ui/styles.css';
import { RenderPageCtx } from 'datocms-plugin-sdk';
import {
	Button,
	Spinner,
	Section,
	Canvas,
	Toolbar,
	ToolbarStack,
	ToolbarTitle,
} from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import { regions } from '/lib/region';

type Props = { ctx: RenderPageCtx };

type Member = {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	active?: boolean;
	region?: string;
	fortnox_customer_number?: string;
};

type InvoiceResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: string[];
	invoices: string[];
	invoiceYear: number;
};

const basicAuthHeaders = (ctx: RenderPageCtx): Record<string, string> => {
	const { basicAuthUsername, basicAuthPassword } = ctx.plugin.attributes.parameters;
	return {
		'Authorization': 'Basic ' + btoa(`${basicAuthUsername}:${basicAuthPassword}`),
		'Content-Type': 'application/json',
	};
};

export default function InvoicesPage({ ctx }: Props) {
	const roleName =
		ctx.currentRole.attributes.name.toLowerCase() === 'admin'
			? 'ost'
			: ctx.currentRole.attributes.name.toLowerCase();
	const region = regions.find((r) => r.slug.toLowerCase() === roleName);

	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>();
	const [results, setResults] = useState<InvoiceResult | null>();

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
		ctx.alert('TODO!');
		return;

		setSubmitting(true);
		setError(null);
		setResults(null);

		try {
			const res = await fetch('/api/fortnox/plugin/invoices', {
				method: 'POST',
				headers: basicAuthHeaders(ctx),
				body: JSON.stringify({ invoiceYear, role: roleName }),
			});

			const body = await res.json();
			if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);

			setResults(body);
		} catch (err) {
			setError(err.message || String(err));
		}

		setSubmitting(false);
	};

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
						<Toolbar style={{ minHeight: 60 }}>
							<ToolbarStack stackSize='m' style={{ justifyContent: 'flex-start' }}>
								<ToolbarTitle>Fakturor: {region?.name}</ToolbarTitle>
							</ToolbarStack>
						</Toolbar>
						<div className={s.invoices}>
							{results && (
								<div
									style={{
										background: results.failed > 0 ? '#fff5f5' : '#f0fff4',
									}}
								>
									<strong>Resultat ({results.invoiceYear}):</strong>
									<ul>
										<li>{results.created} skapade</li>
										<li>{results.skipped} hoppade över</li>
										{results.failed > 0 && <li>{results.failed} misslyckades</li>}
									</ul>
									{results.errors.length > 0 && (
										<div>
											{results.errors.map((err, i) => (
												<div key={i} style={{ color: 'var(--alert-color, #e53e3e)' }}>
													{err}
												</div>
											))}
										</div>
									)}
								</div>
							)}

							<Button
								onClick={handleSubmit}
								disabled={submitting || members.length === 0}
								fullWidth
								className={s.submit}
							>
								{submitting ? <Spinner /> : `Skicka fakturor (${invoiceYear})`}
							</Button>

							{members.length > 0 && (
								<table>
									<thead>
										<tr>
											<th>Namn</th>
											<th>E-post</th>
											<th>Kundnr.</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{members.map((m) => (
											<tr key={m.id}>
												<td>{[m.first_name, m.last_name].filter(Boolean).join(' ') || '—'}</td>
												<td>{m.email || '—'}</td>
												<td>{m.fortnox_customer_number || '—'}</td>
												<td>
													{m.active ? (
														<span style={{ color: '#38a169' }}>Aktiv</span>
													) : (
														<span style={{ color: '#a0aec0' }}>Inaktiv</span>
													)}
												</td>
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

import { RenderPageCtx } from 'datocms-plugin-sdk';
import { Button, Spinner, Section } from 'datocms-react-ui';
import { useEffect, useState } from 'react';

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

	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [results, setResults] = useState<InvoiceResult | undefined>();

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
		setSubmitting(true);
		setError(undefined);
		setResults(undefined);

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
		<div style={{ padding: 20 }}>
			{loading ? (
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<Spinner /> Laddar...
				</div>
			) : error ? (
				<div>
					<h2 style={{ margin: '0 0 8px' }}>Fakturor</h2>
					<p style={{ color: 'var(--alert-color, #e53e3e)' }}>Fel: {error}</p>
				</div>
			) : (
				<Section title='Fakturor'>
					<p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>
						{members.length} medlemmar
					</p>
					{results && (
						<div
							style={{
								padding: 12,
								marginBottom: 16,
								borderRadius: 4,
								background: results.failed > 0 ? '#fff5f5' : '#f0fff4',
								border: `1px solid ${results.failed > 0 ? '#feb2b2' : '#c6f6d5'}`,
							}}
						>
							<strong>Resultat ({results.invoiceYear}):</strong>
							<ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
								<li>{results.created} skapade</li>
								<li>{results.skipped} hoppade över</li>
								{results.failed > 0 && <li>{results.failed} misslyckades</li>}
							</ul>
							{results.errors.length > 0 && (
								<div style={{ marginTop: 8, fontSize: 13 }}>
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
						disabled={true || submitting || members.length === 0}
						fullWidth
					>
						{submitting ? <Spinner /> : `Skicka fakturor (${invoiceYear})`}
					</Button>

					{members.length > 0 && (
						<table
							style={{
								width: '100%',
								marginTop: 16,
								borderCollapse: 'collapse',
								fontSize: 13,
							}}
						>
							<thead>
								<tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
									<th style={{ padding: '6px 8px' }}>Namn</th>
									<th style={{ padding: '6px 8px' }}>E-post</th>
									<th style={{ padding: '6px 8px' }}>Kundnr.</th>
									<th style={{ padding: '6px 8px' }}>Status</th>
								</tr>
							</thead>
							<tbody>
								{members.map((m) => (
									<tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
										<td style={{ padding: '6px 8px' }}>
											{[m.first_name, m.last_name].filter(Boolean).join(' ') || '—'}
										</td>
										<td style={{ padding: '6px 8px' }}>{m.email || '—'}</td>
										<td style={{ padding: '6px 8px' }}>{m.fortnox_customer_number || '—'}</td>
										<td style={{ padding: '6px 8px' }}>
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
				</Section>
			)}
		</div>
	);
}

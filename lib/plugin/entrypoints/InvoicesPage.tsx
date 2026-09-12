import s from './InvoicesPage.module.scss';
import cn from 'classnames';
import { RenderPageCtx } from 'datocms-plugin-sdk';
import { Button, Spinner, Canvas, Toolbar, ToolbarStack, ToolbarTitle } from 'datocms-react-ui';
import { useInvoicesPage, sortSwedish } from '../hooks/useInvoicesPage';
import type { MemberRunState } from '../hooks/useInvoicesPage';

type Props = { ctx: RenderPageCtx };

export default function InvoicesPage({ ctx }: Props) {
	const {
		members,
		pendingMembers,
		loading,
		running,
		aborted,
		results,
		progress,
		statusById,
		percent,
		invoiceYear,
		region,
		submit,
		abort,
	} = useInvoicesPage(ctx);

	const renderRunStatus = (state?: MemberRunState) => {
		if (!state) return <span className={s.badgePlaceholder}>&nbsp;</span>;

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

	return (
		<Canvas ctx={ctx}>
			{loading && (
				<div className={s.loading}>
					<Spinner /> Laddar medlemmar...
				</div>
			)}
			<div className={s.container}>
				<>
					<Toolbar style={{ minHeight: 60, maxHeight: 60 }}>
						<ToolbarStack stackSize='m' style={{ paddingRight: 0 }}>
							<ToolbarTitle>Fakturera: {region?.name}</ToolbarTitle>
							<div style={{ flex: '1' }} />
							{running && (
								<Button buttonType='muted' onClick={abort} style={{ marginRight: 8 }}>
									Avbryt
								</Button>
							)}
							<Button
								buttonType='primary'
								onClick={submit}
								disabled={running || pendingMembers.length === 0}
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
										: aborted
											? `Avbruten: ${progress.processed} / ${progress.total} bearbetade`
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
									<li>{results.skipped} skippade</li>
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
										<th>Status</th>
										<th>Kundnr.</th>
										<th>Fakturanr.</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{sortSwedish([...members], 'last_name').map((m) => {
										const invoiceId = statusById[m.id]?.invoiceRecordId ?? m.invoice?.id;
										const documentNumber =
											statusById[m.id]?.documentNumber ?? m.invoice?.fortnox_document_number;
										return (
											<tr key={m.id} onClick={() => ctx.editItem(m.id)}>
												<td>
													<a>{[m.last_name, m.first_name].filter(Boolean).join(', ') || ''}</a>
												</td>
												<td>{m.email || ''}</td>
												<td>
													<span className={cn(m.active && s.active)}>
														{m.active ? 'Aktiv' : 'Inaktiv'}
													</span>
												</td>
												<td>{m.fortnox_customer_number || ''}</td>
												<td
													onClick={(e) => {
														e.stopPropagation();
														ctx.editItem(invoiceId);
													}}
												>
													{documentNumber && <a>#{documentNumber}</a>}
												</td>
												<td>
													{renderRunStatus(invoiceId ? { status: 'created' } : statusById[m.id])}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						)}
					</div>
				</>
			</div>
		</Canvas>
	);
}

import s from './MembersExportOutlet.module.scss';
import { RenderItemCollectionOutletCtx } from 'datocms-plugin-sdk';
import { Button, Canvas, Spinner } from 'datocms-react-ui';
import { useState } from 'react';
import { basicAuthHeader, downloadBlob, filenameFromDisposition, isDev } from '../utils';
import regions from '/regions.json';

export type PropTypes = {
	ctx: RenderItemCollectionOutletCtx;
};

export default function MembersExportOutlet({ ctx }: PropTypes) {
	const [exporting, setExporting] = useState(false);

	const exportMembers = async () => {
		setExporting(true);

		try {
			const region = regions.find(({ name }) => ctx.currentRole.attributes.name === name);
			if (!region) throw new Error('Region not found for role: ' + ctx.currentRole.attributes.name);

			const res = await fetch('/api/members/export', {
				method: 'POST',
				headers: {
					'Authorization': basicAuthHeader(ctx.plugin.attributes.parameters),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ role: region.slug }),
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || `HTTP ${res.status}`);
			}

			downloadBlob(
				await res.blob(),
				filenameFromDisposition(res.headers.get('Content-Disposition')),
			);
			ctx.notice('Excel-filen laddas ner');
		} catch (err: any) {
			ctx.alert(err?.message || String(err));
		}

		setExporting(false);
	};

	return (
		<Canvas ctx={ctx}>
			<div className={s.container}>
				<div className={s.text}>
					<strong>Exportera medlemslistan</strong>
					<span>Ladda ner alla medlemmar för din region som en Excel-fil.</span>
				</div>
				<Button
					buttonType='primary'
					disabled={exporting}
					onClick={exportMembers}
					style={{ minWidth: 170 }}
				>
					{exporting ? <Spinner /> : `Exportera (excel)`}
				</Button>
			</div>
		</Canvas>
	);
}

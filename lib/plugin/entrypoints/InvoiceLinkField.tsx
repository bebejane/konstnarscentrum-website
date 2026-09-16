'use client';

import { useState } from 'react';
import { Button, Canvas } from 'datocms-react-ui';
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { regionFromRoleName } from '/lib/plugin/utils';
import { MdFileDownload } from 'react-icons/md';

type PropTypes = {
	ctx: RenderFieldExtensionCtx;
};

export default function InvoiceLinkField({ ctx }: PropTypes) {
	const invoiceId = ctx.formValues?.fortnox_document_number as string | undefined;
	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!invoiceId) return null;
	const region = regionFromRoleName(ctx.currentRole.attributes.name.toLowerCase());
	if (!region) return null;

	const download = async () => {
		setDownloading(true);
		setError(null);
		try {
			const { basicAuthUsername, basicAuthPassword } = ctx.plugin.attributes.parameters;
			const res = await fetch(
				`/api/fortnox/invoice-pdf?documentNumber=${encodeURIComponent(invoiceId)}&region=${encodeURIComponent(region.slug)}`,
				{
					headers: {
						Authorization: `Basic ${btoa(`${basicAuthUsername}:${basicAuthPassword}`)}`,
					},
				},
			);

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || `HTTP ${res.status}`);
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `faktura-${invoiceId}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err: any) {
			setError(err?.message ?? String(err));
		} finally {
			setDownloading(false);
		}
	};

	return (
		<Canvas ctx={ctx}>
			<Button
				fullWidth
				buttonType='muted'
				disabled={downloading}
				onClick={download}
				leftIcon={!downloading ? <MdFileDownload /> : undefined}
			>
				{downloading ? 'Laddar ner...' : 'Fortnox faktura (PDF)'}
			</Button>
			{error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
		</Canvas>
	);
}

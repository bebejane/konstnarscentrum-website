'use client';

import { Canvas } from 'datocms-react-ui';

import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import 'datocms-react-ui/styles.css';

type PropTypes = {
	ctx: RenderFieldExtensionCtx;
};

const FORTNOX_INVOICE_URL =
	'https://apps5.fortnox.se/app/54489d4ebc8b4a5c88113e07f22511cd/kf/invoice';

export function InvoiceLinkField({ ctx }: PropTypes) {
	const invoiceId = ctx.formValues?.fortnox_document_number as string | undefined;

	if (!invoiceId) return null;

	return (
		<Canvas ctx={ctx}>
			<a href={`${FORTNOX_INVOICE_URL}/${invoiceId}`} target='_blank' rel='noopener noreferrer'>
				Open in Fortnox ↗
			</a>
		</Canvas>
	);
}

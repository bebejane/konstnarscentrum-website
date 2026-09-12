'use client';

import { Canvas } from 'datocms-react-ui';
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { regionFromRoleName } from '/lib/plugin/utils';
import { getFortnoxInvoiceUrl } from '/lib/fortnox/constants';

type PropTypes = {
	ctx: RenderFieldExtensionCtx;
};

export default function InvoiceLinkField({ ctx }: PropTypes) {
	const invoiceId = ctx.formValues?.fortnox_document_number as string | undefined;

	if (!invoiceId) return null;
	const region = regionFromRoleName(ctx.currentRole.attributes.name.toLowerCase());

	if (!region) return null;
	const href = getFortnoxInvoiceUrl(invoiceId, region.slug);

	return (
		<Canvas ctx={ctx}>
			<a href={href} target='_blank' rel='noopener noreferrer'>
				Open in Fortnox ↗
			</a>
		</Canvas>
	);
}

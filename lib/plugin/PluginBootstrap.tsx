import 'datocms-react-ui/styles.css';
import React, { useEffect, useRef } from 'react';
import {
	BuildItemPresentationInfoCtx,
	connect,
	ContentAreaSidebarItemsCtx,
	Item,
	ManualFieldExtensionsCtx,
	RenderFieldExtensionCtx,
	RenderPageCtx,
} from 'datocms-plugin-sdk';
import { render } from '/lib/plugin/utils/render';
import ConfigScreen from '/lib/plugin/entrypoints/ConfigScreen';
import RegionField from '/lib/plugin/entrypoints/RegionField';
import ModelSelectorField from '/lib/plugin/entrypoints/ModelSelectorField';
import MemberApproval from '/lib/plugin/entrypoints/MemberApproval';
import InvoicesPage from '/lib/plugin/entrypoints/InvoicesPage';
import InvoiceLinkField from '/lib/plugin/entrypoints/InvoiceLinkField';
import { isDev } from '/lib/plugin/utils';

export default function PluginBootstrap() {
	const connecting = useRef(false);

	async function init() {
		connecting.current = true;

		connect({
			renderConfigScreen(ctx) {
				return render(<ConfigScreen ctx={ctx} />);
			},
			manualFieldExtensions(ctx: ManualFieldExtensionsCtx) {
				return [
					{
						id: 'region-field',
						name: 'Region Field' + (isDev ? ' (dev)' : ''),
						type: 'editor',
						fieldTypes: ['link'],
						configurable: false,
					},
					{
						id: 'member-approval',
						name: 'Member approval' + (isDev ? ' (dev)' : ''),
						type: 'editor',
						fieldTypes: ['boolean'],
						configurable: false,
					},
					{
						id: 'model-selector',
						name: 'Model selector' + (isDev ? ' (dev)' : ''),
						type: 'editor',
						fieldTypes: ['string'],
						configurable: false,
					},
					{
						id: 'invoice-link',
						name: 'Fortnox Invoice Link',
						type: 'addon' as const,
						fieldTypes: ['string'],
					},
				];
			},
			overrideFieldExtensions(field) {
				if (field.attributes.api_key === 'fortnox_document_number') {
					return {
						addons: [{ id: 'invoice-link' }],
					};
				}
			},
			renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
				switch (fieldExtensionId) {
					case 'region-field':
						return render(<RegionField ctx={ctx} />);
					case 'member-approval':
						return ctx.itemStatus === 'published' ? render(<MemberApproval ctx={ctx} />) : null;
					case 'model-selector':
						return render(<ModelSelectorField ctx={ctx} />);
					case 'invoice-link':
						return render(<InvoiceLinkField ctx={ctx} />);
				}
			},
			contentAreaSidebarItems(ctx: ContentAreaSidebarItemsCtx) {
				if (ctx.environment !== 'dev') return [];

				return [
					{
						label: 'Fakturera' + (isDev ? ' (dev)' : ''),
						icon: 'file-lines',
						pointsTo: { pageId: 'invoices' },
						placement: ['after', 'menuItems'],
					},
				];
			},
			renderPage(pageId: string, ctx: RenderPageCtx) {
				if (pageId === 'invoices') {
					return render(<InvoicesPage ctx={ctx} />);
				}
			},
			async buildItemPresentationInfo(item: Item, ctx: BuildItemPresentationInfoCtx) {
				if (!item.attributes.fortnox_document_number) return;

				const {
					attributes: { fortnox_document_number, invoice_year, payment_status },
				} = item;

				return {
					title: `#${fortnox_document_number} - ${payment_status} (${invoice_year})`,
				};
			},
		})
			.catch(() => {
				console.error('PluginBootstrap error');
			})
			.finally(() => {
				console.log('PluginBootstrap connected');
				connecting.current = false;
			});
	}

	useEffect(() => {
		if (connecting.current) return;

		init();
	}, []);

	return <div id='root' />;
}

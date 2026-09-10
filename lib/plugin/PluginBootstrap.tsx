import 'datocms-react-ui/styles.css';
import React, { useEffect } from 'react';
import { connect, IntentCtx, RenderFieldExtensionCtx, RenderPageCtx } from 'datocms-plugin-sdk';
import { render } from '/lib/plugin/utils/render';
import ConfigScreen from '/lib/plugin/entrypoints/ConfigScreen';
import RegionField from '/lib/plugin/entrypoints/RegionField';
import ModelSelectorField from '/lib/plugin/entrypoints/ModelSelectorField';
import MemberApproval from '/lib/plugin/entrypoints/MemberApproval';
import InvoicesPage from '/lib/plugin/InvoicesPage';
import { isDev } from '/lib/plugin/utils';

let connected = false;

export default function PluginBootstrap() {
	useEffect(() => {
		if (connected) return;
		connected = true;

		connect({
			renderConfigScreen(ctx) {
				return render(<ConfigScreen ctx={ctx} />);
			},
			manualFieldExtensions(ctx: IntentCtx) {
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
				];
			},
			renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
				switch (fieldExtensionId) {
					case 'region-field':
						return render(<RegionField ctx={ctx} />);
					case 'member-approval':
						return ctx.itemStatus === 'published' ? render(<MemberApproval ctx={ctx} />) : null;
					case 'model-selector':
						return render(<ModelSelectorField ctx={ctx} />);
				}
			},
			contentAreaSidebarItems(ctx: IntentCtx) {
				if (ctx.environment !== 'dev') return [];

				return [
					{
						label: 'Fakturor',
						icon: 'file-invoice',
						pointsTo: { pageId: 'invoices' },
						placement: ['before', 'settings'],
					},
				];
			},
			renderPage(pageId: string, ctx: RenderPageCtx) {
				if (pageId === 'invoices') {
					return render(<InvoicesPage ctx={ctx} />);
				}
			},
			// itemFormSidebarPanels(itemType: ItemType, ctx: InitPropertiesAndMethods) {
			// 	const helpModels = ctx.plugin.attributes.parameters.helpModels as string;
			// 	if (!helpModels) return [];

			// 	const activeHelpModels = JSON.parse(helpModels) as ModelOption[];
			// 	if (!activeHelpModels.find(({ value }) => value === itemType.attributes.api_key)) return [];

			// 	return [
			// 		{
			// 			id: 'sidebarHelp',
			// 			label: `Hjälp${isDev ? ' (dev)' : ''}`,
			// 			placement: ['before', 'actions'],
			// 			startOpen: true,
			// 		},
			// 	];
			// },
			// renderItemFormSidebarPanel(sidebarPanelId, ctx: RenderItemFormSidebarPanelCtx) {
			// 	return render(<HelpSidebar ctx={ctx} />);
			// },
		})
			.catch(console.error)
			.finally(() => {
				console.log('PluginBootstrap connected');
			});
	}, []);

	return <div id='root' />;
}

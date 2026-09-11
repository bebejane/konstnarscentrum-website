import { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, Button, TextField } from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import ModelSelector from './ModelSelector';

export type Props = {
	ctx: RenderConfigScreenCtx;
};

type Parameters = {
	helpModels: string;
	basicAuthUsername: string;
	basicAuthPassword: string;
};

export default function ConfigScreen({ ctx }: Props) {
	const parameters = ctx.plugin.attributes.parameters as Parameters;
	const [basicAuthPassword, setBasicAuthPassword] = useState<string | undefined>();
	const [basicAuthUsername, setBasicAuthUsername] = useState<string | undefined>();

	const saveSettings: React.MouseEventHandler = (e) => {
		e.preventDefault();
		ctx.updatePluginParameters({ ...parameters, basicAuthPassword, basicAuthUsername });
	};

	useEffect(() => {
		setBasicAuthPassword(ctx.plugin.attributes.parameters.basicAuthPassword as string);
		setBasicAuthUsername(ctx.plugin.attributes.parameters.basicAuthUsername as string);
	}, [ctx.plugin.attributes.parameters]);

	const hasChanged =
		JSON.stringify({ ...parameters, basicAuthPassword, basicAuthUsername }) !==
		JSON.stringify(parameters);

	return (
		<Canvas ctx={ctx}>
			<TextField
				id='basicAuthUsername'
				label='Username'
				name='basicAuthUsername'
				value={basicAuthUsername}
				onChange={(val) => setBasicAuthUsername(val as string)}
			/>
			<TextField
				id='basicAuthPassword'
				label='Password'
				name='basicAuthPassword'
				textInputProps={{
					type: 'password',
				}}
				value={basicAuthPassword}
				onChange={(val) => setBasicAuthPassword(val as string)}
			/>
			<br />
			<Button fullWidth disabled={!hasChanged} onClick={saveSettings}>
				Save settings
			</Button>
		</Canvas>
	);
}

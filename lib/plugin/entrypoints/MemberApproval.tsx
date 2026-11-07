import s from './MemberApproval.module.scss';
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, Button, Spinner } from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import { buildClient } from '@datocms/cma-client-browser';
import { siteUrl } from '../utils';

const approvalEndpoint = `${siteUrl}/api/auth/approve`;
const isDev = process.env.NODE_ENV === 'development';

export type PropTypes = {
	ctx: RenderFieldExtensionCtx;
};

export default function MemberApproval({ ctx }: PropTypes) {
	const { basicAuthPassword, basicAuthUsername } = ctx.plugin.attributes.parameters;
	const [approved, setApproved] = useState(false);
	const [pending, setPending] = useState<'approve' | 'direct' | null>(null);
	const [memberExists, setMemberExists] = useState(false);
	const [checkingMember, setCheckingMember] = useState(false);
	const [error, setError] = useState<Error | undefined>();

	const email = ctx.formValues.email as string | undefined;
	const isBusy = pending !== null;

	useEffect(() => {
		setApproved(ctx.formValues[ctx.field.attributes.api_key] as boolean);
	}, [ctx.formValues, ctx.field]);

	// Disable "Godkänn direkt" when a member with this email already exists.
	useEffect(() => {
		if (!email || !ctx.currentUserAccessToken) {
			setMemberExists(false);
			return;
		}

		let cancelled = false;
		setCheckingMember(true);

		const client = buildClient({
			apiToken: ctx.currentUserAccessToken,
			environment: process.env.NEXT_PUBLIC_DATOCMS_ENVIRONMENT,
		});

		client.items
			.list({ filter: { type: 'member', fields: { email: { eq: email } } } })
			.then((items) => {
				if (!cancelled) setMemberExists(items.length > 0);
			})
			.catch((err) => {
				console.warn(err);
				if (!cancelled) setMemberExists(false);
			})
			.finally(() => {
				if (!cancelled) setCheckingMember(false);
			});

		return () => {
			cancelled = true;
		};
	}, [email, ctx.currentUserAccessToken]);

	const runApproval = async (direct: boolean) => {
		if (isBusy) return;

		setPending(direct ? 'direct' : 'approve');
		setError(undefined);

		try {
			const formData = { ...ctx.formValues };

			const res = await fetch(approvalEndpoint, {
				method: 'POST',
				body: JSON.stringify({
					...formData,
					id: ctx.item.id,
					approved: true,
					...(direct ? { approve_direct: true } : {}),
				}),
				headers: {
					'Content-type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Basic ' + btoa(basicAuthUsername + ':' + basicAuthPassword),
				},
			});

			const body = await res.json();

			if (res.status !== 200) throw new Error('Server error: ' + body.error);

			try {
				const directMessage = body.memberCreated ? 'Medlem skapad utan e-post' : 'Medlem fanns redan';

				if (body.approved !== ctx.item?.attributes.approved) {
					await ctx.setFieldValue(ctx.field.attributes.api_key as string, true);
					await ctx.saveCurrentItem();
					ctx.notice(direct ? directMessage : 'Ansökan godkänd!');
				} else if (body.approved && body.approved === ctx.item?.attributes.approved) {
					ctx.notice(direct ? directMessage : 'Ansöknings meddelande skickat!');
				}
			} catch (err) {
				console.warn(err);
			}

			setApproved(true);
			if (direct) setMemberExists(true);
		} catch (err) {
			console.error(err);
			setError(err as Error);
		}

		setPending(null);
	};

	return (
		<Canvas ctx={ctx}>
			<div className={s.container}>
				<strong>{approved ? 'GODKÄND' : 'EJ GODKÄND'}</strong>
				<p>
					Genom att klicka på knappen nedan godkänns ansökan och medlemmen skickas ett e-post
					meddelande med instruktioner för att skapa sitt konto och portfolio.
				</p>
				<Button className={s.button} fullWidth disabled={isBusy} onClick={() => runApproval(false)}>
					{pending === 'approve' ? (
						<Spinner />
					) : approved ? (
						'Skicka bekfräftelse meddelande igen'
					) : (
						'Godkänn ansökan'
					)}
					{isDev && <span> (dev)</span>}
				</Button>

				<p className={s.hint}>
					Godkänn direkt skapar medlemmen utan att skicka något e-postmeddelande. Knappen är
					inaktiverad om medlemmen redan finns.
				</p>
				<Button
					className={s.button}
					fullWidth
					buttonType='muted'
					disabled={isBusy || checkingMember || memberExists || !email}
					onClick={() => runApproval(true)}
				>
					{pending === 'direct' ? <Spinner /> : 'Godkänn direkt'}
					{isDev && <span> (dev)</span>}
				</Button>

				{error && (
					<p className={s.error}>
						<>Fel: {error?.message || error}</>
					</p>
				)}
			</div>
		</Canvas>
	);
}

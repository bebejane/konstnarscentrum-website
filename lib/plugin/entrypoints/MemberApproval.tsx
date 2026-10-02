import s from './MemberApproval.module.scss'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, Button, Spinner } from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import { siteUrl } from '../utils';

const approvalEndpoint = `${siteUrl}/api/auth/approve`

export type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

export default function MemberApproval({ ctx }: PropTypes) {

  const { basicAuthPassword, basicAuthUsername } = ctx.plugin.attributes.parameters
  const [approved, setApproved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()

  const approveApplication = async () => {

    //if (approved) return
    setLoading(true)
    setError(undefined)

    console.time('call approve endpoint');

    try {
      const formData = { ...ctx.formValues }

      const res = await fetch(approvalEndpoint, {
        method: 'POST',
        body: JSON.stringify({ ...formData, approved: true }),
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa(basicAuthUsername + ":" + basicAuthPassword)
        }
      })

      const body = await res.json()

      if (res.status !== 200)
        throw new Error('Server error: ' + body.error)

      try {
        console.log(body.approved, ctx.item?.attributes.approved)

        if (body.approved !== ctx.item?.attributes.approved) {
          console.log('set field value');
          await ctx.setFieldValue(ctx.field.attributes.api_key as string, true)
          await ctx.saveCurrentItem()
          ctx.notice('Ansökan godkänd!')
        } else if (body.approved && body.approved === ctx.item?.attributes.approved) {
          ctx.notice('Ansöknings meddelande skickat!')
        }
      } catch (err) {
        console.warn(err)
      }
      console.timeEnd('call approve endpoint');
      setApproved(true)

    } catch (err) {
      console.error(err)
      setError(err as Error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetch(approvalEndpoint, {
      method: 'POST',
      body: JSON.stringify({ ping: true }),
      headers: {
        'Authorization': 'Basic ' + btoa(basicAuthUsername + ":" + basicAuthPassword),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(() => { console.log('pinged endpoint') }).catch(err => console.error(err));

  }, [basicAuthUsername, basicAuthPassword])

  useEffect(() => {
    setApproved(ctx.formValues[ctx.field.attributes.api_key] as boolean)
  }, [ctx.formValues, ctx.field])

  return (
    <Canvas ctx={ctx}>
      <div className={s.container}>
        <strong>{approved ? 'GODKÄND' : 'EJ GODKÄND'}</strong>
        <p>
          Genom att klicka på knappen nedan godkänns ansökan
          och medlemmen skickas ett e-post meddelande med instruktioner
          för att skapa sitt konto och portfolio.
        </p>
        <Button className={s.button} fullWidth disabled={loading} onClick={approveApplication}>
          {!loading ? approved ? 'Skicka bekfräftelse meddelande igen' : 'Godkänn ansökan' : <Spinner />}
        </Button>

        {error &&
          <p className={s.error}>
            <>Fel: {error?.message || error}</>
          </p>
        }
      </div>
    </Canvas>
  )
}
import { RenderItemFormSidebarPanelCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';
import { useEffect, useState } from 'react'
import { buildClient } from '@datocms/cma-client-browser';
import ReactMarkdown from 'react-markdown';
export type PropTypes = { ctx: RenderItemFormSidebarPanelCtx };

export default function HelpSidebar({ ctx }: PropTypes) {

  const [helps, setHelps] = useState<any[] | undefined>()

  useEffect(() => {
    const client = buildClient({ apiToken: ctx.currentUserAccessToken as string })
    client.items.list({
      filter: {
        type: 'help',
        fields: {
          model: { eq: ctx.itemType.attributes.api_key }
        }
      }
    }).then(items => setHelps(items))

  }, [ctx])

  return (
    <Canvas ctx={ctx}>
      {helps?.map(({ text, title, model }) =>
        <>
          {title &&
            <p>
              <strong>{title}</strong>
            </p>
          }
          <ReactMarkdown>{text}</ReactMarkdown>
        </>
      )}
    </Canvas>
  );
}
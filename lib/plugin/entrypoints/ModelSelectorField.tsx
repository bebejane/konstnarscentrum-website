import ModelSelector from './ModelSelector';
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';

export type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

export type ModelOption = {
  label: string,
  value: string
}

export default function ModelSelectorField({ ctx }: PropTypes) {

  const currentValue = {
    value: ctx.formValues[ctx.field.attributes.api_key] as string,
    label: ctx.field.attributes.api_key
  }
  return (
    <Canvas ctx={ctx}>
      <ModelSelector
        currentUserAccessToken={ctx.currentUserAccessToken as string}
        currentValue={currentValue}
        isMulti={false}
        onChange={(option) => !Array.isArray(option) && ctx.setFieldValue(ctx.field.attributes.api_key, option.value)}
      />
    </Canvas>
  )
}
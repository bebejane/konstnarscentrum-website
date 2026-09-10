import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, SelectField, Spinner } from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import { buildClient } from '@datocms/cma-client-browser';

export type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

export type RegionOption = {
  label: string,
  value: string
}

export default function RegionField({ ctx }: PropTypes) {

  const [options, setOptions] = useState<RegionOption[] | undefined>()
  const [value, setValue] = useState<RegionOption | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()

  const handleChange = async (newValue: RegionOption | undefined) => {
    if (!newValue) return
    setValue(newValue)
    await ctx.setFieldValue(ctx.field.attributes.api_key, newValue?.value)
  }

  useEffect(() => {

    const client = buildClient({ apiToken: ctx.currentUserAccessToken as string })
    const currentValue = ctx.formValues[ctx.field.attributes.api_key];

    setLoading(true)

    client.items.list({ filter: { type: 'region' } }).then((regions) => {

      const options = regions.map(({ id, name }) => ({ value: id as string, label: name as string }))

      setOptions(options)

      if (currentValue) {
        setValue(options.find(({ value }) => value === currentValue))
      } else {
        const roleName = ctx.currentRole.attributes.name.toLowerCase();
        handleChange(options.find(({ value, label }) => label.toLowerCase() === roleName))
        console.log('set role value', roleName)
      }
    })
      .catch(err => setError(err))
      .finally(() => setLoading(false))

  }, [])

  return (
    <Canvas ctx={ctx}>
      {loading ? <Spinner /> :
        <SelectField
          id="role"
          name="role"
          label=""
          value={value}
          selectInputProps={{ isMulti: false, options }}
          onChange={(newValue) => handleChange(newValue as RegionOption)}
        />
      }
      {error && <div><>Error: {error.message || error}</></div>}
    </Canvas>
  )

}
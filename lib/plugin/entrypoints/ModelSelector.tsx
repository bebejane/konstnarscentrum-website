import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { SelectField } from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import { buildClient } from '@datocms/cma-client-browser';

export type PropTypes = {
  isMulti?: boolean
  currentUserAccessToken: string
  currentValue: ModelOption | ModelOption[]
  onChange: (option: ModelOption | ModelOption[]) => void
};

export type ModelOption = {
  label: string,
  value: string
}

export default function ModelSelector({ onChange, isMulti = false, currentUserAccessToken, currentValue }: PropTypes) {

  const [options, setOptions] = useState<ModelOption[] | undefined>()
  const [option, setOption] = useState<ModelOption | ModelOption[] | undefined>()
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {

    const client = buildClient({ apiToken: currentUserAccessToken as string })

    client.itemTypes.list().then((models) => {

      const options = models
        .filter(el => !el.modular_block)
        .sort((a, b) => a.name > b.name ? 1 : -1)
        .map(({ api_key, name }) => ({ value: api_key as string, label: name as string }))

      setOptions(options)

      if (currentValue) {
        if (!Array.isArray(currentValue))
          setOption(options.find(({ value }) => value === currentValue.value))
        else
          setOption(options.filter(({ value }) => currentValue.find(el => el.value === value)))
      }


    }).catch(err => setError(err))

  }, [setOptions])

  useEffect(() => {
    if (typeof option !== 'undefined')
      onChange(option)
  }, [option])

  return (
    <>
      <SelectField
        id="model"
        name="model"
        label=""
        value={option}
        selectInputProps={{ isMulti, options }}
        onChange={(newValue) => { setOption(newValue as ModelOption) }}
      />
      {error && <div>Error: {error.message}</div>}
    </>
  )

}
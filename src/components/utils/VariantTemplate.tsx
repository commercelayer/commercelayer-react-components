import { Fragment, FunctionComponent } from 'react'
import { BaseSelectorType } from '#typings'
import { VariantsObject, SetSkuCode } from '#reducers/VariantReducer'
import { VariantOption } from '#components/skus/VariantSelector'

export type VariantHandleCallback = (variant: VariantOption) => void

export type VariantTemplateProps = {
  variants: VariantsObject | Record<string, any>
  handleChange?: SetSkuCode
  options: VariantOption[]
  type?: BaseSelectorType
  loader?: string | JSX.Element
  placeholder?: string
  skuCode?: string
  handleCallback?: VariantHandleCallback
} & JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['select']

const VariantTemplate: FunctionComponent<VariantTemplateProps> = (props) => {
  const {
    id,
    variants,
    type,
    placeholder,
    options,
    skuCode,
    handleChange,
    handleCallback,
    ...prs
  } = props
  const vars = Object.keys(variants).map((v, k) => {
    const checked = skuCode === v
    const label = options.length > 0 ? options[k]?.label : variants[v].name
    return type === 'select' ? (
      <option
        key={variants[v].id}
        data-sku-id={variants[v].id}
        data-label={label}
        value={variants[v].code}
      >
        {label}
      </option>
    ) : (
      <Fragment key={variants[v].id}>
        <input
          id={id && `${id}-${k}`}
          defaultChecked={checked}
          type="radio"
          value={variants[v].code}
          onChange={(e): void => {
            const code = e.target.value
            handleChange && handleChange(code, variants[v].id)
            handleCallback && handleCallback({ code, label })
          }}
          {...prs}
        />
        {label}
      </Fragment>
    )
  })
  if (type === 'select') {
    return (
      <select
        id={id}
        title="Variant selector"
        onChange={(e): void => {
          const v = e.target.value
          const i = e.target.selectedIndex
          const id = e.target[i]?.dataset?.['skuId'] as string
          const label = e.target[i]?.dataset?.['label'] as string
          handleChange && handleChange(v, id)
          handleCallback && handleCallback({ code: v, label })
        }}
        value={skuCode || ''}
        {...prs}
      >
        <option disabled={!!skuCode}>{placeholder}</option>
        {vars}
      </select>
    )
  }
  return <>{vars}</>
}

export default VariantTemplate

import { Fragment, FunctionComponent, ReactNode } from 'react'
import PropTypes from 'prop-types'
import { BaseSelectorType } from '#typings'
import { VariantsObject, SetSkuCode } from '#reducers/VariantReducer'
import { VariantOption } from '#components/skus/VariantSelector'

export const propTypes = {
  variants: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      lineItem: PropTypes.shape({
        name: PropTypes.string.isRequired,
        imageUrl: PropTypes.string
      })
    }).isRequired
  ).isRequired,
  name: PropTypes.string,
  children: PropTypes.func,
  type: PropTypes.oneOf<BaseSelectorType>(['select', 'radio']),
  loader: PropTypes.element,
  placeholder: PropTypes.string,
  skuCode: PropTypes.string
}

export type VariantHandleCallback = (variant: VariantOption) => void

export type VariantTemplateProps = {
  variants: VariantsObject | Record<string, any>
  handleChange?: SetSkuCode
  options: VariantOption[]
  type?: BaseSelectorType
  loader?: ReactNode
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
          id={`${id ?? 'radio'}-${k}`}
          defaultChecked={checked}
          type='radio'
          value={variants[v].code}
          onChange={(e): void => {
            const code = e.target.value
            if (handleChange) handleChange(code, variants[v].id)
            if (handleCallback) handleCallback({ code, label })
          }}
          {...prs}
        />
        {label}
      </Fragment>
    )
  })
  console.log('vars', vars, variants)
  if (type === 'select') {
    return (
      <select
        id={id}
        title='Variant selector'
        onChange={(e): void => {
          const v = e.target.value
          const i = e.target.selectedIndex
          const id = e.target[i]?.dataset?.['skuId'] as string
          const label = e.target[i]?.dataset?.['label'] as string
          if (handleChange) handleChange(v, id)
          if (handleCallback) handleCallback({ code: v, label })
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

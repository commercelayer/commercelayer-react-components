import React, { Fragment, FunctionComponent } from 'react'
import _ from 'lodash'
import { VariantSelectorProps } from './VariantSelector'
import PropTypes, { InferProps } from 'prop-types'

const VTProps = {
  variants: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  skuCodes: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.func,
  type: PropTypes.oneOf(['select', 'radio']),
  loader: PropTypes.element,
  placeholder: PropTypes.string,
  skuCode: PropTypes.string
}

export type VariantTemplateProps = InferProps<typeof VTProps> &
  VariantSelectorProps

const VariantTemplate: FunctionComponent<VariantTemplateProps> = props => {
  const {
    id,
    variants,
    type,
    placeholder,
    skuCodes,
    skuCode,
    onChange,
    ...prs
  } = props
  const vars = _.keys(variants).map((v, k) => {
    const checked = skuCode === v
    return type === 'select' ? (
      <option
        key={variants[v].id}
        data-sku-id={variants[v].id}
        value={variants[v].code}
      >
        {skuCodes.length > 0 ? skuCodes[k].label : variants[v].name}
      </option>
    ) : (
      <Fragment key={variants[v].id}>
        <input
          id={id && `${id}-${k}`}
          defaultChecked={checked}
          type="radio"
          value={variants[v].code}
          onChange={(e): void => onChange(e.target.value, variants[v].id)}
          {...prs}
        />
        {skuCodes.length > 0 ? skuCodes[k].label : variants[v].name}
      </Fragment>
    )
  })
  if (type === 'select') {
    return (
      <select
        id={id}
        onChange={(e): void => {
          const v = e.target.value
          const i = e.target.selectedIndex
          const id = e.target[i].dataset.skuId
          onChange(v, id)
        }}
        value={skuCode}
        {...prs}
      >
        <option disabled={!!skuCode}>{placeholder}</option>
        {vars}
      </select>
    )
  }
  return <Fragment>{vars}</Fragment>
}

VariantTemplate.propTypes = VTProps

export default VariantTemplate

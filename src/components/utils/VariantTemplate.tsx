import React, { Fragment, FunctionComponent, ReactNode } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { BaseSelectorType } from '../../@types'
import { VariantsObject, SetSkuCode } from '../../reducers/VariantReducer'
import { VariantOptions } from '../VariantSelector'

export const propTypes = {
  variants: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      lineItem: PropTypes.shape({
        name: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
      }),
    }).isRequired
  ).isRequired,
  name: PropTypes.string,
  children: PropTypes.func,
  type: PropTypes.oneOf<BaseSelectorType>(['select', 'radio']),
  loader: PropTypes.element,
  placeholder: PropTypes.string,
  skuCode: PropTypes.string,
}

export type VariantTemplateProps = {
  variants: VariantsObject | object
  onChange?: SetSkuCode
  options: VariantOptions[]
  type?: BaseSelectorType
  loader?: ReactNode
  placeholder?: string
  skuCode?: string
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
        {options.length > 0 ? options[k].label : variants[v].name}
      </option>
    ) : (
      <Fragment key={variants[v].id}>
        <input
          id={id && `${id}-${k}`}
          defaultChecked={checked}
          type="radio"
          value={variants[v].code}
          onChange={(e): void =>
            onChange && onChange(e.target.value, variants[v].id)
          }
          {...prs}
        />
        {options.length > 0 ? options[k].label : variants[v].name}
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
          const id = e.target[i].dataset.skuId as string
          onChange && onChange(v, id)
        }}
        value={skuCode || ''}
        {...prs}
      >
        <option disabled={!!skuCode}>{placeholder}</option>
        {vars}
      </select>
    )
  }
  return <Fragment>{vars}</Fragment>
}

VariantTemplate.propTypes = propTypes

export default VariantTemplate

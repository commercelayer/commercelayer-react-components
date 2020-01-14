import React, { Fragment } from 'react'
import _ from 'lodash'

export interface VariantTemplateProps {
  variants: object
  type: string
  placeholder: string
  variantLabels: string[]
  onChange: (e: string) => void // TODO: make required
  name: string
  skuCode?: string
}

export default function VariantTemplate(props: VariantTemplateProps) {
  const {
    name,
    variants,
    type,
    placeholder,
    variantLabels,
    skuCode,
    onChange
  } = props
  console.log('skuCode selected', skuCode)
  const vars = _.keys(variants).map((v, k) => {
    const checked = skuCode === v
    return type === 'select' ? (
      <option key={variants[v].id} value={variants[v].code}>
        {variantLabels.length > 0 ? variantLabels[k] : variants[v].name}
      </option>
    ) : (
      <Fragment key={variants[v].id}>
        <input
          defaultChecked={checked}
          type="radio"
          name={name}
          value={variants[v].code}
          onChange={e => onChange(e.target.value)}
        />
        {variantLabels.length > 0 ? variantLabels[k] : variants[v].name}
      </Fragment>
    )
  })
  if (type === 'select') {
    return (
      <select
        name={name}
        onChange={(e: any) => onChange(e.target.value)}
        value={skuCode}
      >
        <option>{placeholder}</option>
        {vars}
      </select>
    )
  }
  return <Fragment>{vars}</Fragment>
}

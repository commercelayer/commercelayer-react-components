import React, { Fragment, FunctionComponent } from 'react'
import _ from 'lodash'
import { GeneralComponent } from '../@types'
import { setSkuCodeInterface } from '../reducers/VariantReducer'

export interface VariantTemplateProps extends GeneralComponent {
  variants: object
  type: string
  placeholder: string
  variantLabels: string[]
  onChange: setSkuCodeInterface
  name: string
  skuCode?: string
}

const VariantTemplate: FunctionComponent<VariantTemplateProps> = props => {
  const {
    name,
    variants,
    type,
    placeholder,
    variantLabels,
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
        {variantLabels.length > 0 ? variantLabels[k] : variants[v].name}
      </option>
    ) : (
      <Fragment key={variants[v].id}>
        <input
          defaultChecked={checked}
          type="radio"
          name={name}
          value={variants[v].code}
          onChange={e => onChange(e.target.value, variants[v].id)}
          {...prs}
        />
        {variantLabels.length > 0 ? variantLabels[k] : variants[v].name}
      </Fragment>
    )
  })
  if (type === 'select') {
    return (
      <select
        name={name}
        onChange={(e: any) => {
          const v = e.target.value
          const i = e.target.selectedIndex
          const id = e.target[i].dataset.skuId
          onChange(v, id)
        }}
        value={skuCode}
        {...prs}
      >
        <option>{placeholder}</option>
        {vars}
      </select>
    )
  }
  return <Fragment>{vars}</Fragment>
}

export default VariantTemplate

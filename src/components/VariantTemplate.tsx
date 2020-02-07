import React, { Fragment, FunctionComponent } from 'react'
import _ from 'lodash'
import { GeneralComponent } from '../@types'
import { SetSkuCodeVariant } from '../reducers/VariantReducer'
import { SkuCodePropObj } from './VariantSelector'

export interface VariantTemplateProps extends GeneralComponent {
  variants: object
  type: string
  placeholder: string
  onChange: SetSkuCodeVariant
  name: string
  skuCodes: SkuCodePropObj[]
  skuCode?: string
}

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
        <option selected disabled>
          {placeholder}
        </option>
        {vars}
      </select>
    )
  }
  return <Fragment>{vars}</Fragment>
}

export default VariantTemplate

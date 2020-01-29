import React, { FunctionComponent, useContext } from 'react'
import { GeneralComponent } from '../@types/index'
import Parent from './utils/Parent'
import VariantContext from './context/VariantContext'

export interface QuantitySelectorProps extends GeneralComponent {
  min?: number
  max?: number
  defaultValue?: number
  skuCode?: string
  children?: FunctionComponent
  currentSkuInventory?: {
    available: boolean
    quantity: number
  }
}

const QuantitySelector: FunctionComponent<QuantitySelectorProps> = props => {
  const { skuCode, className, style, defaultValue, children, min, max } = props
  const {
    currentSkuCode,
    currentSkuInventory,
    setCurrentQuantity
  } = useContext(VariantContext)
  const sCode = skuCode || currentSkuCode
  const disabled = !sCode
  const handleChange = e => {
    setCurrentQuantity(e.target.value)
  }
  const maxInv = max || currentSkuInventory.quantity
  const parentProps = {
    min,
    max: maxInv,
    disabled,
    handleChange,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      style={style}
      className={className}
      type="number"
      min={min}
      max={maxInv}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
    />
  )
}

QuantitySelector.defaultProps = {
  min: 1,
  defaultValue: 1
}

export default QuantitySelector

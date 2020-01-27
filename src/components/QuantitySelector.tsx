import React, { FunctionComponent, useContext } from 'react'
import { GeneralComponent } from '../@types/index'
import Parent from './utils/Parent'
import VariantContext from './context/VariantContext'

export interface QuantitySelectorProps extends GeneralComponent {
  defaultValue?: number
  skuCode?: string
  currentSkuInventory?: {
    available: boolean
    quantity: number
  }
}

const QuantitySelector: FunctionComponent<QuantitySelectorProps> = props => {
  const { skuCode, className, style, defaultValue, children } = props
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
  // TODO: Passing right props to the children
  return children ? (
    <Parent {...props}>{children}</Parent>
  ) : (
    <input
      style={style}
      className={className}
      type="number"
      min="1"
      max={currentSkuInventory.quantity}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
    />
  )
}

QuantitySelector.defaultProps = {
  defaultValue: 1
}

export default QuantitySelector

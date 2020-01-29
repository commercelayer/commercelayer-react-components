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
  const { skuCode, children, min, max, ...p } = props
  const {
    currentSkuCode,
    currentSkuInventory,
    setCurrentQuantity
  } = useContext(VariantContext)
  const sCode = skuCode || currentSkuCode
  const disabled = !sCode
  const handleChange = (e): void => {
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
      type="number"
      max={maxInv}
      disabled={disabled}
      onChange={handleChange}
      {...p}
    />
  )
}

QuantitySelector.defaultProps = {
  min: 1,
  defaultValue: 1
}

export default QuantitySelector

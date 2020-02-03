import React, { FunctionComponent, useContext, useEffect } from 'react'
import { GeneralComponent } from '../@types/index'
import Parent from './utils/Parent'
import VariantContext from './context/VariantContext'
import OrderContext from './context/OrderContext'
import PriceContext from './context/PriceContext'
import _ from 'lodash'

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
  const { prices } = useContext(PriceContext)
  const { setSingleQuantity } = useContext(OrderContext)
  const sCode = !_.isEmpty(prices) ? prices[skuCode] : skuCode || currentSkuCode
  const disabled = !sCode
  const handleChange = (e): void => {
    const quantity = e.target.value
    if (setCurrentQuantity) {
      setCurrentQuantity(quantity)
    } else if (skuCode) {
      setSingleQuantity(skuCode, quantity)
    }
  }
  useEffect(() => {
    if (skuCode && !setCurrentQuantity) {
      setSingleQuantity(skuCode, min)
    }
  }, [])
  const maxInv = max || currentSkuInventory.quantity || 50
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

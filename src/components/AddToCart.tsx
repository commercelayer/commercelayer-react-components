import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import OrderContext from './context/OrderContext'
import VariantContext from './context/VariantContext'

// TODO: Extends interface from OrderContainer

export interface AddToCartProps {
  className?: string
  label?: string
  disabled?: boolean
  skuCode?: string
}

const AddToCart: FunctionComponent<AddToCartProps> = props => {
  const { label, className, children, skuCode } = props
  const { addToCart } = useContext(OrderContext)
  const { currentSkuCode, currentSkuId, currentQuantity } = useContext(
    VariantContext
  )
  const handleClick = () => {
    addToCart(currentSkuCode, currentSkuId, currentQuantity)
  }
  const sCode = skuCode || currentSkuCode
  const disabled = !sCode

  // TODO: passing right props to the children
  return children ? (
    <Parent {...props}>{children}</Parent>
  ) : (
    <button disabled={disabled} className={className} onClick={handleClick}>
      {label ? label : 'add to cart'}
    </button>
  )
}

export default AddToCart

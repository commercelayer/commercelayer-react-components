import React, { FunctionComponent } from 'react'
import Parent from './utils/Parent'

// TODO: Extends interface from OrderContainer

export interface AddToCartProps {
  className?: string
  label?: string
  addToCart?: (skuCode, skuId) => void
  disabled?: boolean
  skuCode?: string
  skuId?: string
  orderId?: string
}

const AddToCart: FunctionComponent<AddToCartProps> = props => {
  const { label, className, children, addToCart, skuCode, skuId } = props
  const handleClick = () => {
    addToCart(skuCode, skuId)
  }
  const disabled = !skuCode
  return children ? (
    <Parent {...props}>{children}</Parent>
  ) : (
    <button disabled={disabled} className={className} onClick={handleClick}>
      {label ? label : 'add to cart'}
    </button>
  )
}

export default AddToCart

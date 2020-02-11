import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import { BaseComponent } from '../@types/index'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'

export interface AddToCartProps extends BaseComponent {
  label?: string
  disabled?: boolean
  skuCode?: string
  children?: FunctionComponent
}

const AddToCart: FunctionComponent<AddToCartProps> = props => {
  const { label, children, skuCode, ...p } = props
  const { addToCart } = useContext(OrderContext)
  const { item, items, quantity } = useContext(ItemContext)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item)
  const handleClick = (): void => {
    const qty = quantity[sCode]
    addToCart(sCode, item[sCode]?.id, qty)
  }
  const disabled = !sCode
  const parentProps = {
    handleClick,
    disabled,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button disabled={disabled} onClick={handleClick} {...p}>
      {label ? label : 'add to cart'}
    </button>
  )
}

export default AddToCart

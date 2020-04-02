import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import { InferProps } from 'prop-types'
import components from '../config/components'

const propTypes = components.AddToCart.propTypes
const defaultProps = components.AddToCart.defaultProps
const displayName = components.AddToCart.displayName

export type AddToCartProps = InferProps<typeof propTypes> &
  JSX.IntrinsicElements['button']

const AddToCart: FunctionComponent<AddToCartProps> = props => {
  const { label, children, skuCode, disabled, ...p } = props
  const { addToCart } = useContext(OrderContext)
  const { item, items, quantity, option } = useContext(ItemContext)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item)
  const handleClick = (): void => {
    const qty = quantity[sCode]
    const opt = option[sCode]
    if (addToCart)
      addToCart({
        skuCode: sCode,
        skuId: item[sCode]?.id,
        quantity: qty,
        option: opt
      })
  }
  const autoDisabled = disabled || !sCode
  const parentProps = {
    handleClick,
    disabled,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button disabled={autoDisabled} onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

AddToCart.propTypes = propTypes
AddToCart.defaultProps = defaultProps
AddToCart.displayName = displayName

export default AddToCart

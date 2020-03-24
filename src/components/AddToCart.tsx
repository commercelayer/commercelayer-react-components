import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import PropTypes, { InferProps } from 'prop-types'

const ATCProps = {
  children: PropTypes.func,
  label: PropTypes.string,
  skuCode: PropTypes.string,
  disabled: PropTypes.bool
}

export type AddToCartProps = InferProps<typeof ATCProps> &
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
      {label ? label : 'add to cart'}
    </button>
  )
}

AddToCart.propTypes = ATCProps

export default AddToCart

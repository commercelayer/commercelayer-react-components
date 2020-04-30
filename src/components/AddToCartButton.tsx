import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import { InferProps } from 'prop-types'
import components from '../config/components'

const propTypes = components.AddToCartButton.propTypes
const defaultProps = components.AddToCartButton.defaultProps
const displayName = components.AddToCartButton.displayName

export type AddToCartButtonProps = InferProps<typeof propTypes> &
  JSX.IntrinsicElements['button']

const AddToCartButton: FunctionComponent<AddToCartButtonProps> = (props) => {
  const { label, children, skuCode, disabled, ...p } = props
  const { addToCart } = useContext(OrderContext)
  const { item, items, quantity, option, prices } = useContext(ItemContext)
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
        option: opt,
      })
  }
  const autoDisabled = disabled || !prices[sCode] || !sCode
  const parentProps = {
    handleClick,
    disabled: disabled || autoDisabled,
    label,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button disabled={autoDisabled} onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

AddToCartButton.propTypes = propTypes
AddToCartButton.defaultProps = defaultProps
AddToCartButton.displayName = displayName

export default AddToCartButton

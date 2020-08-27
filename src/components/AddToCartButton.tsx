import React, { FunctionComponent, useContext, PropsWithoutRef } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import components from '../config/components'
import { FunctionChildren } from '../typings/index'
import { AddToCartReturn } from 'reducers/OrderReducer'
import SkuListsContext from '../context/SkuListsContext'

const propTypes = components.AddToCartButton.propTypes
const defaultProps = components.AddToCartButton.defaultProps
const displayName = components.AddToCartButton.displayName

type AddToCartButtonChildrenProps = FunctionChildren<
  {
    handleClick: () => AddToCartReturn
  } & Omit<AddToCartButtonProps, 'children'> &
    PropsWithoutRef<JSX.IntrinsicElements['button']>
>

type AddToCartButtonProps = {
  children?: AddToCartButtonChildrenProps
  label?: string
  skuCode?: string
  disabled?: boolean
  skuListId?: string
} & PropsWithoutRef<JSX.IntrinsicElements['button']>

const AddToCartButton: FunctionComponent<AddToCartButtonProps> = (props) => {
  const {
    label = 'Add to cart',
    children,
    skuCode,
    disabled,
    skuListId,
    ...p
  } = props
  const { addToCart } = useContext(OrderContext)
  const {
    item,
    items,
    quantity,
    option,
    prices,
    lineItems,
    lineItem,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  const { skuLists } = useContext(SkuListsContext)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item) || (itemSkuCode as string)
  const handleClick = () => {
    const qty = quantity[sCode]
    const opt = option[sCode]
    const customLineItem = !_.isEmpty(lineItem) ? lineItem : lineItems[sCode]
    if (!_.isEmpty(skuLists) && skuListId) {
      const slQty = quantity[skuListId]
      return (
        _.has(skuLists, skuListId) &&
        skuLists[skuListId].map((skuCode) => {
          return addToCart({
            skuCode,
            quantity: slQty,
          })
        })
      )
    }
    return addToCart({
      skuCode: sCode,
      skuId: item[sCode]?.id,
      quantity: qty,
      option: opt,
      lineItem: customLineItem,
    })
  }
  console.log('skuLists button', skuLists)
  const autoDisabled = !_.isEmpty(skuLists)
    ? false
    : disabled || !prices[sCode] || !sCode
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

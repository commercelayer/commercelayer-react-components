import React, { useContext, PropsWithoutRef, ReactNode } from 'react'
import Parent from './utils/Parent'
import OrderContext from '#context/OrderContext'
import { isEmpty, has } from 'lodash'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import { AddToCartReturn } from '#reducers/OrderReducer'
import SkuListsContext from '#context/SkuListsContext'
import ExternalFunctionContext from '#context/ExternalFunctionContext'
import { VariantOption } from '#components/VariantSelector'
import isFunction from 'lodash/isFunction'
import SkuChildrenContext from '#context/SkuChildrenContext'

const propTypes = components.AddToCartButton.propTypes as any
const defaultProps = components.AddToCartButton.defaultProps
const displayName = components.AddToCartButton.displayName

type ChildrenProps = {
  handleClick: () => AddToCartReturn
} & Omit<AddToCartButtonProps, 'children'>

type AddToCartButtonChildrenProps = FunctionChildren<ChildrenProps>

export type AddToCartButtonType = ChildrenProps

type BuyNowMode =
  | {
      buyNowMode: true
      checkoutUrl?: string
    }
  | {
      buyNowMode: false
      checkoutUrl: never
    }

type AddToCartButtonProps = {
  children?: AddToCartButtonChildrenProps
  label?: string | ReactNode
  skuCode?: string
  bundleCode?: string
  disabled?: boolean
  skuListId?: string
  lineItem?: VariantOption['lineItem']
} & BuyNowMode &
  PropsWithoutRef<JSX.IntrinsicElements['button']>

const AddToCartButton: React.FunctionComponent<AddToCartButtonProps> = (
  props
) => {
  const {
    label = 'Add to cart',
    children,
    skuCode,
    bundleCode,
    disabled,
    skuListId,
    lineItem,
    buyNowMode,
    checkoutUrl,
    ...p
  } = props
  const { addToCart, orderId, getOrder, setOrderErrors } =
    useContext(OrderContext)
  const { url, callExternalFunction } = useContext(ExternalFunctionContext)
  const {
    item,
    items,
    quantity,
    option,
    prices,
    lineItems,
    lineItem: lineItemContext,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  const { skuLists } = useContext(SkuListsContext)
  const { sku } = useContext(SkuChildrenContext)
  const sCode = (
    !isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : sku?.code || skuCode || getCurrentItemKey(item) || itemSkuCode
  ) as string
  const availabilityQuantity = item[sCode]?.inventory?.quantity
  const handleClick = () => {
    const qty = quantity[sCode]
    const opt = option[sCode]
    const customLineItem = !isEmpty(lineItem || lineItemContext)
      ? lineItem || lineItemContext
      : lineItems[sCode]
    if (!isEmpty(skuLists) && skuListId && url) {
      const slQty = quantity[skuListId] || 1
      if (has(skuLists, skuListId)) {
        const lineItems =
          skuLists &&
          skuLists[skuListId].map((skuCode: string) => {
            return {
              skuCode,
              quantity: slQty,
              _update_quantity: 1,
            }
          })
        return callExternalFunction({
          url,
          data: {
            resourceType: 'orders',
            inputs: [
              {
                id: orderId,
                lineItems,
              },
            ],
          },
        })
          .then(async (res) => {
            getOrder && orderId && (await getOrder(orderId))
            return res
          })
          .catch(({ response }) => {
            setOrderErrors && setOrderErrors(response['data'])
            return response
          })
      }
    }
    return !url
      ? addToCart &&
          addToCart({
            bundleCode,
            skuCode: sCode,
            skuId: item[sCode]?.id,
            quantity: qty,
            option: opt,
            lineItem: customLineItem,
            buyNowMode,
            checkoutUrl,
          })
      : callExternalFunction({
          url,
          data: {
            bundleCode,
            skuCode: sCode,
            skuId: item[sCode]?.id,
            quantity: qty,
            option: opt,
            lineItem: customLineItem,
            buyNowMode,
            checkoutUrl,
          },
        })
          .then(async (res) => {
            getOrder && orderId && (await getOrder(orderId))
            return res
          })
          .catch(({ response }) => {
            setOrderErrors && setOrderErrors(response['data'])
            return response
          })
  }
  const autoDisabled =
    !isEmpty(skuLists) || skuListId
      ? false
      : disabled || !prices[sCode] || !sCode || availabilityQuantity === 0
  const parentProps = {
    handleClick,
    disabled: disabled || autoDisabled,
    label,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button {...p} disabled={autoDisabled} onClick={handleClick}>
      {isFunction(label) ? label() : label}
    </button>
  )
}

AddToCartButton.propTypes = propTypes
AddToCartButton.defaultProps = defaultProps
AddToCartButton.displayName = displayName

export default AddToCartButton

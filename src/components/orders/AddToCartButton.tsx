import { useContext, PropsWithoutRef } from 'react'
import Parent from '../utils/Parent'
import OrderContext from '#context/OrderContext'
import isEmpty from 'lodash/isEmpty'
import has from 'lodash/has'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import { FunctionChildren } from '#typings/index'
import { AddToCartReturn } from '#reducers/OrderReducer'
import SkuListsContext from '#context/SkuListsContext'
import ExternalFunctionContext from '#context/ExternalFunctionContext'
import { VariantOption } from '#components/skus/VariantSelector'
import isFunction from 'lodash/isFunction'
import SkuChildrenContext from '#context/SkuChildrenContext'
import getCartLink from '#utils/getCartLink'
import CommerceLayerContext from '#context/CommerceLayerContext'

type ChildrenProps = {
  handleClick: () => AddToCartReturn
} & Omit<Props, 'children'>

type AddToCartButtonChildrenProps = FunctionChildren<ChildrenProps>

export type AddToCartButtonType = ChildrenProps

type BuyNowMode =
  | {
      buyNowMode: true
      checkoutUrl?: string
    }
  | {
      buyNowMode?: false
      checkoutUrl?: never
    }

type THostedCart =
  | {
      redirectToHostedCart: true
      hostedCartUrl?: string
    }
  | {
      redirectToHostedCart?: false
      hostedCartUrl?: never
    }

type Props = {
  children?: AddToCartButtonChildrenProps
  label?: string | JSX.Element
  skuCode?: string
  bundleCode?: string
  disabled?: boolean
  skuListId?: string
  lineItem?: VariantOption['lineItem']
} & BuyNowMode &
  THostedCart &
  PropsWithoutRef<JSX.IntrinsicElements['button']>

export function AddToCartButton(props: Props): JSX.Element {
  const {
    label = 'Add to cart',
    children,
    skuCode,
    bundleCode,
    disabled,
    skuListId,
    lineItem,
    buyNowMode = false,
    checkoutUrl,
    redirectToHostedCart,
    hostedCartUrl,
    ...p
  } = props
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
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
  const [slug] = endpoint ? endpoint.split('.commercelayer') : ['']
  const sCode = (
    !isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : sku?.code || skuCode || getCurrentItemKey(item) || itemSkuCode
  ) as string
  const availabilityQuantity = item[sCode]?.inventory?.quantity
  const handleClick = async () => {
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
    if (!url && addToCart) {
      const res = await addToCart({
        bundleCode,
        skuCode: sCode,
        skuId: item[sCode]?.id,
        quantity: qty,
        option: opt,
        lineItem: customLineItem,
        buyNowMode,
        checkoutUrl,
      })
      if (redirectToHostedCart) {
        const orderId = res.orderId
        if (hostedCartUrl) {
          location.href = `https://${hostedCartUrl}/${orderId}?accessToken=${accessToken}`
        } else if (orderId && slug) {
          location.href = getCartLink({ orderId, slug, accessToken })
        }
      }
      return res
    } else if (url) {
      return callExternalFunction({
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

export default AddToCartButton

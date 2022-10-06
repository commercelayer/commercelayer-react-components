import { useContext, PropsWithoutRef } from 'react'
import Parent from '../utils/Parent'
import OrderContext from '#context/OrderContext'
import isEmpty from 'lodash/isEmpty'
import has from 'lodash/has'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import { ChildrenFunction } from '#typings/index'
import { AddToCartReturn } from '#reducers/OrderReducer'
import SkuListsContext from '#context/SkuListsContext'
import ExternalFunctionContext from '#context/ExternalFunctionContext'
import { VariantOption } from '#components/skus/VariantSelector'
import SkuChildrenContext from '#context/SkuChildrenContext'
import getCartLink from '#utils/getCartLink'
import CommerceLayerContext from '#context/CommerceLayerContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  handleClick: () => AddToCartReturn
}

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

type TButton = PropsWithoutRef<
  Omit<JSX.IntrinsicElements['button'], 'children'>
>

type Props = {
  bundleCode?: string
  children?: ChildrenFunction<ChildrenProps>
  disabled?: boolean
  label?: string | JSX.Element
  lineItem?: VariantOption['lineItem']
  quantity?: string
  skuCode?: string
  skuListId?: string
} & TButton &
  BuyNowMode &
  THostedCart

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
    quantity,
    ...p
  } = props
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const { addToCart, orderId, getOrder, setOrderErrors } =
    useContext(OrderContext)
  const { url, callExternalFunction } = useContext(ExternalFunctionContext)
  const {
    item,
    items,
    quantity: quantityCtx,
    option,
    prices,
    lineItems,
    lineItem: lineItemContext,
    skuCode: itemSkuCode
  } = useContext(ItemContext)
  if (accessToken === undefined)
    throw new Error('Cannot use `AddToCartButton` outside of `CommerceLayer`')
  if (addToCart === undefined)
    throw new Error('Cannot use `AddToCartButton` outside of `OrderContainer`')
  const { skuLists } = useContext(SkuListsContext)
  const { sku } = useContext(SkuChildrenContext)
  const [slug] = endpoint ? endpoint.split('.commercelayer') : ['']
  const sCode = (
    !isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : sku?.code || skuCode || getCurrentItemKey(item) || itemSkuCode
  ) as string
  const availabilityQuantity = item[sCode]?.inventory?.quantity
  const handleClick = async (): Promise<
    | {
        success: boolean
        orderId?: string
      }
    | Record<string, any>
    | undefined
  > => {
    const qty = quantity != null ? parseInt(quantity) : quantityCtx[sCode] ?? 1
    const opt = option[sCode]
    const customLineItem = !isEmpty(lineItem || lineItemContext)
      ? lineItem || lineItemContext
      : lineItems[sCode]
    if (!isEmpty(skuLists) && skuListId && url) {
      const slQty = quantity ?? quantityCtx[skuListId] ?? 1
      if (has(skuLists, skuListId)) {
        const lineItems = skuLists?.[skuListId]?.map((skuCode: string) => {
          return {
            skuCode,
            quantity: slQty,
            _update_quantity: 1
          }
        })
        return await callExternalFunction({
          url,
          data: {
            resourceType: 'orders',
            inputs: [
              {
                id: orderId,
                lineItems
              }
            ]
          }
        })
          .then(async (res) => {
            getOrder && orderId && (await getOrder(orderId))
            return res
          })
          .catch(({ response }) => {
            if (setOrderErrors) setOrderErrors(response.data)
            return response
          })
      }
    }
    if (!url) {
      const res = await addToCart({
        bundleCode,
        skuCode: sCode,
        skuId: item[sCode]?.id,
        quantity: qty,
        option: opt,
        lineItem: customLineItem,
        buyNowMode,
        checkoutUrl
      })
      if (redirectToHostedCart) {
        const orderId = res.orderId
        if (hostedCartUrl && orderId) {
          location.href = `https://${hostedCartUrl}/${orderId}?accessToken=${accessToken}`
        } else if (orderId && slug) {
          location.href = getCartLink({ orderId, slug, accessToken })
        }
      }
      return res
    } else if (url) {
      return await callExternalFunction({
        url,
        data: {
          bundleCode,
          skuCode: sCode,
          skuId: item[sCode]?.id,
          quantity: qty,
          option: opt,
          lineItem: customLineItem,
          buyNowMode,
          checkoutUrl
        }
      })
        .then(async (res) => {
          getOrder && orderId && (await getOrder(orderId))
          return res
        })
        .catch(({ response }) => {
          if (setOrderErrors) setOrderErrors(response.data)
          return response
        })
    }
    return undefined
  }
  const disableByCtx =
    (!isEmpty(prices) && !prices[sCode]) || availabilityQuantity === 0
  const autoDisabled =
    !isEmpty(skuLists) || skuListId
      ? false
      : (disabled || disableByCtx) ?? (!quantity || !sCode)
  const parentProps = {
    handleClick,
    disabled: disabled || autoDisabled,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      {...p}
      disabled={autoDisabled}
      onClick={() => {
        void handleClick()
      }}
    >
      {label}
    </button>
  )
}

export default AddToCartButton

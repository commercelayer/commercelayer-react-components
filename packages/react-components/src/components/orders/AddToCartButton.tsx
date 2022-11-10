import { useContext, PropsWithoutRef } from 'react'
import Parent from '../utils/Parent'
import OrderContext from '#context/OrderContext'
import { ChildrenFunction } from '#typings/index'
import {
  AddToCartReturn,
  CustomLineItem,
  LineItemOption
} from '#reducers/OrderReducer'
import SkuListsContext from '#context/SkuListsContext'
import ExternalFunctionContext from '#context/ExternalFunctionContext'
import SkuChildrenContext from '#context/SkuChildrenContext'
import getCartLink from '#utils/getCartLink'
import CommerceLayerContext from '#context/CommerceLayerContext'
import useCustomContext from '#utils/hooks/useCustomContext'

interface TAddToCartButton extends Omit<Props, 'children'> {
  handleClick: () => AddToCartReturn
}

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
  /**
   * Code of a bundle
   */
  bundleCode?: string
  children?: ChildrenFunction<TAddToCartButton>
  /**
   * Disable the cart button
   */
  disabled?: boolean
  /**
   * Label to display
   */
  label?: string | JSX.Element
  /**
   * Line item which allow you customize the cart item
   */
  lineItem?: CustomLineItem
  /**
   * Line item option to add to cart
   */
  lineItemOption?: LineItemOption
  /**
   * Quantity of the item
   */
  quantity?: string
  /**
   * SKU code to add to cart
   */
  skuCode?: string
  /**
   * SKU list to add to cart
   */
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
    skuListId,
    lineItem,
    buyNowMode = false,
    checkoutUrl,
    redirectToHostedCart,
    hostedCartUrl,
    quantity,
    lineItemOption,
    ...p
  } = props
  const { accessToken, endpoint } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: 'CommerceLayer',
    currentComponentName: 'AddToCartButton',
    key: 'accessToken'
  })
  const { addToCart, orderId, getOrder, setOrderErrors } = useCustomContext({
    context: OrderContext,
    contextComponentName: 'OrderContainer',
    currentComponentName: 'AddToCartButton',
    key: 'addToCart'
  })
  const { url, callExternalFunction } = useContext(ExternalFunctionContext)
  const { skuLists } = useContext(SkuListsContext)
  const { sku } = useContext(SkuChildrenContext)
  const [slug] = endpoint ? endpoint.split('.commercelayer') : ['']
  const sCode = sku?.code ?? skuCode
  const handleClick = async (): Promise<
    | {
        success: boolean
        orderId?: string
      }
    | Record<string, any>
    | undefined
  > => {
    const qty: number = quantity != null ? parseInt(quantity) : 1
    if (skuLists != null && skuListId && url) {
      if (skuListId in skuLists) {
        const lineItems = skuLists?.[skuListId]?.map((skuCode: string) => {
          return {
            skuCode,
            quantity: qty,
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
    if (!url && addToCart != null) {
      const res = await addToCart({
        bundleCode,
        skuCode: sCode,
        quantity: qty,
        lineItemOption,
        lineItem,
        buyNowMode,
        checkoutUrl
      })
      if (redirectToHostedCart && accessToken != null) {
        const orderId = res?.orderId
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
          quantity: qty,
          lineItemOption,
          lineItem,
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
  const parentProps = {
    handleClick,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      {...p}
      onClick={() => {
        void handleClick()
      }}
    >
      {label}
    </button>
  )
}

export default AddToCartButton

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useContext, type PropsWithoutRef, type JSX } from "react"
import Parent from "../utils/Parent"
import OrderContext from "#context/OrderContext"
import type { ChildrenFunction } from "#typings/index"
import type {
  AddToCartReturn,
  CustomLineItem,
  LineItemOption,
} from "#reducers/OrderReducer"
import SkuListsContext from "#context/SkuListsContext"
import ExternalFunctionContext from "#context/ExternalFunctionContext"
import SkuChildrenContext from "#context/SkuChildrenContext"
import { getApplicationLink } from "#utils/getApplicationLink"
import CommerceLayerContext from "#context/CommerceLayerContext"
import useCustomContext from "#utils/hooks/useCustomContext"
import { getDomain } from "#utils/getDomain"
import { publish } from "#utils/events"
import { getOrganizationConfig } from "#utils/organization"

interface TAddToCartButton extends Omit<Props, "children"> {
  handleClick: () => AddToCartReturn
}

type BuyNowMode =
  | {
      /**
       * Once item has been added, it redirects to the hosted checkout micro-frontend.
       */
      buyNowMode: true
      /**
       * If you have a self-hosted checkout, you can pass the url to redirect to it.
       */
      checkoutUrl?: string
    }
  | {
      buyNowMode?: false
      checkoutUrl?: never
    }

type THostedCart =
  | {
      /**
       * Once item has been added, it redirects to the hosted cart micro-frontend.
       */
      redirectToHostedCart: true
      /**
       * If you have a self-hosted cart, you can pass the url to redirect to it.
       */
      hostedCartUrl?: string
      /**
       * If you have a self-hosted cart, you can pass the protocol to redirect to it.
       */
      protocol?: "http" | "https"
    }
  | {
      redirectToHostedCart?: false
      hostedCartUrl?: never
      protocol?: never
    }

type TButton = PropsWithoutRef<
  Omit<JSX.IntrinsicElements["button"], "children">
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

/**
 * This component adds `line_items` to the cart (aka draft order), see the [how to create a shopping cart](https://docs.commercelayer.io/core/v/how-tos/placing-orders/shopping-cart/create-a-shopping-cart) documentation,
 * for a general understanding of the process.
 *
 * It can be used to add `skus` or `bundle` by receiving `skuCode` or `bundleCode` from props.
 * When `skuListId` is passed as prop , it will add all the `skus` in the `sku_list` to the cart.
 *
 * It's possible to select the quantity of the item to add to cart by passing the `quantity` prop.
 *
 * When this component is used inside a `<Skus>` or `<SkuList>` component, it will automatically get the `skuCode` and quantity from the context,
 * so you don't need to pass it as prop.
 *
 * It can automatically redirect to the cart page of the application using the `redirectToHostedCart` prop and optionally a `hostedCartUrl`.
 *
 * With a similar logic, you can enable a "Buy Now" experience and automatically redirect the customer to the checkout page using the `buyNowMode` prop and optionally a `checkoutUrl`.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<OrderContainer>` component.
 * </span>
 */
export function AddToCartButton(props: Props): JSX.Element {
  const {
    label = "Add to cart",
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
    protocol = "https",
    ...p
  } = props
  const { accessToken, endpoint } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: "CommerceLayer",
    currentComponentName: "AddToCartButton",
    key: "accessToken",
  })
  const { addToCart, orderId, getOrder, setOrderErrors } = useCustomContext({
    context: OrderContext,
    contextComponentName: "OrderContainer",
    currentComponentName: "AddToCartButton",
    key: "addToCart",
  })
  const { url, callExternalFunction } = useContext(ExternalFunctionContext)
  const { skuLists } = useContext(SkuListsContext)
  const { sku } = useContext(SkuChildrenContext)
  const sCode = sku?.code ?? skuCode
  const handleClick = async (): Promise<
    | {
        success: boolean
        orderId?: string
      }
    | Record<string, any>
    | undefined
  > => {
    const qty: number = quantity != null ? Number.parseInt(quantity) : 1
    if (skuLists != null && skuListId && url) {
      if (skuListId in skuLists) {
        const lineItems = skuLists?.[skuListId]?.map((skuCode: string) => {
          return {
            skuCode,
            quantity: qty,
            _update_quantity: 1,
          }
        })
        return await callExternalFunction({
          url,
          data: {
            resourceType: "orders",
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
            if (!buyNowMode) {
              publish("open-cart")
            }
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
        checkoutUrl,
      })
      if (redirectToHostedCart && accessToken != null && endpoint != null) {
        const { slug, domain } = getDomain(endpoint)
        const orderId = res?.orderId
        if (hostedCartUrl && orderId) {
          location.href = `${protocol}://${hostedCartUrl}/${orderId}?accessToken=${accessToken}`
        } else if (orderId && slug) {
          const config = await getOrganizationConfig({
            accessToken,
            endpoint,
            params: {
              orderId,
              accessToken,
              slug,
            },
          })
          location.href =
            config?.links?.cart ??
            getApplicationLink({
              orderId,
              slug,
              accessToken,
              domain,
              applicationType: "cart",
            })
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
          checkoutUrl,
        },
      })
        .then(async (res) => {
          getOrder && orderId && (await getOrder(orderId))
          if (!buyNowMode) {
            publish("open-cart")
          }
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
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      {...p}
      onClick={() => {
        handleClick()
      }}
    >
      {label}
    </button>
  )
}

export default AddToCartButton

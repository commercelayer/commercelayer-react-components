import type { Order } from "@commercelayer/sdk"
import { iframeResizer } from "iframe-resizer"
import {
  type CSSProperties,
  type JSX,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import OrderStorageContext from "#context/OrderStorageContext"
import { subscribe, unsubscribe } from "#utils/events"
import { getApplicationLink } from "#utils/getApplicationLink"
import { jwt } from "#utils/jwt"
import useCustomContext from "#utils/hooks/useCustomContext"
import { getOrganizationConfig } from "#utils/organization"

const DEFAULT_DOMAIN = "commercelayer.io"

interface IframeData {
  message:
    | {
        type: "update"
        payload?: Order
      }
    | {
        type: "close"
      }
    | {
        type: "blur"
      }
}

interface Styles {
  cart?: CSSProperties
  container?: CSSProperties
  background?: CSSProperties
  icon?: CSSProperties
  iconContainer?: CSSProperties
}

const defaultIframeStyle = {
  width: "1px",
  minWidth: "100%",
  minHeight: "100%",
  border: "none",
  paddingLeft: "20px",
  paddingRight: "20px",
} satisfies CSSProperties

const defaultContainerStyle = {
  position: "fixed",
  top: "0",
  right: "-25rem",
  height: "100%",
  width: "23rem",
  transition: "right 0.5s ease-in-out",
  pointerEvents: "none",
  overflow: "auto",
} satisfies CSSProperties

const defaultBackgroundStyle = {
  opacity: "0",
  position: "fixed",
  top: "0",
  left: "0",
  height: "100%",
  width: "100vw",
  transition: "opacity 0.5s ease-in-out",
  pointerEvents: "none",
  backgroundColor: "black",
} satisfies CSSProperties

const defaultIconStyle = {
  width: "1.25rem",
  height: "1.25rem",
} satisfies CSSProperties

const defaultIconContainer = {
  textAlign: "left",
  paddingLeft: "20px",
  paddingTop: "20px",
  background: "#ffffff",
  color: "#686E6E",
} satisfies CSSProperties

const defaultStyle = {
  cart: defaultIframeStyle,
  container: defaultContainerStyle,
  background: defaultBackgroundStyle,
  icon: defaultIconStyle,
  iconContainer: defaultIconContainer,
} satisfies Styles

interface Props
  extends Omit<JSX.IntrinsicElements["div"], "children" | "style"> {
  /**
   * The style of the cart.
   */
  style?: Styles
  /**
   * The domain of your forked application.
   */
  customDomain?: string
  /**
   * The type of the cart. Defaults to undefined.
   */
  type?: "mini"
  /**
   * If true, the cart will open when a line item is added to the order clicking the add to cart button. Defaults to false.
   * Works only with the `type` prop set to `mini`.
   */
  openAdd?: boolean
  /**
   * If true, the cart will be open. Defaults to false.
   * Works only with the `type` prop set to `mini`.
   */
  open?: boolean
  /**
   * A function that will be called when the cart is open and the background is clicked.
   * Works only with the `type` prop set to `mini`.
   */
  handleOpen?: () => void
}

/**
 * This component allows to embed the cart application in your page as an `<iframe>`.
 *
 * By default, it will be rendered as inline cart and its content will fit the available container width
 * while the height will be automatically adjusted to the content.
 *
 * Or it can work as mini cart - when `type` prop is set to `mini` - and it will be opened in a modal (popup).
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<Order>` component.
 * </span>
 *
 * <span title="Mini cart" type="info">
 * When set as `mini` cart, it requires the `<CartLink type='mini' />` component to be on the same page,
 * to show the cart when clicked. <br />
 * View the `<CartLink />` component documentation for more details and examples.
 * </span>
 *
 */
export function HostedCart({
  type,
  openAdd = false,
  style,
  open = false,
  handleOpen,
  customDomain,
  ...props
}: Props): JSX.Element | null {
  const [isOpen, setOpen] = useState(false)
  const ref = useRef<HTMLIFrameElement>(null)
  const loadedOrderIdRef = useRef<string | null>(null)
  const prevOpenRef = useRef<boolean | undefined>(undefined)
  const { accessToken } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: "CommerceLayer",
    currentComponentName: "HostedCart",
    key: "accessToken",
  })
  const { order, createOrder, getOrder } = useContext(OrderContext)
  const { persistKey } = useContext(OrderStorageContext)
  const [src, setSrc] = useState<string | undefined>()

  if (accessToken == null) return null

  const token: string = accessToken
  const slug = jwt(token).organization.slug ?? ""

  async function resolveCartUrl(orderId: string): Promise<string> {
    const config = await getOrganizationConfig({
      accessToken: token,
      params: { orderId, accessToken: token, slug },
    })
    return (
      config?.links?.cart ??
      getApplicationLink({
        slug,
        orderId,
        accessToken: token,
        domain: DEFAULT_DOMAIN,
        applicationType: "cart",
        customDomain,
      })
    )
  }

  async function setOrder(openCart?: boolean): Promise<void> {
    const orderId = localStorage.getItem(persistKey) ?? (await createOrder({}))
    if (orderId != null) {
      loadedOrderIdRef.current = orderId
      setSrc(await resolveCartUrl(order?.id ?? orderId))
      if (openCart) {
        setTimeout(() => {
          if (handleOpen != null) handleOpen()
          else setOpen(true)
        }, 300)
      }
    }
  }

  const onMessage = useCallback(
    (data: IframeData): void => {
      switch (data.message.type) {
        case "update":
          if (data.message.payload != null) {
            getOrder(data.message.payload.id)
          }
          break
        case "close":
          if (type === "mini") {
            if (handleOpen != null) handleOpen()
            else setOpen(false)
          }
          break
        case "blur":
          if (type === "mini" && isOpen) {
            ref.current?.focus()
          }
          break
      }
    },
    [type, isOpen, handleOpen, getOrder],
  )

  useEffect(() => {
    const resolvedOrderId = order?.id ?? localStorage.getItem(persistKey)
    let ignore = false
    if (open != null && prevOpenRef.current !== open) {
      prevOpenRef.current = open
      setOpen(open)
    }
    const openCartHandler = (): void => {
      window.document.body.style.overflow = "hidden"
      if (src == null && resolvedOrderId == null) {
        setOrder(true)
      } else {
        if (src != null && ref.current != null) {
          ref.current.src = src
        }
        setTimeout(() => {
          if (handleOpen != null) handleOpen()
          else setOpen(true)
        }, 300)
      }
    }
    if (openAdd && type === "mini") {
      subscribe("open-cart", openCartHandler)
    }
    if (
      src == null &&
      resolvedOrderId == null &&
      !ignore &&
      isOpen
    ) {
      setOrder()
    } else if (
      resolvedOrderId != null &&
      (src == null || loadedOrderIdRef.current !== resolvedOrderId)
    ) {
      resolveCartUrl(resolvedOrderId).then((url) => {
        if (!ignore) {
          loadedOrderIdRef.current = resolvedOrderId
          setSrc(url)
        }
      })
    }
    if (src != null && ref.current != null) {
      ref.current.src = src
    }
    return (): void => {
      ignore = true
      if (openAdd && type === "mini") {
        unsubscribe("open-cart", openCartHandler)
      }
    }
  }, [src, open, order?.id, accessToken, persistKey])

  useEffect(() => {
    if (ref.current == null) return
    iframeResizer(
      {
        checkOrigin: false,
        onMessage,
      },
      ref.current,
    )
  }, [onMessage])
  /**
   * Close the cart.
   */
  function onCloseCart(): void {
    window.document.body.style.removeProperty("overflow")
    if (handleOpen != null) handleOpen()
    else setOpen(false)
  }
  return src == null ? null : type === "mini" ? (
    <>
      <div
        aria-hidden="true"
        style={{
          ...defaultStyle.background,
          ...style?.background,
          opacity: isOpen ? "0.5" : defaultStyle.background?.opacity,
          pointerEvents: isOpen
            ? "initial"
            : defaultStyle.background?.pointerEvents,
        }}
        onClick={onCloseCart}
      />
      <div
        style={{
          ...defaultStyle.container,
          ...style?.container,
          right: isOpen ? "0" : defaultStyle.container?.right,
          pointerEvents: isOpen
            ? "initial"
            : defaultStyle.container?.pointerEvents,
        }}
        {...props}
      >
        <div style={{ ...defaultStyle.iconContainer, ...style?.iconContainer }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ ...defaultStyle.icon, ...style?.icon, cursor: "pointer" }}
            onClick={onCloseCart}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onCloseCart()
              }
            }}
            aria-label="Close cart"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <iframe
          title="Cart"
          ref={ref}
          style={{ ...defaultStyle.cart, ...style?.cart }}
          src={src}
          width="100%"
          height="100%"
        />
      </div>
    </>
  ) : (
    <iframe
      title="Cart"
      ref={ref}
      style={{ ...defaultStyle.cart, ...style?.cart }}
      src={src}
      width="100%"
      height="100%"
    />
  )
}

import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext from '#context/OrderContext'
import OrderStorageContext from '#context/OrderStorageContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'
import useCustomContext from '#utils/hooks/useCustomContext'
import { type CSSProperties, useContext, useEffect, useState, useRef, type JSX } from 'react';
import { iframeResizer } from 'iframe-resizer'
import type { Order } from '@commercelayer/sdk'
import { subscribe, unsubscribe } from '#utils/events'
import { getOrganizationConfig } from '#utils/organization'

interface IframeData {
  message:
    | {
        type: 'update'
        payload?: Order
      }
    | {
        type: 'close'
      }
    | {
        type: 'blur'
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
  width: '1px',
  minWidth: '100%',
  minHeight: '100%',
  border: 'none',
  paddingLeft: '20px',
  paddingRight: '20px'
} satisfies CSSProperties

const defaultContainerStyle = {
  position: 'fixed',
  top: '0',
  right: '-25rem',
  height: '100%',
  width: '23rem',
  transition: 'right 0.5s ease-in-out',
  // zIndex: '0',
  pointerEvents: 'none',
  overflow: 'auto'
} satisfies CSSProperties

const defaultBackgroundStyle = {
  opacity: '0',
  position: 'fixed',
  top: '0',
  left: '0',
  height: '100%',
  width: '100vw',
  transition: 'opacity 0.5s ease-in-out',
  // zIndex: '-10',
  pointerEvents: 'none',
  backgroundColor: 'black'
} satisfies CSSProperties

const defaultIconStyle = {
  width: '1.25rem',
  height: '1.25rem'
} satisfies CSSProperties

const defaultIconContainer = {
  textAlign: 'left',
  paddingLeft: '20px',
  paddingTop: '20px',
  background: '#ffffff',
  color: '#686E6E'
} satisfies CSSProperties

const defaultStyle = {
  cart: defaultIframeStyle,
  container: defaultContainerStyle,
  background: defaultBackgroundStyle,
  icon: defaultIconStyle,
  iconContainer: defaultIconContainer
} satisfies Styles

interface Props
  extends Omit<JSX.IntrinsicElements['div'], 'children' | 'style'> {
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
  type?: 'mini'
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
 * Must be a child of the `<OrderContainer>` component.
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
  const { accessToken, endpoint } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: 'CommerceLayer',
    currentComponentName: 'HostedCart',
    key: 'accessToken'
  })
  const [src, setSrc] = useState<string | undefined>()
  if (accessToken == null || endpoint == null) return null
  const { order, createOrder, getOrder } = useContext(OrderContext)
  const { persistKey } = useContext(OrderStorageContext)
  const { domain, slug } = getDomain(endpoint)
  async function setOrder(openCart?: boolean): Promise<void> {
    const orderId = localStorage.getItem(persistKey) ?? (await createOrder({}))
    if (orderId != null && accessToken && endpoint) {
      const config = await getOrganizationConfig({
        accessToken,
        endpoint,
        params: {
          orderId: order?.id,
          accessToken,
          slug
        }
      })
      setSrc(
        config?.links?.cart ??
          getApplicationLink({
            slug,
            orderId,
            accessToken,
            domain,
            applicationType: 'cart',
            customDomain
          })
      )
      if (openCart) {
        setTimeout(() => {
          if (handleOpen != null) handleOpen()
          else setOpen(true)
        }, 300)
      }
    }
  }
  function onMessage(data: IframeData): void {
    switch (data.message.type) {
      case 'update':
        if (data.message.payload != null) {
          getOrder(data.message.payload.id)
        }
        break
      case 'close':
        if (type === 'mini') {
          if (handleOpen != null) handleOpen()
          else setOpen(false)
        }
        break

      case 'blur':
        if (type === 'mini' && isOpen) {
          ref.current?.focus()
        }
        break
    }
  }
  useEffect(() => {
    const orderId = localStorage.getItem(persistKey)
    let ignore = false
    if (open != null && open !== isOpen) {
      setOpen(open)
    }
    if (openAdd && type === 'mini') {
      subscribe('open-cart', () => {
        window.document.body.style.overflow = 'hidden'
        if (src == null && order?.id == null && orderId == null) {
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
      })
    }
    if (
      src == null &&
      order?.id == null &&
      orderId == null &&
      accessToken != null &&
      !ignore &&
      isOpen
    ) {
      setOrder()
    } else if (
      src == null &&
      (order?.id != null || orderId != null) &&
      accessToken
    ) {
      getOrganizationConfig({
        accessToken,
        endpoint,
        params: {
          orderId: order?.id,
          accessToken,
          slug
        }
      }).then((config) => {
        setSrc(
          config?.links?.cart ??
            getApplicationLink({
              slug,
              orderId: order?.id ?? orderId ?? '',
              accessToken,
              domain,
              applicationType: 'cart'
            })
        )
      })
    }
    if (src != null && ref.current != null) {
      ref.current.src = src
    }
    return (): void => {
      ignore = true
      if (openAdd && type === 'mini') {
        // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
        unsubscribe('open-cart', () => {})
      }
    }
  }, [src, open, order?.id, accessToken])
  useEffect(() => {
    if (ref.current == null) return
    iframeResizer(
      {
        checkOrigin: false,
        // @ts-expect-error No types available
        onMessage
      },
      ref.current
    )
  }, [ref.current != null])
  /**
   * Close the cart.
   */
  function onCloseCart(): void {
    window.document.body.style.removeProperty('overflow')
    if (handleOpen != null) handleOpen()
    else setOpen(false)
  }
  return src == null ? null : type === 'mini' ? (
    <>
      <div
        aria-hidden='true'
        style={{
          ...defaultStyle.background,
          ...style?.background,
          opacity: isOpen ? '0.5' : defaultStyle.background?.opacity,
          pointerEvents: isOpen
            ? 'initial'
            : defaultStyle.background?.pointerEvents
        }}
        onClick={onCloseCart}
      />
      <div
        style={{
          ...defaultStyle.container,
          ...style?.container,
          right: isOpen ? '0' : defaultStyle.container?.right,
          pointerEvents: isOpen
            ? 'initial'
            : defaultStyle.container?.pointerEvents
        }}
        {...props}
      >
        <div style={{ ...defaultStyle.iconContainer, ...style?.iconContainer }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            style={{ ...defaultStyle.icon, ...style?.icon }}
            onClick={onCloseCart}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </div>
        <iframe
          title='Cart'
          ref={ref}
          style={{ ...defaultStyle.cart, ...style?.cart }}
          src={src}
          width='100%'
          height='100%'
        />
      </div>
    </>
  ) : (
    <iframe
      title='Cart'
      ref={ref}
      style={{ ...defaultStyle.cart, ...style?.cart }}
      src={src}
      width='100%'
      height='100%'
    />
  )
}

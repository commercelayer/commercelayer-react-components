import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext from '#context/OrderContext'
import OrderStorageContext from '#context/OrderStorageContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'
import useCustomContext from '#utils/hooks/useCustomContext'
import {
  type CSSProperties,
  useContext,
  useEffect,
  useState,
  useRef
} from 'react'
import { iframeResizer } from 'iframe-resizer'
import type { Order } from '@commercelayer/sdk'
import { subscribe, unsubscribe } from '#utils/events'

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
  border: 'none'
} satisfies CSSProperties

const defaultContainerStyle = {
  position: 'fixed',
  top: '0',
  right: '-25rem',
  height: '100%',
  width: '23rem',
  transition: 'right 0.5s ease-in-out',
  zIndex: '0',
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
  zIndex: '-10',
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
   * The type of the cart. Defaults to undefined.
   */
  type?: 'mini'
  /**
   * If true, the cart will open when a line item is added to the order clicking the add to cart button. Defaults to false.
   */
  openAdd?: boolean
  /**
   * The style of the cart.
   */
  style?: Styles
  /**
   * If true, the cart will be open. Defaults to false.
   */
  open?: boolean
  /**
   * A function that will be called when the cart is open and the background is clicked.
   */
  handleOpen?: () => void
  /**
   * The domain of your forked application.
   */
  customDomain?: string
}

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
  const { order, createOrder } = useContext(OrderContext)
  const { persistKey } = useContext(OrderStorageContext)
  const { domain, slug } = getDomain(endpoint)
  async function setOrder(openCart?: boolean): Promise<void> {
    const orderId = localStorage.getItem(persistKey) ?? (await createOrder({}))
    if (orderId != null && accessToken) {
      setSrc(
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
          void setOrder(true)
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
      void setOrder()
    } else if (
      src == null &&
      (order?.id != null || orderId != null) &&
      accessToken
    ) {
      setSrc(
        getApplicationLink({
          slug,
          orderId: (order?.id ?? orderId) as string,
          accessToken,
          domain,
          applicationType: 'cart'
        })
      )
    }
    if (src != null && ref.current != null) {
      ref.current.src = src
    }
    return (): void => {
      ignore = true
      if (openAdd && type === 'mini') {
        unsubscribe('open-cart', () => {})
      }
    }
  }, [src, open, order?.id, accessToken])
  useEffect(() => {
    if (ref.current == null) return
    iframeResizer(
      {
        checkOrigin: false,
        bodyPadding: '20px',
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
        style={{
          ...defaultStyle.background,
          ...style?.background,
          opacity: isOpen ? '0.5' : defaultStyle.background?.opacity,
          zIndex: isOpen ? '1' : defaultStyle.background?.zIndex
        }}
        onClick={onCloseCart}
      />
      <div
        style={{
          ...defaultStyle.container,
          ...style?.container,
          right: isOpen ? '0' : defaultStyle.container?.right,
          zIndex: isOpen ? '100' : defaultStyle.container?.zIndex
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

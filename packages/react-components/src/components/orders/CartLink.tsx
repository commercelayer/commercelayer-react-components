import { type MouseEvent, type ReactNode, useContext } from 'react'
import OrderContext from '#context/OrderContext'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'
import { publish } from '#utils/events'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * The url of the cart
   */
  href: string
  /**
   * Callback to dispatch the click event
   * @param e: MouseEvent<HTMLAnchorElement>
   * @returns Promise<void>
   */
  handleClick?: (e: MouseEvent<HTMLAnchorElement>) => Promise<void>
  /**
   * The order id
   */
  orderId?: string
  /**
   * The access token
   */
  accessToken?: string
}

interface Props extends Omit<JSX.IntrinsicElements['a'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * Label to display
   */
  label?: string | ReactNode
  /**
   * The type of the cart. Defaults to undefined. If set to 'mini', the cart will open in a modal.
   */
  type?: 'mini'
  /**
   * The domain of your forked application
   */
  customDomain?: string
}

export function CartLink(props: Props): JSX.Element | null {
  const { label, children, type, customDomain, ...p } = props
  const { order, createOrder } = useContext(OrderContext)
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  if (accessToken == null)
    throw new Error('Cannot use `CartLink` outside of `CommerceLayer`')
  if (endpoint == null)
    throw new Error('Cannot use `CartLink` outside of `CommerceLayer`')
  const { domain, slug } = getDomain(endpoint)
  const href =
    slug && order?.id
      ? getApplicationLink({
          slug,
          orderId: order?.id,
          accessToken,
          domain,
          applicationType: 'cart',
          customDomain
        })
      : ''
  const handleClick = async (
    event: MouseEvent<HTMLAnchorElement>
  ): Promise<void> => {
    event.preventDefault()
    if (type !== 'mini') {
      if (order?.id) {
        location.href = href
      } else {
        const orderId = await createOrder({})
        if (slug)
          location.href = getApplicationLink({
            slug,
            orderId,
            accessToken,
            domain,
            applicationType: 'cart',
            customDomain
          })
      }
    } else {
      publish('open-cart')
    }
  }
  const parentProps = {
    handleClick,
    label,
    href,
    orderId: order?.id,
    accessToken,
    ...p
  }
  if (!accessToken) return null
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a
      href={href}
      {...p}
      onClick={(e) => {
        void handleClick(e)
      }}
    >
      {label}
    </a>
  )
}

export default CartLink

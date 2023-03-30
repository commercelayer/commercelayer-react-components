import { type MouseEvent, type ReactNode, useContext } from 'react'
import OrderContext from '#context/OrderContext'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import getCartLink from '#utils/getCartLink'

interface ChildrenProps extends Omit<Props, 'children'> {
  href: string
  handleClick?: (e: MouseEvent<HTMLAnchorElement>) => Promise<void>
}

interface Props extends Omit<JSX.IntrinsicElements['a'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
}

export function CartLink(props: Props): JSX.Element | null {
  const { label, children, ...p } = props
  const { order, createOrder } = useContext(OrderContext)
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const [slug] = endpoint?.split('.commercelayer') ?? ''
  if (accessToken == null)
    throw new Error('Cannot use `CartLink` outside of `CommerceLayer`')
  const href =
    slug && order?.id
      ? getCartLink({ slug, orderId: order?.id, accessToken })
      : ''
  const handleClick = async (
    event: MouseEvent<HTMLAnchorElement>
  ): Promise<void> => {
    event.preventDefault()
    if (order?.id) {
      location.href = href
    } else {
      const orderId = await createOrder()
      if (slug) location.href = getCartLink({ slug, orderId, accessToken })
    }
  }
  const parentProps = {
    handleClick,
    label,
    href,
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

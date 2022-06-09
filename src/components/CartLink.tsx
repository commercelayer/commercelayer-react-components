import { MouseEvent, useContext } from 'react'
import OrderContext from '#context/OrderContext'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import getCartLink from '#utils/getCartLink'

type TChildren = FunctionChildren<
  Omit<Props, 'children'> & {
    href: string
  }
>

type Props = {
  children?: TChildren
  label?: string
} & JSX.IntrinsicElements['a']

export default function CartLink(props: Props) {
  const { label, children, ...p } = props
  const { order, createOrder } = useContext(OrderContext)
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const [slug] = endpoint.split('.commercelayer')
  const href =
    slug && order?.id
      ? getCartLink({ slug, orderId: order?.id, accessToken })
      : ''
  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (order?.id) {
      location.href = href
    } else {
      const orderId = await createOrder()
      if (slug) location.href = getCartLink({ slug, orderId, accessToken })
    }
  }
  const parentProps = {
    label,
    href,
    ...p,
  }
  if (!accessToken) return null
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} {...p} onClick={handleClick}>
      {label}
    </a>
  )
}

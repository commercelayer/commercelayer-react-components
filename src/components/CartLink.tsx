import { MouseEvent, useContext } from 'react'
import OrderContext from '#context/OrderContext'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'

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
  const href = `${slug}.stg.commercelayer.app/cart/${order?.id}?accessToken=${accessToken}`
  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (order?.id) {
      location.href = href
    } else {
      const orderId = await createOrder()
      location.href = `${slug}.stg.commercelayer.app/cart/${orderId}?accessToken=${accessToken}`
    }
  }
  const parentProps = {
    label,
    href,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} {...p} onClick={handleClick}>
      {label}
    </a>
  )
}

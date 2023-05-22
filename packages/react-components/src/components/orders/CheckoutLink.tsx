import { useContext } from 'react'
import OrderContext from '#context/OrderContext'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  checkoutUrl: string
  href: string
}

interface Props extends Omit<JSX.IntrinsicElements['a'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string
  hostedCheckout?: boolean
}

export function CheckoutLink(props: Props): JSX.Element {
  const { label, hostedCheckout = true, children, ...p } = props
  const { order } = useContext(OrderContext)
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  if (accessToken == null || endpoint == null)
    throw new Error('Cannot use `CheckoutLink` outside of `CommerceLayer`')
  const [slug] = endpoint.split('.commercelayer')
  const href =
    hostedCheckout && slug && order?.id
      ? `https://${slug}.commercelayer.app/checkout/${order.id}?accessToken=${accessToken}`
      : order?.checkout_url ?? ''
  const parentProps = {
    checkoutUrl: order?.checkout_url,
    hostedCheckout,
    label,
    href,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} {...p}>
      {label}
    </a>
  )
}

export default CheckoutLink

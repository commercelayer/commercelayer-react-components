import { useContext } from 'react'
import OrderContext from '#context/OrderContext'
import components from '#config/components'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'

const propTypes = components.CheckoutLink.propTypes
const defaultProps = components.CheckoutLink.defaultProps
const displayName = components.CheckoutLink.displayName

type CheckoutLinkChildrenProps = FunctionChildren<
  Omit<Props, 'children'> & {
    checkoutUrl: string
    href: string
  }
>

type Props = {
  children?: CheckoutLinkChildrenProps
  label?: string
  hostedCheckout?: boolean
} & JSX.IntrinsicElements['a']

export function CheckoutLink(props: Props) {
  const { label, hostedCheckout = true, children, ...p } = props
  const { order } = useContext(OrderContext)
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const [slug] = endpoint.split('.commercelayer')
  const href = hostedCheckout
    ? `${slug}.checkout.commercelayer.app/${order?.id}?accessToken=${accessToken}`
    : order?.checkout_url
  const parentProps = {
    checkoutUrl: order?.checkout_url,
    hostedCheckout,
    label,
    href,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} {...p}>
      {label}
    </a>
  )
}

CheckoutLink.propTypes = propTypes
CheckoutLink.defaultProps = defaultProps
CheckoutLink.displayName = displayName

export default CheckoutLink

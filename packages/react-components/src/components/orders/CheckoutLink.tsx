import { useContext, type JSX } from "react"
import OrderContext from "#context/OrderContext"
import Parent from "../utils/Parent"
import type { ChildrenFunction } from "#typings/index"
import CommerceLayerContext from "#context/CommerceLayerContext"
import { getApplicationLink } from "#utils/getApplicationLink"
import { getDomain } from "#utils/getDomain"
import { getOrganizationConfig } from "#utils/organization"

interface ChildrenProps extends Omit<Props, "children"> {
  checkoutUrl: string
  href: string
}

interface Props extends Omit<JSX.IntrinsicElements["a"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * Label for the checkout link
   */
  label?: string
  /**
   * Ignores `order.checkout_url` and redirects to the hosted checkout micro-frontend.
   * @default true
   */
  hostedCheckout?: boolean
}

/**
 * This component generates a link to the hosted mfe-checkout application.
 * In this way you can connect your shop application with our hosted micro-frontend.
 *
 * By default it will takes the customer to our hosted checkout micro-frontend,
 * but if `hostedCheckout` is set as `false` it will use the `checkout_url` attribute
 * found in the `order` object.
 */
export function CheckoutLink(props: Props): JSX.Element {
  const { label, hostedCheckout = true, children, onClick, ...p } = props
  const { order } = useContext(OrderContext)
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  if (accessToken == null || endpoint == null)
    throw new Error("Cannot use `CheckoutLink` outside of `CommerceLayer`")
  const { domain, slug } = getDomain(endpoint)
  const href =
    hostedCheckout && order?.id
      ? getApplicationLink({
          slug,
          orderId: order?.id,
          accessToken,
          applicationType: "checkout",
          domain,
        })
      : (order?.checkout_url ?? "")
  const parentProps = {
    checkoutUrl: order?.checkout_url,
    hostedCheckout,
    label,
    href,
    ...p,
  }
  function handleClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ): void {
    e.preventDefault()
    e.stopPropagation()
    const currentHref = e.currentTarget.href
    if (accessToken && endpoint && order?.id) {
      getOrganizationConfig({
        accessToken,
        endpoint,
        params: {
          accessToken,
          slug,
          orderId: order?.id,
        },
      }).then((config) => {
        if (config?.links?.checkout) {
          window.open(config.links.checkout, "_top")
        } else {
          window.open(currentHref, "_top")
        }
      })
    } else {
      window.open(currentHref, "_top")
    }
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} onClick={handleClick} {...p}>
      {label}
    </a>
  )
}

export default CheckoutLink

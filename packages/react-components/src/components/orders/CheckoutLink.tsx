import { type JSX, type MouseEvent, type ReactNode, useContext } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import type { ChildrenFunction } from "#typings/index"
import { getApplicationLink } from "#utils/getApplicationLink"
import { jwt } from "#utils/jwt"
import { getOrganizationConfig } from "#utils/organization"
import Parent from "../utils/Parent"

interface ChildrenProps extends Omit<Props, "children"> {
  /**
   * The `checkout_url` attribute of the order, if set
   */
  checkoutUrl: string | undefined
  /**
   * The resolved href for the checkout link
   */
  href: string
  /**
   * Callback to handle the click event with organization config resolution
   */
  handleClick: (e: MouseEvent<HTMLAnchorElement>) => Promise<void>
  /**
   * The order id
   */
  orderId?: string
  /**
   * The access token
   */
  accessToken?: string
}

interface Props extends Omit<JSX.IntrinsicElements["a"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * Label for the checkout link
   */
  label?: string | ReactNode
  /**
   * Ignores `order.checkout_url` and redirects to the hosted checkout micro-frontend.
   * @default true
   */
  hostedCheckout?: boolean
  /**
   * The domain of your forked application
   */
  customDomain?: string
}

/**
 * This component generates a link to the hosted mfe-checkout application.
 * In this way you can connect your shop application with our hosted micro-frontend.
 *
 * By default it will take the customer to our hosted checkout micro-frontend,
 * but if `hostedCheckout` is set as `false` it will use the `checkout_url` attribute
 * found in the `order` object.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<Order>` component. <br />
 * </span>
 */
export function CheckoutLink(props: Props): JSX.Element | null {
  const { label, hostedCheckout = true, children, customDomain, target, ...p } = props
  const { order } = useContext(OrderContext)
  const { accessToken } = useContext(CommerceLayerContext)
  if (accessToken == null) throw new Error("Cannot use `CheckoutLink` outside of `CommerceLayer`")
  const { organization } = jwt(accessToken)
  const slug = organization.slug
  const domain = "commercelayer.io"
  const href =
    hostedCheckout && order?.id
      ? getApplicationLink({
          slug,
          orderId: order.id,
          accessToken,
          applicationType: "checkout",
          domain,
          customDomain,
        })
      : (order?.checkout_url ?? "")

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    const currentHref = e.currentTarget.href
    if (accessToken && order?.id) {
      const config = await getOrganizationConfig({
        accessToken,
        params: {
          accessToken,
          slug,
          orderId: order.id,
        },
      })
      window.open(config?.links?.checkout ?? currentHref, target ?? "_self")
    } else {
      window.open(currentHref, target ?? "_self")
    }
  }

  const parentProps = {
    checkoutUrl: order?.checkout_url,
    hostedCheckout,
    label,
    href,
    handleClick,
    orderId: order?.id,
    accessToken,
    customDomain,
    target,
    ...p,
  }

  if (!accessToken) return null

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} onClick={handleClick} target={target} rel="noreferrer" {...p}>
      {label}
    </a>
  )
}

export default CheckoutLink

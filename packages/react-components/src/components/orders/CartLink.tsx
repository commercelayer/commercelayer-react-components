import { type JSX, type MouseEvent, type ReactNode, useContext } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import type { ChildrenFunction } from "#typings/index"
import { publish } from "#utils/events"
import { getApplicationLink } from "#utils/getApplicationLink"
import { jwt } from "#utils/jwt"
import { getOrganizationConfig } from "#utils/organization"
import Parent from "../utils/Parent"

const DEFAULT_DOMAIN = "commercelayer.io"

interface ChildrenProps extends Omit<Props, "children"> {
  /**
   * The resolved href for the cart link
   */
  href: string | undefined
  /**
   * Callback to dispatch the click event
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
   * Label to display
   */
  label?: string | ReactNode
  /**
   * The type of the cart. Defaults to undefined. If set to 'mini', the cart will open in a modal.
   */
  type?: "mini"
  /**
   * The domain of your forked application
   */
  customDomain?: string
}

/**
 * This component generates a link to the hosted mfe-cart application.
 * In this way you can connect your shop application with our hosted micro-frontend.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<Order>` component. <br />
 * </span>
 */
export function CartLink(props: Props): JSX.Element | null {
  const { label, children, type, customDomain, target, ...p } = props
  const { order, createOrder } = useContext(OrderContext)
  const { accessToken } = useContext(CommerceLayerContext)
  if (accessToken == null) throw new Error("Cannot use `CartLink` outside of `CommerceLayer`")
  const token: string = accessToken
  const { organization } = jwt(token)
  const slug = organization.slug
  const href =
    slug && order?.id
      ? getApplicationLink({
          slug,
          orderId: order.id,
          accessToken: token,
          domain: DEFAULT_DOMAIN,
          applicationType: "cart",
          customDomain,
        })
      : undefined

  async function resolveCartUrl(orderId: string): Promise<string> {
    const config = await getOrganizationConfig({
      accessToken: token,
      params: { orderId, accessToken: token, slug },
    })
    return (
      config?.links?.cart ??
      getApplicationLink({
        slug,
        orderId,
        accessToken: token,
        domain: DEFAULT_DOMAIN,
        applicationType: "cart",
        customDomain,
      })
    )
  }

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>): Promise<void> => {
    event.preventDefault()
    event.stopPropagation()
    if (type === "mini") {
      publish("open-cart")
      return
    }
    const orderId = order?.id ?? (await createOrder({}))
    if (orderId) {
      window.open(await resolveCartUrl(orderId), target ?? "_self")
    }
  }

  const parentProps = {
    handleClick,
    label,
    href,
    orderId: order?.id,
    accessToken: token,
    type,
    customDomain,
    target,
    ...p,
  }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a href={href} onClick={handleClick} target={target} rel="noreferrer" {...p}>
      {label}
    </a>
  )
}

export default CartLink

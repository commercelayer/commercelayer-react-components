import { useContext, useEffect, useState, type JSX } from "react"
import Parent from "../utils/Parent"
import type { ChildrenFunction } from "#typings/index"
import CommerceLayerContext from "#context/CommerceLayerContext"
import { getApplicationLink } from "#utils/getApplicationLink"
import { jwt } from "#utils/jwt"
import { getOrganizationConfig } from "#utils/organization"

interface ChildrenProps extends Omit<Props, "children"> {
  /**
   * The link href
   */
  href: string
  /**
   * The link status
   */
  disabled: boolean
}

interface Props extends Omit<JSX.IntrinsicElements["a"], "children"> {
  /**
   * A render function to render your own custom component
   */
  children?: ChildrenFunction<ChildrenProps>
  /**
   * The label of the link
   */
  label?: string | JSX.Element
  /**
   * The domain of your forked application
   */
  customDomain?: string
  /**
   * The return URL used by My Account to render the "back to store" link and the logout redirect.
   * @link https://github.com/commercelayer/mfe-my-account?tab=readme-ov-file#back-to-shop-and-logout
   */
  returnUrl?: string
}

/**
 * This component generates a link to the hosted mfe-my-account application.
 * In this way you can connect your shop application with our hosted micro-frontend and let your customers manage their account with zero code.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<CustomerContainer>` component. <br />
 * </span>
 *
 * @link https://github.com/commercelayer/mfe-my-account
 */
export function MyAccountLink(props: Props): JSX.Element {
  const { label = "Go to my account", children, customDomain, returnUrl, ...p } = props
  const { accessToken } = useContext(CommerceLayerContext)
  const [href, setHref] = useState<string | undefined>(undefined)
  if (accessToken == null) throw new Error("Cannot use `MyAccountLink` outside of `CommerceLayer`")
  const disabled = !("owner" in jwt(accessToken))
  useEffect(() => {
    if (accessToken) {
      const { organization } = jwt(accessToken)
      const slug = organization.slug
      const domain = "commercelayer.io"
      getOrganizationConfig({
        accessToken,
        params: {
          accessToken,
          slug,
          returnUrl,
        },
      }).then((config) => {
        if (config?.links?.my_account) {
          setHref(config.links.my_account)
        } else {
          setHref(
            getApplicationLink({
              slug,
              accessToken,
              applicationType: "my-account",
              domain,
              customDomain,
              returnUrl,
            })
          )
        }
      })
    }
    return () => {
      setHref(undefined)
    }
  }, [accessToken, returnUrl, customDomain])
  const parentProps = {
    disabled,
    label,
    href,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a aria-disabled={disabled} href={href} {...p}>
      {label}
    </a>
  )
}

export default MyAccountLink

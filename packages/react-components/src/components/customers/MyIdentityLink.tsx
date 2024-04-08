import { useContext, useEffect, useState } from 'react'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'
import { getOrganizationConfig } from '#utils/organization'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * The link href
   */
  href: string
}

interface Props extends Omit<JSX.IntrinsicElements['a'], 'children'> {
  /**
   * A render function to render your own custom component
   */
  children?: ChildrenFunction<ChildrenProps>
  /**
   * The label of the link
   */
  label: string | JSX.Element
  /**
   * The type of the link
   */
  type: 'login' | 'signup'
  /**
   * The client id of the Commerce Layer application
   */
  clientId: string
  /**
   * The scope of the Commerce Layer application
   */
  scope: string
  /**
   * The return url to redirect the user after the login/signup
   */
  returnUrl?: string
  /**
   * The domain of your forked application
   */
  customDomain?: string
}

/**
 * This component generates a link to the hosted mfe-identity application.
 *
 * In this way you can connect your shop application with our hosted micro-frontend and let your customers manage their account with zero code.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 *
 * <span title="My Identity" type="info">
 * The Commerce Layer Identity micro frontend (React) provides you with an application, powered by Commerce Layer APIs, handling customer login and sign-up functionalities
 * </span>
 *
 * @link https://github.com/commercelayer/mfe-identity
 */
export function MyIdentityLink(props: Props): JSX.Element {
  const {
    label,
    children,
    type,
    clientId,
    scope,
    returnUrl,
    customDomain,
    ...p
  } = props
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const [href, setHref] = useState<string | undefined>(undefined)
  if (accessToken == null || endpoint == null)
    throw new Error('Cannot use `MyIdentityLink` outside of `CommerceLayer`')
  const { domain, slug } = getDomain(endpoint)
  useEffect(() => {
    void getOrganizationConfig({
      accessToken,
      endpoint,
      params: {
        accessToken
      }
    }).then((config) => {
      if (config?.links?.identity) {
        setHref(config.links.identity)
      } else {
        const link = getApplicationLink({
          slug,
          accessToken,
          applicationType: 'identity',
          domain,
          modeType: type,
          clientId,
          scope,
          returnUrl: returnUrl ?? window.location.href,
          customDomain
        })
        setHref(link)
      }
    })
    return () => {
      setHref(undefined)
    }
  }, [])

  const parentProps = {
    label,
    href,
    clientId,
    scope,
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

export default MyIdentityLink

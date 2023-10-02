import { useContext } from 'react'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'

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
  if (accessToken == null || endpoint == null)
    throw new Error('Cannot use `MyIdentityLink` outside of `CommerceLayer`')
  const { domain, slug } = getDomain(endpoint)
  const href = getApplicationLink({
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

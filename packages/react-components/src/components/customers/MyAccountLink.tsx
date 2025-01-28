import { useContext, type JSX } from 'react';
import Parent from '../utils/Parent'
import type { ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'
import { jwt } from '#utils/jwt'
import { getOrganizationConfig } from '#utils/organization'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * The link href
   */
  href: string
  /**
   * The link status
   */
  disabled: boolean
}

interface Props extends Omit<JSX.IntrinsicElements['a'], 'children'> {
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
  const { label = 'Go to my account', children, customDomain, ...p } = props
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  if (accessToken == null || endpoint == null)
    throw new Error('Cannot use `MyAccountLink` outside of `CommerceLayer`')
  const { domain, slug } = getDomain(endpoint)
  const disabled = !('owner' in jwt(accessToken))
  const href = getApplicationLink({
    slug,
    accessToken,
    applicationType: 'my-account',
    domain,
    customDomain
  })
  const parentProps = {
    disabled,
    label,
    href,
    ...p
  }
  function handleClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void {
    if (!disabled && accessToken && endpoint) {
      getOrganizationConfig({
        accessToken,
        endpoint,
        params: {
          accessToken,
          slug
        }
      }).then((config) => {
        if (config?.links?.my_account) {
          e.preventDefault()
          location.href = config.links.my_account
        }
      })
    }
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a aria-disabled={disabled} onClick={handleClick} href={href} {...p}>
      {label}
    </a>
  )
}

export default MyAccountLink

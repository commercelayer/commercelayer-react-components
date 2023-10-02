import { useContext } from 'react'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { getApplicationLink } from '#utils/getApplicationLink'
import { getDomain } from '#utils/getDomain'
import jwt from '#utils/jwt'

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
    if (disabled) e.preventDefault()
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

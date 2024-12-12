import CommerceLayerContext from '#context/CommerceLayerContext'
import ErrorBoundary from '#components/utils/ErrorBoundary'
import type { DefaultChildrenType } from '#typings/globals'
import { jwt } from '#utils/jwt'

import type { JSX } from "react";

interface Props {
  /**
   * Accept a React node as children.
   */
  children: DefaultChildrenType
  /**
   * The access token to authenticate the API calls.
   */
  accessToken: string
  /**
   * The endpoint to make the API calls. e.g. https://yourdomain.commercelayer.io
   */
  endpoint?: string
  /**
   * The domain to make the API calls. e.g. commercelayer.io
   */
  domain?: string
}

/**
 * CommerceLayer component
 */
export function CommerceLayer(props: Props): JSX.Element {
  const { children, ...p } = props
  if (!p.endpoint) {
    const { organization } = jwt(p.accessToken)
    p.endpoint = `https://${organization.slug}.${
      p.domain ?? 'commercelayer.io'
    }`
  }
  return (
    <ErrorBoundary>
      <CommerceLayerContext.Provider value={{ ...p }}>
        {children}
      </CommerceLayerContext.Provider>
    </ErrorBoundary>
  )
}

export default CommerceLayer

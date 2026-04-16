import type { InterceptorManager } from '@commercelayer/core'
import CommerceLayerContext from '#context/CommerceLayerContext'
import ErrorBoundary from '#components/utils/ErrorBoundary'
import type { DefaultChildrenType } from '#typings/globals'

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
   * Optional interceptors to attach to the underlying SDK client.
   */
  interceptors?: InterceptorManager
}

/**
 * CommerceLayer component
 */
export function CommerceLayer({ children, accessToken, interceptors }: Props): JSX.Element {
  return (
    <ErrorBoundary>
      <CommerceLayerContext.Provider value={{ accessToken, interceptors }}>
        {children}
      </CommerceLayerContext.Provider>
    </ErrorBoundary>
  )
}

export default CommerceLayer

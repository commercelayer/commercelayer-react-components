import type { InterceptorManager } from "@commercelayer/core-components"
import { type JSX, useMemo } from "react"
import ErrorBoundary from "#components/utils/ErrorBoundary"
import CommerceLayerContext from "#context/CommerceLayerContext"
import type { DefaultChildrenType } from "#typings/globals"

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
  // This provider wraps the whole app, so an object literal here gives every
  // consumer a new context value on every render of this component — including
  // consumers that put values from this context in effect dependency arrays.
  const value = useMemo(() => ({ accessToken, interceptors }), [accessToken, interceptors])

  return (
    <ErrorBoundary>
      <CommerceLayerContext.Provider value={value}>
        {children}
      </CommerceLayerContext.Provider>
    </ErrorBoundary>
  )
}

export default CommerceLayer

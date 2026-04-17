import type { InterceptorManager } from "@commercelayer/core"
import type { JSX } from "react"
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
export function CommerceLayer({
  children,
  accessToken,
  interceptors,
}: Props): JSX.Element {
  return (
    <ErrorBoundary>
      <CommerceLayerContext.Provider value={{ accessToken, interceptors }}>
        {children}
      </CommerceLayerContext.Provider>
    </ErrorBoundary>
  )
}

export default CommerceLayer

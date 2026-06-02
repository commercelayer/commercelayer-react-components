import { type JSX, useEffect } from "react"
import Shipments from "#components/shipments/Shipments"
import type { DefaultChildrenType } from "#typings/globals"
import type { LoaderType } from "#typings"

interface Props {
  children: DefaultChildrenType
  /**
   * @deprecated Forwarded to `<Shipments loader>` for backwards compatibility.
   */
  loader?: LoaderType
}

/**
 * @deprecated Use `<Shipments>` instead. `ShipmentsContainer` will be removed in a future major version.
 *
 * @example Migration:
 * ```tsx
 * // Before (deprecated)
 * <ShipmentsContainer>…</ShipmentsContainer>
 *
 * // After
 * <Shipments>…</Shipments>
 * ```
 */
export function ShipmentsContainer({ children, loader }: Props): JSX.Element {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ShipmentsContainer] is deprecated. Use <Shipments> instead.")
    }
  }, [])
  return <Shipments loader={loader}>{children}</Shipments>
}

export default ShipmentsContainer


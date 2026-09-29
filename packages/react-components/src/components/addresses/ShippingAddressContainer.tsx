import { type JSX, useEffect } from "react"
import ShippingAddress from "#components/addresses/ShippingAddress"
import type { DefaultChildrenType } from "#typings/globals"
import { useDeprecatedContainer } from "#utils/useDeprecatedContainer"

interface Props {
  children: DefaultChildrenType
}

/**
 * @deprecated Use `<ShippingAddress>` instead. `ShippingAddressContainer` will be removed in a future major version.
 *
 * @example Migration:
 * ```tsx
 * // Before (deprecated)
 * <ShippingAddressContainer>…</ShippingAddressContainer>
 *
 * // After
 * <ShippingAddress>…</ShippingAddress>
 * ```
 */
export function ShippingAddressContainer({ children }: Props): JSX.Element {
  useDeprecatedContainer("ShippingAddressContainer", "`<ShippingAddress>`")
  return <ShippingAddress>{children}</ShippingAddress>
}

export default ShippingAddressContainer

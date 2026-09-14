import { type JSX, useEffect } from "react"
import BillingAddress from "#components/addresses/BillingAddress"
import type { DefaultChildrenType } from "#typings/globals"
import { useDeprecatedContainer } from "#utils/useDeprecatedContainer"

interface Props {
  children: DefaultChildrenType
}

/**
 * @deprecated Use `<BillingAddress>` instead. `BillingAddressContainer` will be removed in a future major version.
 *
 * @example Migration:
 * ```tsx
 * // Before (deprecated)
 * <BillingAddressContainer>…</BillingAddressContainer>
 *
 * // After
 * <BillingAddress>…</BillingAddress>
 * ```
 */
export function BillingAddressContainer({ children }: Props): JSX.Element {
  useDeprecatedContainer("BillingAddressContainer", "`<BillingAddress>`")
  return <BillingAddress>{children}</BillingAddress>
}

export default BillingAddressContainer

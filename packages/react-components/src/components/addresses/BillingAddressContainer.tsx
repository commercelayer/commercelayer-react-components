import { type JSX, type ReactNode, useEffect } from "react"
import BillingAddress from "#components/addresses/BillingAddress"

interface Props {
  children: ReactNode
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
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[BillingAddressContainer] is deprecated. Use <BillingAddress> instead.")
    }
  }, [])
  return <BillingAddress>{children}</BillingAddress>
}

export default BillingAddressContainer

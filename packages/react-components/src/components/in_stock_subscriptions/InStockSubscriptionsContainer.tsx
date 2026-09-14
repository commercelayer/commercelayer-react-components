import { type JSX, useEffect } from "react"
import InStockSubscriptions from "#components/in_stock_subscriptions/InStockSubscriptions"
import type { DefaultChildrenType } from "#typings/globals"
import { useDeprecatedContainer } from "#utils/useDeprecatedContainer"

interface Props {
  /**
   * The children of the component.
   */
  children: DefaultChildrenType
}

/**
 * @deprecated Use `<InStockSubscriptions>` instead. `InStockSubscriptionsContainer` will be removed in a future major version.
 *
 * @example Migration:
 * ```tsx
 * // Before (deprecated)
 * <InStockSubscriptionsContainer>…</InStockSubscriptionsContainer>
 *
 * // After
 * <InStockSubscriptions>…</InStockSubscriptions>
 * ```
 */
export function InStockSubscriptionsContainer({ children }: Props): JSX.Element {
  useDeprecatedContainer("InStockSubscriptionsContainer", "`<InStockSubscriptions>`")
  return <InStockSubscriptions>{children}</InStockSubscriptions>
}

export default InStockSubscriptionsContainer

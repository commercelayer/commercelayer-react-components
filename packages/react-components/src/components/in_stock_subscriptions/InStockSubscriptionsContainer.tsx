import { type JSX, useEffect } from "react"
import InStockSubscriptions from "#components/in_stock_subscriptions/InStockSubscriptions"
import type { DefaultChildrenType } from "#typings/globals"

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
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[InStockSubscriptionsContainer] is deprecated. Use <InStockSubscriptions> instead."
      )
    }
  }, [])
  return <InStockSubscriptions>{children}</InStockSubscriptions>
}

export default InStockSubscriptionsContainer

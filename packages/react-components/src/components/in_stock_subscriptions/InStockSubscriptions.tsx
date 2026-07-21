import { useInStockSubscriptions } from "@commercelayer/react-hooks-components"
import { type JSX, useCallback, useContext, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import InStockSubscriptionContext, {
  type InitialInStockSubscriptionContext,
} from "#context/InStockSubscriptionContext"
import type { BaseError } from "#typings/errors"
import type { DefaultChildrenType } from "#typings/globals"
import getErrors from "#utils/getErrors"

interface Props {
  /**
   * The children of the component.
   */
  children: DefaultChildrenType
}

export function InStockSubscriptions({ children }: Props): JSX.Element {
  const { accessToken } = useContext(CommerceLayerContext)
  const { setInStockSubscription: hookSetInStockSubscription } = useInStockSubscriptions({
    accessToken,
  })
  const [errors, setErrors] = useState<BaseError[]>([])

  const setInStockSubscription = useCallback(
    async ({
      customerEmail,
      skuCode,
    }: {
      customerEmail?: string
      skuCode: string
    }): Promise<{ success: boolean }> => {
      try {
        await hookSetInStockSubscription({ customerEmail, skuCode })
        setErrors([])
        return { success: true }
      } catch (error) {
        // biome-ignore lint/suspicious/noExplicitAny: error is unknown, cast to TAPIError for getErrors
        const errs = getErrors({ error: error as any, resource: "in_stock_subscriptions" })
        setErrors(errs ?? [])
        return { success: false }
      }
    },
    [hookSetInStockSubscription]
  )

  const value: InitialInStockSubscriptionContext = {
    errors,
    setInStockSubscription,
  }

  return (
    <InStockSubscriptionContext.Provider value={value}>
      {children}
    </InStockSubscriptionContext.Provider>
  )
}

export default InStockSubscriptions

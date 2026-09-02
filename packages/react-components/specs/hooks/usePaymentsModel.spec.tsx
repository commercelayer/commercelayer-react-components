import type { Order } from "@commercelayer/sdk"
import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { usePaymentsModel } from "#hooks/usePaymentsModel"

function wrapper(order?: Partial<Order> | null) {
  return ({ children }: { children: ReactNode }) => (
    <OrderContext.Provider value={{ ...defaultOrderContext, order: order ?? undefined } as never}>
      {children}
    </OrderContext.Provider>
  )
}

const SETTING = { id: "ps-1", type: "payment_setting_manuals" }
const METHOD = { id: "pm-1", payment_source_type: "stripe_payments" }

// The derivation rules themselves are covered by getPaymentsModel's own spec
// in core-components. What is left to prove here is the binding: that the hook
// reads OrderContext and reports what that function says.
describe("usePaymentsModel", () => {
  it("is undetermined until the order has loaded", () => {
    const { result } = renderHook(() => usePaymentsModel(), { wrapper: wrapper(null) })
    expect(result.current).toBe("undetermined")
  })

  it("reports the model of the order in context", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({ id: "order-1", available_payment_settings: [SETTING] } as never),
    })
    expect(result.current).toBe("payment_sessions")
  })

  it("applies the precedence rule through the shared function", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({
        id: "order-1",
        available_payment_settings: [SETTING],
        available_payment_methods: [METHOD],
      } as never),
    })
    expect(result.current).toBe("payment_sessions")
  })
})

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

describe("usePaymentsModel", () => {
  it("is undetermined until the order has loaded", () => {
    const { result } = renderHook(() => usePaymentsModel(), { wrapper: wrapper(null) })
    expect(result.current).toBe("undetermined")
  })

  it("reads payment_sessions from available_payment_settings", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({ id: "order-1", available_payment_settings: [SETTING] } as never),
    })
    expect(result.current).toBe("payment_sessions")
  })

  it("reads payment_source from available_payment_methods", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({ id: "order-1", available_payment_methods: [METHOD] } as never),
    })
    expect(result.current).toBe("payment_source")
  })

  // API version 2026-05 is additive, so both arrays can arrive together. The
  // newer model wins, and the precedence lives here rather than in the app.
  it("prefers payment_sessions when the order carries both", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({
        id: "order-1",
        available_payment_settings: [SETTING],
        available_payment_methods: [METHOD],
      } as never),
    })
    expect(result.current).toBe("payment_sessions")
  })

  // An empty array is not a model: an order that simply has nothing configured
  // must not be routed to either tree.
  it("is undetermined when both arrays are empty", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({
        id: "order-1",
        available_payment_settings: [],
        available_payment_methods: [],
      } as never),
    })
    expect(result.current).toBe("undetermined")
  })

  it("is undetermined when the order carries neither relationship", () => {
    const { result } = renderHook(() => usePaymentsModel(), {
      wrapper: wrapper({ id: "order-1" } as never),
    })
    expect(result.current).toBe("undetermined")
  })
})

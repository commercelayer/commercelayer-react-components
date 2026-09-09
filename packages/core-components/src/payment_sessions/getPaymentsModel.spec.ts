import type { Order } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { getPaymentsModel } from "./getPaymentsModel"

const SETTING = { id: "ps-1", type: "payment_setting_manuals" }
const METHOD = { id: "pm-1", payment_source_type: "stripe_payments" }

function order(overrides: Partial<Order> = {}): Order {
  return { id: "order-1", type: "orders", ...overrides } as Order
}

describe("getPaymentsModel", () => {
  it("is undetermined without an order", () => {
    expect(getPaymentsModel(undefined)).toBe("undetermined")
    expect(getPaymentsModel(null)).toBe("undetermined")
  })

  it("reads payment_sessions from available_payment_settings", () => {
    expect(getPaymentsModel(order({ available_payment_settings: [SETTING] } as never))).toBe(
      "payment_sessions"
    )
  })

  it("reads payment_source from available_payment_methods", () => {
    expect(getPaymentsModel(order({ available_payment_methods: [METHOD] } as never))).toBe(
      "payment_source"
    )
  })

  // 2026-05 is additive, so both arrays can arrive together. The newer model
  // wins, and that precedence belongs to the library, not to its consumers.
  it("prefers payment_sessions when the order carries both", () => {
    expect(
      getPaymentsModel(
        order({
          available_payment_settings: [SETTING],
          available_payment_methods: [METHOD],
        } as never)
      )
    ).toBe("payment_sessions")
  })

  // An empty array is not a model: an order with nothing configured must not
  // be routed to either tree.
  it("is undetermined when both arrays are empty", () => {
    expect(
      getPaymentsModel(
        order({ available_payment_settings: [], available_payment_methods: [] } as never)
      )
    ).toBe("undetermined")
  })

  it("is undetermined when the order carries neither relationship", () => {
    expect(getPaymentsModel(order())).toBe("undetermined")
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest"
import { setPaymentSource } from "#reducers/PaymentMethodReducer"

const stripeCreate = vi.fn()
const wireCreate = vi.fn()

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn(() => ({
      orders: { relationship: vi.fn().mockReturnValue({}) },
      stripe_payments: { create: stripeCreate },
      wire_transfers: { create: wireCreate },
    })),
  }
})

// biome-ignore lint/suspicious/noExplicitAny: test cast
const CONFIG: any = { accessToken: "test-token" }
// biome-ignore lint/suspicious/noExplicitAny: test cast
const ORDER: any = { id: "order-1", status: "pending", payment_source: null }

function createParams(overrides: Record<string, unknown> = {}) {
  return {
    config: CONFIG,
    order: ORDER,
    paymentResource: "stripe_payments",
    dispatch: vi.fn(),
    getOrder: vi.fn().mockResolvedValue(ORDER),
    ...overrides,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
  } as any
}

beforeEach(() => {
  stripeCreate.mockReset().mockResolvedValue({ id: "sp-1", type: "stripe_payments" })
  wireCreate.mockReset().mockResolvedValue({ id: "wt-1", type: "wire_transfers" })
})

describe("setPaymentSource request coalescing", () => {
  it("fires a single create for two concurrent calls with the same key", async () => {
    const [first, second] = await Promise.all([
      setPaymentSource(createParams()),
      setPaymentSource(createParams()),
    ])

    expect(stripeCreate).toHaveBeenCalledTimes(1)
    // both callers resolve to the same coalesced payment source
    expect(first).toEqual({ id: "sp-1", type: "stripe_payments" })
    expect(second).toEqual(first)
  })

  it("creates again for a sequential call after the first settles (coalescing, not memoization)", async () => {
    await setPaymentSource(createParams())
    await setPaymentSource(createParams())

    expect(stripeCreate).toHaveBeenCalledTimes(2)
  })

  it("does not coalesce concurrent calls with different keys (different resource)", async () => {
    await Promise.all([
      setPaymentSource(createParams({ paymentResource: "stripe_payments" })),
      setPaymentSource(createParams({ paymentResource: "wire_transfers" })),
    ])

    expect(stripeCreate).toHaveBeenCalledTimes(1)
    expect(wireCreate).toHaveBeenCalledTimes(1)
  })

  it("fires a single order PATCH for two concurrent saved-source calls", async () => {
    const updateOrder = vi.fn().mockResolvedValue({
      order: { id: "order-1", payment_source: { id: "cps-1" } },
    })
    const params = createParams({ customerPaymentSourceId: "cps-1", updateOrder })

    await Promise.all([setPaymentSource(params), setPaymentSource(params)])

    expect(updateOrder).toHaveBeenCalledTimes(1)
    expect(stripeCreate).not.toHaveBeenCalled()
  })
})

describe("setPaymentSource when the payment session expired", () => {
  it("returns undefined and clears the payment source instead of reporting a balance", async () => {
    const expired = Object.assign(new Error("expired"), {
      errors: [
        {
          code: "VALIDATION_ERROR",
          status: "422",
          title: "is expired",
          detail: "order_data - is expired",
          meta: { error: "expired" },
        },
      ],
    })
    stripeCreate.mockRejectedValueOnce(expired)
    const dispatch = vi.fn()

    const result = await setPaymentSource(
      createParams({
        dispatch,
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        order: { id: "order-1", status: "pending", payment_source: { id: "sp-1" } } as any,
      }),
    )

    // The caller must be able to tell "the call failed" from "the card is empty":
    // AdyenPayment used to read `undefined?.balance ?? 0` as a zero balance and told
    // the shopper to find another gift card.
    expect(result).toBeUndefined()
    expect(dispatch).toHaveBeenCalledWith({
      type: "setPaymentSource",
      payload: { paymentSource: undefined },
    })
  })
})

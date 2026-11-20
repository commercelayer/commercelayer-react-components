import { beforeEach, describe, expect, it, vi } from "vitest"
import { setPaymentMethod, setPaymentSource } from "#reducers/PaymentMethodReducer"

const stripeCreate = vi.fn()
const wireCreate = vi.fn()

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn(() => ({
      orders: { relationship: vi.fn().mockReturnValue({}) },
      payment_methods: { relationship: vi.fn((id: string) => ({ id })) },
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

describe("setPaymentSource after a create has just settled", () => {
  // Two components create the payment source of a single-method order: <PaymentMethod>
  // auto-selecting it and <PaymentGateway> reconciling it. The second one acted on an
  // order read before the first create — still no payment source — a few hundred ms
  // after that create settled, past the in-flight coalescing: two payment sources, and
  // with checkout.com two payment sessions while the order points at only one.
  const BEFORE = "2026-10-26T10:00:00.000Z"
  const AFTER = "2026-10-26T10:00:01.000Z"
  const LATER = "2026-10-26T10:00:05.000Z"

  function orderAt(id: string, updatedAt: string, paymentSource: unknown = null) {
    return { id, status: "pending", updated_at: updatedAt, payment_source: paymentSource }
  }

  it("hands a caller whose order predates the create the source it created", async () => {
    // Kills: forgetting the create as soon as it settles.
    const readBack = orderAt("order-stale", AFTER, { id: "sp-1" })
    await setPaymentSource(
      createParams({
        order: orderAt("order-stale", BEFORE),
        getOrder: vi.fn().mockResolvedValue(readBack),
      })
    )
    const dispatch = vi.fn()

    const result = await setPaymentSource(
      createParams({ order: orderAt("order-stale", BEFORE), dispatch })
    )

    expect(stripeCreate).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ id: "sp-1", type: "stripe_payments" })
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "setPaymentSource",
        payload: expect.objectContaining({
          paymentSource: { id: "sp-1", type: "stripe_payments" },
        }),
      })
    )
  })

  it("creates again once the order has moved on and lost its payment source", async () => {
    // A coupon drops the payment source server-side: that is a legitimate re-create.
    await setPaymentSource(
      createParams({
        order: orderAt("order-moved", BEFORE),
        getOrder: vi.fn().mockResolvedValue(orderAt("order-moved", AFTER, { id: "sp-1" })),
      })
    )

    await setPaymentSource(createParams({ order: orderAt("order-moved", LATER) }))

    expect(stripeCreate).toHaveBeenCalledTimes(2)
  })

  it("recreates a mismatched payment source whatever the revision", async () => {
    await setPaymentSource(
      createParams({
        order: orderAt("order-mismatch", BEFORE),
        getOrder: vi.fn().mockResolvedValue(orderAt("order-mismatch", AFTER, { id: "sp-1" })),
      })
    )

    await setPaymentSource(
      createParams({
        order: orderAt("order-mismatch", BEFORE, { id: "sp-1", mismatched_amounts: true }),
      })
    )

    expect(stripeCreate).toHaveBeenCalledTimes(2)
  })

  // #941: a shipping method change lands while the create is in flight and the API drops
  // the new source. The read-back already shows the order at its final revision without
  // it, so every later create at that revision used to be handed the dead source.
  it("creates again when the read-back already lacks the source it created", async () => {
    await setPaymentSource(
      createParams({
        order: orderAt("order-dropped", BEFORE),
        getOrder: vi.fn().mockResolvedValue(orderAt("order-dropped", AFTER, null)),
      })
    )

    const result = await setPaymentSource(createParams({ order: orderAt("order-dropped", AFTER) }))

    expect(stripeCreate).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ id: "sp-1", type: "stripe_payments" })
  })

  it("creates again when the read-back shows another source", async () => {
    await setPaymentSource(
      createParams({
        order: orderAt("order-other", BEFORE),
        getOrder: vi.fn().mockResolvedValue(orderAt("order-other", AFTER, { id: "sp-other" })),
      })
    )

    await setPaymentSource(createParams({ order: orderAt("order-other", BEFORE) }))

    expect(stripeCreate).toHaveBeenCalledTimes(2)
  })

  it("forgets an earlier create once a later read-back shows it dropped", async () => {
    // Kills: skipping the `set` but leaving the previous entry in place.
    await setPaymentSource(
      createParams({
        order: orderAt("order-forget", BEFORE),
        getOrder: vi.fn().mockResolvedValue(orderAt("order-forget", AFTER, { id: "sp-1" })),
      })
    )
    // A newer order without a source creates for real; the API drops that one too.
    stripeCreate.mockResolvedValueOnce({ id: "sp-2", type: "stripe_payments" })
    await setPaymentSource(
      createParams({
        order: orderAt("order-forget", LATER),
        getOrder: vi.fn().mockResolvedValue(orderAt("order-forget", LATER, null)),
      })
    )

    // Not newer than the first entry: without the delete it would get `sp-1` back.
    await setPaymentSource(createParams({ order: orderAt("order-forget", AFTER) }))

    expect(stripeCreate).toHaveBeenCalledTimes(3)
  })

  it("still hands over the source when the read-back did not include it", async () => {
    // `undefined` means the payment source was not in the read's include, not that the
    // API dropped it: the single-method double create must stay suppressed.
    const notIncluded = { id: "order-noinc", status: "pending", updated_at: AFTER }
    await setPaymentSource(
      createParams({
        order: orderAt("order-noinc", BEFORE),
        getOrder: vi.fn().mockResolvedValue(notIncluded),
      })
    )

    await setPaymentSource(createParams({ order: orderAt("order-noinc", BEFORE) }))

    expect(stripeCreate).toHaveBeenCalledTimes(1)
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
      })
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

describe("setPaymentSource when the API refuses the write with a 401", () => {
  function unauthorized() {
    return Object.assign(new Error("unauthorized"), {
      errors: [
        {
          code: "UNAUTHORIZED",
          status: "401",
          title: "Access denied",
          detail: "You are not authorized to perform this action on the requested resource.",
        },
      ],
    })
  }

  function errorDispatches(dispatch: ReturnType<typeof vi.fn>) {
    return dispatch.mock.calls.filter(([action]) => action?.type === "setErrors")
  }

  it("reports it while the order is still open", async () => {
    // The case that matters in practice: the API refuses to update an Adyen
    // payment source on the second leg of a partial payment. Swallowing it
    // leaves the caller believing the card details were stored.
    stripeCreate.mockRejectedValueOnce(unauthorized())
    const dispatch = vi.fn()

    await setPaymentSource(createParams({ dispatch }))

    expect(errorDispatches(dispatch)).toHaveLength(1)
  })

  it("stays quiet once the order has been placed", async () => {
    // The one benign reading: the order was placed while this request was in
    // flight, so the token can no longer write to it and the checkout is over.
    stripeCreate.mockRejectedValueOnce(unauthorized())
    const dispatch = vi.fn()

    await setPaymentSource(
      createParams({
        dispatch,
        getOrder: vi.fn().mockResolvedValue({ id: "order-1", status: "placed" }),
      })
    )

    expect(errorDispatches(dispatch)).toHaveLength(0)
  })

  it("reports it when the order cannot be read back", async () => {
    // Without the order we cannot tell the benign case from a failed write, and
    // assuming the benign one hides exactly the failure this branch exists for.
    stripeCreate.mockRejectedValueOnce(unauthorized())
    const dispatch = vi.fn()

    await setPaymentSource(
      createParams({ dispatch, getOrder: vi.fn().mockResolvedValue(undefined) })
    )

    expect(errorDispatches(dispatch)).toHaveLength(1)
  })
})

describe("setPaymentMethod one update per order at a time (#944)", () => {
  /** An order update that settles only when the test says so. */
  function deferredUpdateOrder() {
    const pending: Array<() => void> = []
    const updateOrder = vi.fn(
      () =>
        new Promise((resolve) => {
          pending.push(() => resolve({ success: true, order: ORDER }))
        })
    )
    const settleNext = () => pending.shift()?.()
    return { updateOrder, settleNext }
  }

  function methodParams(paymentMethodId: string, overrides: Record<string, unknown> = {}) {
    return createParams({ paymentMethodId, setOrderErrors: vi.fn(), ...overrides })
  }

  function sentMethodIds(updateOrder: ReturnType<typeof vi.fn>) {
    return updateOrder.mock.calls.map(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      ([{ attributes }]: any) => attributes.payment_method.id
    )
  }

  it("sends one update for two concurrent calls with the same method", async () => {
    const updateOrder = vi.fn().mockResolvedValue({ success: true, order: ORDER })

    const [first, second] = await Promise.all([
      setPaymentMethod(methodParams("pm_stripe", { updateOrder })),
      setPaymentMethod(methodParams("pm_stripe", { updateOrder })),
    ])

    expect(updateOrder).toHaveBeenCalledTimes(1)
    expect(first).toEqual({ success: true, order: ORDER })
    expect(second).toBe(first)
  })

  it("updates again for a call after the first settles", async () => {
    const updateOrder = vi.fn().mockResolvedValue({ success: true, order: ORDER })

    await setPaymentMethod(methodParams("pm_stripe", { updateOrder }))
    await setPaymentMethod(methodParams("pm_stripe", { updateOrder }))

    expect(updateOrder).toHaveBeenCalledTimes(2)
  })

  it("sends another method only once the one in flight settles, and keeps it", async () => {
    const { updateOrder, settleNext } = deferredUpdateOrder()
    const dispatch = vi.fn()

    const stripe = setPaymentMethod(methodParams("pm_stripe", { updateOrder, dispatch }))
    const wire = setPaymentMethod(methodParams("pm_wire", { updateOrder, dispatch }))
    expect(sentMethodIds(updateOrder)).toEqual(["pm_stripe"])

    settleNext()
    await stripe
    expect(sentMethodIds(updateOrder)).toEqual(["pm_stripe", "pm_wire"])
    settleNext()
    await wire

    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ currentPaymentMethodId: "pm_wire" }),
      })
    )
  })

  it("does not hold up another order's update", async () => {
    const { updateOrder, settleNext } = deferredUpdateOrder()

    const first = setPaymentMethod(methodParams("pm_stripe", { updateOrder }))
    const second = setPaymentMethod(
      methodParams("pm_stripe", { updateOrder, order: { ...ORDER, id: "order-2" } })
    )

    expect(updateOrder).toHaveBeenCalledTimes(2)
    settleNext()
    settleNext()
    await Promise.all([first, second])
  })
})

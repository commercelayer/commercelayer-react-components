// #900: with an `auto_place` payment method the backend places the order on its own once the
// payment is authorized. When that lands between the pre-check read and the writes after it,
// the write is refused and the checkout reported an error for an order that was placed.
import { setPlaceOrder } from "#reducers/PlaceOrderReducer"

const orders = vi.hoisted(() => ({
  retrieve: vi.fn(),
  update: vi.fn(),
}))
const stripePayments = vi.hoisted(() => ({
  update: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({ orders, stripe_payments: stripePayments }),
  }
})

const INCLUDE = ["payment_method", "payment_source", "line_items"]
const PENDING = { id: "order-1", status: "pending" }
const PLACED = {
  id: "order-1",
  status: "placed",
  payment_method: { id: "pm-1", payment_source_type: "stripe_payments" },
  line_items: [{ id: "li-1" }],
}
const STRIPE_PAYMENT = {
  id: "sp-1",
  type: "stripe_payments",
  options: { return_url: "https://checkout.test/order-1?accessToken=token" },
}
const ACCESS_DENIED = {
  errors: [{ code: "FORBIDDEN", title: "Access denied", status: "401" }],
}

// biome-ignore lint/suspicious/noExplicitAny: test cast
function stripeState(options: Record<string, unknown> = {}): any {
  return { options, paymentType: "stripe_payments", errors: [], isPermitted: true }
}

function place(state: ReturnType<typeof stripeState>) {
  const setOrder = vi.fn()
  const setOrderErrors = vi.fn()
  const result = setPlaceOrder({
    state,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    order: PENDING as any,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    config: { accessToken: "token" } as any,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    paymentSource: STRIPE_PAYMENT as any,
    include: INCLUDE,
    setOrder,
    setOrderErrors,
  })
  return { result, setOrder, setOrderErrors }
}

const RETURN = { stripe: { paymentIntentClientSecret: "pi_1_secret_1" } }

describe("setPlaceOrder on an order placed in the background", () => {
  beforeEach(() => {
    // Reset, not clear: a `mockResolvedValueOnce` a test leaves unconsumed would otherwise
    // answer the next test's first read. Only these: `getSdk` keeps its return value.
    for (const fn of [orders.retrieve, orders.update, stripePayments.update]) fn.mockReset()
    window.history.replaceState(null, "", "/order-1?accessToken=token&payment_intent=pi_1")
  })

  it("does not update the Stripe return_url on the return from the gateway", async () => {
    // The payment is already confirmed by then, and the current URL never matches the stored
    // one because Stripe appends its own parameters: the PATCH was sent on every return.
    orders.retrieve.mockResolvedValue(PENDING)
    orders.update.mockResolvedValue(PLACED)

    const { result } = place(stripeState(RETURN))

    expect((await result).placed).toBe(true)
    expect(stripePayments.update).not.toHaveBeenCalled()
  })

  it("still updates the Stripe return_url when the URL changed before a first attempt", async () => {
    // Off the return, the stored URL is what the backend redirects to when it confirms the
    // payment itself (a saved card asking for 3DS), so it has to follow the current page.
    orders.retrieve.mockResolvedValue(PENDING)
    orders.update.mockResolvedValue(PLACED)

    const { result } = place(stripeState())

    expect((await result).placed).toBe(true)
    expect(stripePayments.update).toHaveBeenCalledWith({
      id: "sp-1",
      options: { return_url: window.location.href },
    })
  })

  it("reports the order as placed when a write is refused because it was placed meanwhile", async () => {
    orders.retrieve.mockResolvedValueOnce(PENDING).mockResolvedValueOnce(PLACED)
    stripePayments.update.mockRejectedValue(ACCESS_DENIED)

    const { result, setOrder, setOrderErrors } = place(stripeState())
    const { placed, order, errors } = await result

    expect(placed).toBe(true)
    expect(order).toEqual(PLACED)
    expect(errors).toBeUndefined()
    // Published like the pre-check does, with the same includes.
    expect(orders.retrieve).toHaveBeenLastCalledWith("order-1", { include: INCLUDE })
    expect(setOrder).toHaveBeenCalledWith(PLACED)
    expect(setOrderErrors).not.toHaveBeenCalled()
    // Not placed a second time.
    expect(orders.update).not.toHaveBeenCalled()
  })

  it("reports the error when the refused write left the order pending", async () => {
    orders.retrieve.mockResolvedValue(PENDING)
    orders.update.mockRejectedValue(ACCESS_DENIED)

    const { result, setOrder, setOrderErrors } = place(stripeState(RETURN))
    const { placed, errors } = await result

    expect(placed).toBe(false)
    expect(errors).toEqual([expect.objectContaining({ code: "FORBIDDEN", resource: "orders" })])
    expect(setOrderErrors).toHaveBeenCalledWith(errors)
    expect(setOrder).not.toHaveBeenCalled()
  })

  it("reports the original error when the order cannot be read again", async () => {
    orders.retrieve.mockResolvedValueOnce(PENDING).mockRejectedValueOnce(new Error("offline"))
    orders.update.mockRejectedValue(ACCESS_DENIED)

    const { result, setOrderErrors } = place(stripeState(RETURN))
    const { placed, errors } = await result

    expect(placed).toBe(false)
    expect(errors).toEqual([expect.objectContaining({ code: "FORBIDDEN" })])
    expect(setOrderErrors).toHaveBeenCalledWith(errors)
  })
})

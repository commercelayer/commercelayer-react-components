// #904: with an `auto_place` payment method the backend can place the order before the
// checkout does. The address book flags went out only on the checkout's own place path, so a
// signed-in customer's address was not saved. The API accepts them on a placed order, and
// saves the address as soon as it gets one, so each goes out once and is then cleared.
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

const BILLING = "_save_billing_address_to_customer_address_book"
const SHIPPING = "_save_shipping_address_to_customer_address_book"
const INCLUDE = ["payment_method", "payment_source", "line_items"]
const PENDING = { id: "order-1", status: "pending" }
const PLACED = { id: "order-1", status: "placed" }
const STRIPE_PAYMENT = {
  id: "sp-1",
  type: "stripe_payments",
  options: { return_url: "https://checkout.test/elsewhere" },
}
const ACCESS_DENIED = {
  errors: [{ code: "FORBIDDEN", title: "Access denied", status: "401" }],
}
const SAVE_BILLING = { id: "order-1", [BILLING]: true }
const SAVE_SHIPPING = { id: "order-1", [SHIPPING]: true }
const PLACE = { id: "order-1", _place: true }

function place() {
  const setOrder = vi.fn()
  const setOrderErrors = vi.fn()
  const result = setPlaceOrder({
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    state: { options: {}, paymentType: "stripe_payments", errors: [], isPermitted: true } as any,
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

const updates = () => orders.update.mock.calls.map(([attributes]) => attributes)

function checkBoth(): void {
  localStorage.setItem(BILLING, "true")
  localStorage.setItem(SHIPPING, "true")
}

describe("setPlaceOrder saves to the address book on an order placed in the background", () => {
  beforeEach(() => {
    // Reset, not clear: a `mockResolvedValueOnce` a test leaves unconsumed would otherwise
    // answer the next test's first read. Only these: `getSdk` keeps its return value.
    for (const fn of [orders.retrieve, orders.update, stripePayments.update]) fn.mockReset()
    localStorage.clear()
  })

  it("sends the flags when the pre-check finds the order placed", async () => {
    checkBoth()
    orders.retrieve.mockResolvedValue(PLACED)
    orders.update.mockResolvedValue(PLACED)

    const { result, setOrder } = place()

    expect((await result).placed).toBe(true)
    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING])
    expect(setOrder).toHaveBeenCalledWith(PLACED)
  })

  it("sends nothing when the pre-check finds the order placed and no flag is set", async () => {
    orders.retrieve.mockResolvedValue(PLACED)

    const { result } = place()

    expect((await result).placed).toBe(true)
    expect(orders.update).not.toHaveBeenCalled()
  })

  it("still reports the order as placed when a flag is refused", async () => {
    localStorage.setItem(BILLING, "true")
    orders.retrieve.mockResolvedValue(PLACED)
    orders.update.mockRejectedValue(ACCESS_DENIED)

    const { result, setOrderErrors } = place()
    const { placed, errors } = await result

    expect(placed).toBe(true)
    expect(errors).toBeUndefined()
    expect(setOrderErrors).not.toHaveBeenCalled()
    // Not cleared: it was never accepted.
    expect(localStorage.getItem(BILLING)).toBe("true")
  })

  it("clears each flag once the API has accepted it", async () => {
    checkBoth()
    orders.retrieve.mockResolvedValue(PENDING)
    orders.update.mockResolvedValue(PLACED)

    await place().result

    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING, PLACE])
    expect(localStorage.getItem(BILLING)).toBe("false")
    expect(localStorage.getItem(SHIPPING)).toBe("false")
  })

  it("does not send a flag again when an earlier write already sent it", async () => {
    // Sent before the gateway redirect, so already cleared when the shopper comes back.
    localStorage.setItem(BILLING, "false")
    localStorage.setItem(SHIPPING, "false")
    orders.retrieve.mockResolvedValue(PLACED)

    await place().result

    expect(orders.update).not.toHaveBeenCalled()
  })

  it("sends only the flags still missing when a later write finds the order placed", async () => {
    // The billing flag went out on the place path, then the order was placed in the
    // background and the shipping one was refused. Sending billing again could add the
    // address twice.
    checkBoth()
    orders.retrieve.mockResolvedValueOnce(PENDING).mockResolvedValueOnce(PLACED)
    orders.update.mockImplementation(async (attributes) => {
      if (attributes[SHIPPING] && updates().length === 2) throw ACCESS_DENIED
      return PLACED
    })

    const { result } = place()

    expect((await result).placed).toBe(true)
    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING, SAVE_SHIPPING])
    expect(updates()).not.toContainEqual(PLACE)
  })
})

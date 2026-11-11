// #881: the "prevent extra place order" pre-check retrieved the order without `include` and
// returned it as the placed order, so `onClick` received a different shape depending on who
// placed it — the bare order has no `payment_method`, no `payment_source`, no `line_items`.
import { setPlaceOrder } from "#reducers/PlaceOrderReducer"

const orders = vi.hoisted(() => ({
  retrieve: vi.fn(),
  update: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({ orders }),
  }
})

const INCLUDE = ["payment_method", "payment_source", "line_items"]

// biome-ignore lint/suspicious/noExplicitAny: test cast
const STATE: any = { options: {}, paymentType: "adyen_payments", errors: [], isPermitted: true }

describe("setPlaceOrder pre-check", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retrieves the already-placed order with the same includes the place paths ask for", async () => {
    const placed = {
      id: "order-1",
      status: "placed",
      payment_method: { id: "pm-1", payment_source_type: "adyen_payments" },
      line_items: [{ id: "li-1" }],
    }
    orders.retrieve.mockResolvedValue(placed)

    const setOrder = vi.fn()
    const result = await setPlaceOrder({
      state: STATE,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      order: { id: "order-1", status: "pending" } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      config: { accessToken: "token" } as any,
      include: INCLUDE,
      setOrder,
    })

    expect(orders.retrieve).toHaveBeenCalledWith("order-1", { include: INCLUDE })
    // Published too, like both place paths do: `setPaymentSource` reads
    // `order.status === "placed"` off the context to refuse writes on a placed order.
    expect(setOrder).toHaveBeenCalledWith(placed)
    expect(result.placed).toBe(true)
    // What the app reads to tell a card from a wallet, and to build its analytics events.
    expect(result.order?.payment_method).toBeDefined()
    expect(result.order?.line_items).toHaveLength(1)
    // The pre-check short-circuits: nothing is placed twice.
    expect(orders.update).not.toHaveBeenCalled()
  })
})

// #924: when the order in context is already `placed` — an `auto_place` method placed it in the
// background while the shopper was on the gateway's page, and the checkout reloaded on it —
// `setPlaceOrder` handed that order back as fetched, without the included data the app builds
// the thank-you page and the `purchase` event from. The payment recap was missing and the
// summary stayed on "Loading…".
describe("setPlaceOrder on an order already placed in context", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("re-reads it with the includes and publishes it", async () => {
    const placed = {
      id: "order-1",
      status: "placed",
      payment_method: { id: "pm-1", payment_source_type: "klarna_payments" },
      line_items: [{ id: "li-1" }],
    }
    orders.retrieve.mockResolvedValue(placed)

    const setOrder = vi.fn()
    const result = await setPlaceOrder({
      state: STATE,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      order: { id: "order-1", status: "placed" } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      config: { accessToken: "token" } as any,
      include: INCLUDE,
      setOrder,
    })

    expect(orders.retrieve).toHaveBeenCalledWith("order-1", { include: INCLUDE })
    expect(setOrder).toHaveBeenCalledWith(placed)
    expect(result).toEqual({ placed: true, order: placed })
    expect(orders.update).not.toHaveBeenCalled()
  })

  it("still reports it placed, with the order it has, when the re-read fails", async () => {
    orders.retrieve.mockRejectedValue(new Error("network"))
    const inContext = { id: "order-1", status: "placed" }

    const result = await setPlaceOrder({
      state: STATE,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      order: inContext as any,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      config: { accessToken: "token" } as any,
      include: INCLUDE,
      setOrder: vi.fn(),
    })

    expect(result).toEqual({ placed: true, order: inContext })
    expect(orders.update).not.toHaveBeenCalled()
  })
})

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

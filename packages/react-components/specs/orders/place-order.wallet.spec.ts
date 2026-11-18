// #940: with an `auto_place` payment method (Adyen) the backend can place the order before the
// checkout does. The wallet flag went out only on the checkout's own place path, so the card a
// signed-in customer asked to save was not saved. It goes out on every branch that finds the
// order placed, once, and is then cleared.
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

const WALLET = "_save_payment_source_to_customer_wallet"
const INCLUDE = ["payment_method", "payment_source", "line_items"]
const PENDING = { id: "order-1", status: "pending", total_amount_cents: 1000 }
const PLACED = { id: "order-1", status: "placed", total_amount_cents: 1000 }
const PLACED_FREE = { id: "order-1", status: "placed", total_amount_cents: 0 }
const ADYEN_PAYMENT = { id: "ap-1", type: "adyen_payments" }
const ACCESS_DENIED = {
  errors: [{ code: "FORBIDDEN", title: "Access denied", status: "401" }],
}
const SAVE_WALLET = { id: "order-1", [WALLET]: true }
const PLACE = { id: "order-1", _place: true }

function place(order: unknown = PENDING) {
  const setOrder = vi.fn()
  const setOrderErrors = vi.fn()
  const result = setPlaceOrder({
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    state: { options: {}, paymentType: "adyen_payments", errors: [], isPermitted: true } as any,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    order: order as any,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    config: { accessToken: "token" } as any,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    paymentSource: ADYEN_PAYMENT as any,
    include: INCLUDE,
    setOrder,
    setOrderErrors,
  })
  return { result, setOrder, setOrderErrors }
}

const updates = () => orders.update.mock.calls.map(([attributes]) => attributes)
const walletUpdates = () => updates().filter((attributes) => attributes[WALLET] === true)

/** The three ways `setPlaceOrder` finds an order placed in the background. */
const PLACED_BRANCHES = {
  "the order arrives placed": (placed: unknown) => {
    orders.retrieve.mockResolvedValue(placed)
    return place(placed)
  },
  "the pre-check finds it placed": (placed: unknown) => {
    orders.retrieve.mockResolvedValue(placed)
    return place()
  },
  "`_place` is refused because it was placed meanwhile": (placed: unknown) => {
    orders.retrieve.mockResolvedValueOnce(PENDING).mockResolvedValue(placed)
    orders.update.mockImplementation(async (attributes) => {
      if (attributes._place) throw ACCESS_DENIED
      return placed
    })
    return place()
  },
}

describe("setPlaceOrder saves the card to the wallet on an order placed in the background", () => {
  beforeEach(() => {
    // Reset, not clear: a `mockResolvedValueOnce` a test leaves unconsumed would otherwise
    // answer the next test's first read. Only these: `getSdk` keeps its return value.
    for (const fn of [orders.retrieve, orders.update]) fn.mockReset()
    orders.update.mockResolvedValue(PLACED)
    localStorage.clear()
  })

  describe.each(Object.entries(PLACED_BRANCHES))("when %s", (_, run) => {
    it("sends the wallet flag and clears it", async () => {
      localStorage.setItem(WALLET, "true")

      const { result } = run(PLACED)

      expect((await result).placed).toBe(true)
      expect(walletUpdates()).toEqual([SAVE_WALLET])
      expect(localStorage.getItem(WALLET)).toBe("false")
    })

    it("sends nothing when the shopper did not ask to save the card", async () => {
      const { result } = run(PLACED)

      expect((await result).placed).toBe(true)
      expect(walletUpdates()).toEqual([])
    })

    it("sends nothing for an order with nothing to pay", async () => {
      localStorage.setItem(WALLET, "true")

      const { result } = run(PLACED_FREE)

      expect((await result).placed).toBe(true)
      expect(walletUpdates()).toEqual([])
    })
  })

  it("still reports the order as placed when the wallet flag is refused", async () => {
    localStorage.setItem(WALLET, "true")
    orders.retrieve.mockResolvedValue(PLACED)
    orders.update.mockRejectedValue(ACCESS_DENIED)

    const { result, setOrderErrors } = place()
    const { placed, errors } = await result

    expect(placed).toBe(true)
    expect(errors).toBeUndefined()
    expect(setOrderErrors).not.toHaveBeenCalled()
    expect(walletUpdates()).toEqual([SAVE_WALLET])
    // Not cleared: it was never accepted.
    expect(localStorage.getItem(WALLET)).toBe("true")
  })

  it("does not send the flag again on a second pass over the placed order", async () => {
    // The automatic attempt and a click, or the return from a redirect.
    localStorage.setItem(WALLET, "true")
    orders.retrieve.mockResolvedValue(PLACED)

    await place().result
    await place().result

    expect(walletUpdates()).toEqual([SAVE_WALLET])
  })
})

describe("setPlaceOrder saves the card to the wallet on its own place path", () => {
  beforeEach(() => {
    for (const fn of [orders.retrieve, orders.update]) fn.mockReset()
    orders.retrieve.mockResolvedValue(PENDING)
    orders.update.mockResolvedValue(PLACED)
    localStorage.clear()
  })

  it("sends the flag after placing and clears it", async () => {
    localStorage.setItem(WALLET, "true")

    const { result } = place()

    expect((await result).placed).toBe(true)
    expect(updates()).toEqual([PLACE, SAVE_WALLET])
    expect(localStorage.getItem(WALLET)).toBe("false")
  })

  it("sends the flag before publishing the placed order", async () => {
    // An app that leaves the checkout on the placed order would drop a request still to go.
    localStorage.setItem(WALLET, "true")

    const { result, setOrder } = place()
    await result

    const walletCall = orders.update.mock.calls.findIndex(([attributes]) => attributes[WALLET])
    expect(setOrder).toHaveBeenCalledWith(PLACED)
    expect(orders.update.mock.invocationCallOrder[walletCall]).toBeLessThan(
      setOrder.mock.invocationCallOrder[0]
    )
  })

  it("reports a refused flag without failing the placed order", async () => {
    localStorage.setItem(WALLET, "true")
    orders.update.mockImplementation(async (attributes) => {
      if (attributes[WALLET]) throw ACCESS_DENIED
      return PLACED
    })

    const { result, setOrderErrors } = place()

    expect((await result).placed).toBe(true)
    expect(setOrderErrors).toHaveBeenCalled()
    expect(localStorage.getItem(WALLET)).toBe("true")
  })
})

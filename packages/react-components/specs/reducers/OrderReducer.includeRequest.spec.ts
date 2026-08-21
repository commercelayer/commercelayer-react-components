import { beforeEach, describe, expect, it, vi } from "vitest"

const retrieve = vi.fn().mockResolvedValue({ id: "order-1", editable: true })

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({ orders: { retrieve } }),
  }
})

const { getApiOrder, addResourceToInclude, default: orderReducer } = await import(
  "#reducers/OrderReducer"
)
type OrderActions = import("#reducers/OrderReducer").OrderActions
type OrderState = import("#reducers/OrderReducer").OrderState

/**
 * Closes the loop between the reducer and the request actually sent: builds `state.include`
 * through the same dispatch sequence `PlaceOrderContainer` performs, then asserts what
 * `getApiOrder` puts on the wire. Missing an include is indistinguishable from an unset
 * relationship in the response, so this is the assertion that matters in practice.
 */
describe("getApiOrder include", () => {
  beforeEach(() => {
    retrieve.mockClear()
  })

  function includeAfterPlaceOrderContainerEffect(initial: OrderState): OrderState {
    let state = initial
    const snapshot = state.include
    const dispatch = (action: OrderActions) => {
      state = orderReducer(state as Required<OrderState>, action)
    }
    // Mirrors PlaceOrderContainer's single effect pass: three dispatches, one snapshot.
    addResourceToInclude({
      dispatch,
      newResource: [
        "shipments.available_shipping_methods",
        "shipments.stock_line_items.line_item",
        "shipments.shipping_method",
        "shipments.stock_transfers.line_item",
        "shipments.stock_location",
      ],
    })
    addResourceToInclude({ dispatch, newResource: "billing_address" })
    addResourceToInclude({
      dispatch,
      newResource: "shipping_address",
      resourcesIncluded: snapshot,
    })
    return state
  }

  it("requests shipments.shipping_method after the PlaceOrderContainer effect", async () => {
    const state = includeAfterPlaceOrderContainerEffect({ include: ["line_items.item"] })

    await getApiOrder({
      id: "order-1",
      config: { accessToken: "test-token" },
      state,
      options: {},
    })

    expect(retrieve).toHaveBeenCalledTimes(1)
    const options = retrieve.mock.calls[0]?.[1] as { include?: string[] }
    // The resource whose absence made a set shipping method look unset.
    expect(options.include).toContain("shipments.shipping_method")
    expect(options.include).toContain("billing_address")
    expect(options.include).toContain("shipping_address")
    expect(options.include).toContain("line_items.item")
  })

  it("omits include entirely when nothing has been registered", async () => {
    await getApiOrder({
      id: "order-1",
      config: { accessToken: "test-token" },
      state: {},
      options: {},
    })

    const options = retrieve.mock.calls[0]?.[1] as { include?: string[] }
    expect(options.include).toBeUndefined()
  })
})

import { describe, expect, it, vi } from "vitest"
import orderReducer, {
  addResourceToInclude,
  type OrderActions,
  type OrderState,
} from "#reducers/OrderReducer"

/**
 * `state.include` is the union of the resources every mounted component needs. The API
 * cannot distinguish "I didn't ask for this relationship" from "this relationship is
 * unset", so a dropped resource silently becomes wrong application state rather than a
 * failed request. These specs pin the accumulation behaviour.
 */
describe("orderReducer / setIncludesResource", () => {
  const reduce = (state: OrderState, action: OrderActions): OrderState =>
    orderReducer(state as Required<OrderState>, action)

  it("accumulates resources across dispatches", () => {
    let state: OrderState = { include: ["line_items"] }
    state = reduce(state, {
      type: "setIncludesResource",
      payload: { include: ["billing_address"] },
    })
    expect(state.include).toEqual(["line_items", "billing_address"])
  })

  it("de-duplicates resources already present", () => {
    const state = reduce(
      { include: ["line_items", "billing_address"] },
      { type: "setIncludesResource", payload: { include: ["billing_address"] } }
    )
    expect(state.include).toEqual(["line_items", "billing_address"])
  })

  it("keeps include undefined when a dispatch only reports includeLoaded", () => {
    // `useOrderState` distinguishes `undefined` from `[]`, so this must not become `[]`.
    const state = reduce(
      {},
      { type: "setIncludesResource", payload: { includeLoaded: { billing_address: true } } }
    )
    expect(state.include).toBeUndefined()
    expect(state.includeLoaded).toEqual({ billing_address: true })
  })

  it("treats an explicitly empty list as a reset", () => {
    const state = reduce(
      { include: ["line_items", "billing_address"] },
      { type: "setIncludesResource", payload: { include: [] } }
    )
    expect(state.include).toEqual([])
  })

  it("leaves other action types to the base reducer", () => {
    const state = reduce({ include: ["line_items"] }, {
      type: "setLoading",
      payload: { loading: false },
    } as OrderActions)
    expect(state.include).toEqual(["line_items"])
    expect(state.loading).toBe(false)
  })

  /**
   * The real defect: several components dispatch more than once from a single effect
   * pass, so every call reads the same pre-update `include` snapshot. Before the reducer
   * unioned, the last dispatch replaced the others and their resources were lost —
   * including `shipments.shipping_method`, which made a set shipping method look unset.
   */
  it("keeps every resource when three call sites dispatch off one stale snapshot", () => {
    let state: OrderState = { include: ["line_items"] }
    const snapshot = state.include
    const dispatch = vi.fn((action: OrderActions) => {
      state = reduce(state, action)
    })

    // Block 1 and 2 omit `resourcesIncluded`; block 3 passes the stale snapshot.
    addResourceToInclude({
      dispatch,
      newResource: ["shipments.available_shipping_methods", "shipments.shipping_method"],
    })
    addResourceToInclude({ dispatch, newResource: "billing_address" })
    addResourceToInclude({
      dispatch,
      newResource: "shipping_address",
      resourcesIncluded: snapshot,
    })

    expect(dispatch).toHaveBeenCalledTimes(3)
    expect(state.include).toEqual([
      "line_items",
      "shipments.available_shipping_methods",
      "shipments.shipping_method",
      "billing_address",
      "shipping_address",
    ])
  })
})

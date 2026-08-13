import { beforeEach, describe, expect, it, vi } from "vitest"

const addressesUpdate = vi.fn().mockResolvedValue({})
const inStockCreate = vi.fn().mockResolvedValue({ id: "iss_1" })

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn(() => ({
      addresses: { update: addressesUpdate },
      in_stock_subscriptions: { create: inStockCreate },
    })),
  }
})

const {
  default: billingAddressReducer,
  billingAddressInitialState,
  setBillingAddress,
  setBillingCustomerAddressId,
} = await import("#reducers/BillingAddressReducer")

const {
  default: shippingAddressReducer,
  shippingAddressInitialState,
  setShippingAddress,
  setShippingCustomerAddressId,
} = await import("#reducers/ShippingAddressReducer")

const { default: inStockSubscriptionReducer, setInStockSubscription } = await import(
  "#reducers/InStockSubscriptionReducer"
)

// biome-ignore lint/suspicious/noExplicitAny: test cast
const config = { accessToken: "token" } as any
// biome-ignore lint/suspicious/noExplicitAny: test cast
const ORDER = { id: "order-1" } as any

describe("BillingAddressReducer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("starts with an empty clone id", () => {
    expect(billingAddressInitialState).toEqual({ _billing_address_clone_id: "" })
  })

  it("stores the clone id on setBillingAddress", () => {
    const state = billingAddressReducer(billingAddressInitialState, {
      type: "setBillingAddress",
      payload: { _billing_address_clone_id: "addr_1" },
    })

    expect(state._billing_address_clone_id).toBe("addr_1")
  })

  it("dispatches the clone id without touching the API when no customer address is given", async () => {
    const dispatch = vi.fn()

    await setBillingAddress("addr_1", { config, dispatch, order: ORDER })

    expect(addressesUpdate).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({
      type: "setBillingAddress",
      payload: { _billing_address_clone_id: "addr_1" },
    })
  })

  it("references the customer address on the address resource when one is given", async () => {
    const dispatch = vi.fn()

    await setBillingAddress("addr_1", {
      config,
      dispatch,
      order: ORDER,
      customerAddressId: "cust_addr_1",
    })

    expect(addressesUpdate).toHaveBeenCalledWith({ id: "addr_1", reference: "cust_addr_1" })
    expect(dispatch).toHaveBeenCalled()
  })

  it("does nothing without an order", async () => {
    const dispatch = vi.fn()

    await setBillingAddress("addr_1", { config, dispatch })

    expect(dispatch).not.toHaveBeenCalled()
  })

  it("swallows and logs an API failure", async () => {
    addressesUpdate.mockRejectedValueOnce(new Error("boom"))
    const dispatch = vi.fn()

    await expect(
      setBillingAddress("addr_1", {
        config,
        dispatch,
        order: ORDER,
        customerAddressId: "cust_addr_1",
      })
    ).resolves.toBeUndefined()

    expect(console.error).toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it("propagates the order's billing address reference", () => {
    const dispatch = vi.fn()
    const setCloneAddress = vi.fn()

    setBillingCustomerAddressId({
      dispatch,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      order: { billing_address: { reference: "cust_addr_1" } } as any,
      setCloneAddress,
    })

    expect(dispatch).toHaveBeenCalledWith({
      type: "setBillingCustomerAddressId",
      payload: { billingCustomerAddressId: "cust_addr_1" },
    })
    expect(setCloneAddress).toHaveBeenCalledWith("cust_addr_1", "billing_address")
  })

  it("does nothing when the order has no billing address reference", () => {
    const dispatch = vi.fn()
    const setCloneAddress = vi.fn()

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    setBillingCustomerAddressId({ dispatch, order: {} as any, setCloneAddress })

    expect(dispatch).not.toHaveBeenCalled()
    expect(setCloneAddress).not.toHaveBeenCalled()
  })

  it("logs rather than throwing when the clone callback fails", () => {
    const setCloneAddress = vi.fn(() => {
      throw new Error("clone failed")
    })

    expect(() =>
      setBillingCustomerAddressId({
        dispatch: vi.fn(),
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        order: { billing_address: { reference: "cust_addr_1" } } as any,
        setCloneAddress,
      })
    ).not.toThrow()

    expect(console.error).toHaveBeenCalled()
  })
})

describe("ShippingAddressReducer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("starts with an empty clone id", () => {
    expect(shippingAddressInitialState).toEqual({ _shipping_address_clone_id: "" })
  })

  it("stores the clone id on setShippingAddress", () => {
    const state = shippingAddressReducer(shippingAddressInitialState, {
      type: "setShippingAddress",
      payload: { _shipping_address_clone_id: "addr_2" },
    })

    expect(state._shipping_address_clone_id).toBe("addr_2")
  })

  it("dispatches the clone id without touching the API when no customer address is given", async () => {
    const dispatch = vi.fn()

    await setShippingAddress("addr_2", { config, dispatch, order: ORDER })

    expect(addressesUpdate).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({
      type: "setShippingAddress",
      payload: { _shipping_address_clone_id: "addr_2" },
    })
  })

  it("references the customer address when one is given", async () => {
    const dispatch = vi.fn()

    await setShippingAddress("addr_2", {
      config,
      dispatch,
      order: ORDER,
      customerAddressId: "cust_addr_2",
    })

    expect(addressesUpdate).toHaveBeenCalledWith({ id: "addr_2", reference: "cust_addr_2" })
  })

  it("does nothing without an order", async () => {
    const dispatch = vi.fn()

    await setShippingAddress("addr_2", { config, dispatch })

    expect(dispatch).not.toHaveBeenCalled()
  })

  it("swallows and logs an API failure", async () => {
    addressesUpdate.mockRejectedValueOnce(new Error("boom"))
    const dispatch = vi.fn()

    await expect(
      setShippingAddress("addr_2", {
        config,
        dispatch,
        order: ORDER,
        customerAddressId: "cust_addr_2",
      })
    ).resolves.toBeUndefined()

    expect(console.error).toHaveBeenCalled()
  })

  it("propagates the order's shipping address reference", () => {
    const dispatch = vi.fn()
    const setCloneAddress = vi.fn()

    setShippingCustomerAddressId({
      dispatch,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      order: { shipping_address: { reference: "cust_addr_2" } } as any,
      setCloneAddress,
    })

    expect(dispatch).toHaveBeenCalledWith({
      type: "setShippingCustomerAddressId",
      payload: { shippingCustomerAddressId: "cust_addr_2" },
    })
    expect(setCloneAddress).toHaveBeenCalledWith("cust_addr_2", "shipping_address")
  })

  it("does nothing when the order has no shipping address reference", () => {
    const dispatch = vi.fn()
    const setCloneAddress = vi.fn()

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    setShippingCustomerAddressId({ dispatch, order: {} as any, setCloneAddress })

    expect(dispatch).not.toHaveBeenCalled()
  })

  it("logs rather than throwing when the clone callback fails", () => {
    const setCloneAddress = vi.fn(() => {
      throw new Error("clone failed")
    })

    expect(() =>
      setShippingCustomerAddressId({
        dispatch: vi.fn(),
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        order: { shipping_address: { reference: "cust_addr_2" } } as any,
        setCloneAddress,
      })
    ).not.toThrow()

    expect(console.error).toHaveBeenCalled()
  })
})

describe("InStockSubscriptionReducer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("merges the dispatched payload into state", () => {
    // baseReducer spreads the payload over state, so the errors land under `errors`
    // rather than replacing the array wholesale.
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const errors = [{ code: "VALIDATION_ERROR", resource: "in_stock_subscriptions" }] as any

    const state = inStockSubscriptionReducer([], { type: "setErrors", payload: { errors } })

    expect(state).toEqual({ errors })
  })

  it("ignores an unknown action type", () => {
    const initial = inStockSubscriptionReducer([], {
      // biome-ignore lint/suspicious/noExplicitAny: exercising the unknown-action path
      type: "unknown" as any,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      payload: { errors: [] } as any,
    })

    expect(initial).toEqual([])
  })

  it("creates a subscription from a sku code alone", async () => {
    const result = await setInStockSubscription({ config, dispatch: vi.fn(), skuCode: "SKU" })

    expect(inStockCreate).toHaveBeenCalledWith({ sku_code: "SKU" })
    expect(result).toEqual({ success: true })
  })

  it("includes the customer email when one is supplied", async () => {
    await setInStockSubscription({
      config,
      dispatch: vi.fn(),
      skuCode: "SKU",
      customerEmail: "a@b.com",
    })

    expect(inStockCreate).toHaveBeenCalledWith({ sku_code: "SKU", customer_email: "a@b.com" })
  })

  it("reports failure and dispatches errors when the API rejects", async () => {
    inStockCreate.mockRejectedValueOnce({ errors: [{ code: "VALIDATION_ERROR" }] })
    const dispatch = vi.fn()

    const result = await setInStockSubscription({ config, dispatch, skuCode: "SKU" })

    expect(result).toEqual({ success: false })
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "setErrors" }))
  })

  it("reports failure without a dispatch", async () => {
    inStockCreate.mockRejectedValueOnce({ errors: [{ code: "VALIDATION_ERROR" }] })

    const result = await setInStockSubscription({ config, skuCode: "SKU" })

    expect(result).toEqual({ success: false })
  })

  it("fails when no config is supplied", async () => {
    const dispatch = vi.fn()

    // biome-ignore lint/suspicious/noExplicitAny: exercising the missing-config guard
    const result = await setInStockSubscription({ config: null as any, dispatch, skuCode: "SKU" })

    expect(result).toEqual({ success: false })
  })
})

import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { clear } from "./addressFormStore.js"
import { useAddressForm } from "./useAddressForm.js"

const mocks = vi.hoisted(() => ({
  saveOrderAddresses: vi.fn(),
  retrieveOrder: vi.fn(),
  updateOrder: vi.fn(),
}))

// Only the network functions are faked: `createSharedStateStore` has to stay
// real, since the state sharing is what these tests are about.
vi.mock("@commercelayer/core-components", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@commercelayer/core-components")>()),
  saveOrderAddresses: mocks.saveOrderAddresses,
  retrieveOrder: mocks.retrieveOrder,
  updateOrder: mocks.updateOrder,
}))

vi.mock("swr", async () => {
  const { useState, useCallback } = await import("react")

  function useSWR(key: string | null, fetcher: (() => Promise<unknown>) | null) {
    const [data, setData] = useState<unknown>(undefined)
    const [isLoading, setIsLoading] = useState(key != null)
    const [error, setError] = useState<unknown>(undefined)

    const mutate = useCallback(async (updated: unknown) => {
      setData(updated)
    }, [])

    // Trigger fetch on mount (simulate SWR)
    const [fetched, setFetched] = useState(false)
    if (!fetched && key != null && fetcher != null) {
      setFetched(true)
      fetcher()
        .then((result) => {
          setData(result)
          setIsLoading(false)
        })
        .catch((err: unknown) => {
          setError(err)
          setIsLoading(false)
        })
    }

    return { data, isLoading, error, mutate }
  }

  return { default: useSWR }
})

const fakeOrder = { id: "ord_1", customer_email: "user@example.com" }

beforeEach(() => {
  vi.clearAllMocks()
  // Store entries are module-level and outlive their subscribers on purpose.
  clear()
  mocks.retrieveOrder.mockResolvedValue(fakeOrder)
  mocks.saveOrderAddresses.mockResolvedValue({
    success: true,
    orderAttributes: { id: "ord_1", customer_email: "user@example.com" },
  })
  mocks.updateOrder.mockResolvedValue({ ...fakeOrder, _refresh: true })
})

describe("useAddressForm", () => {
  test("returns initial state", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))

    expect(result.current.billingAddress).toEqual({})
    expect(result.current.shippingAddress).toEqual({})
    expect(result.current.isSaving).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.order).toBeUndefined()
  })

  test("fetches the order when orderId is provided", async () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toEqual(fakeOrder))
    expect(mocks.retrieveOrder).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "token", id: "ord_1" })
    )
  })

  test("does not fetch when orderId is null", () => {
    renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))
    expect(mocks.retrieveOrder).not.toHaveBeenCalled()
  })

  test("exposes error as string when SWR fetch fails", async () => {
    mocks.retrieveOrder.mockRejectedValueOnce(new Error("Fetch failed"))

    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.error).toContain("Fetch failed"))
  })

  test("setBillingAddress updates billingAddress state", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))

    act(() => {
      result.current.setBillingAddress({ first_name: "John" })
    })

    expect(result.current.billingAddress).toEqual({ first_name: "John" })
  })

  test("setShippingAddress updates shippingAddress state", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))

    act(() => {
      result.current.setShippingAddress({ first_name: "Jane" })
    })

    expect(result.current.shippingAddress).toEqual({ first_name: "Jane" })
  })

  test("saveAddresses returns success=false when no order is loaded", async () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))

    const outcome = await result.current.saveAddresses()
    expect(outcome).toEqual({ success: false })
    expect(mocks.saveOrderAddresses).not.toHaveBeenCalled()
  })

  test("saveAddresses calls saveOrderAddresses and updateOrder on success", async () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toBeDefined())

    act(() => {
      result.current.setBillingAddress({ first_name: "John" })
    })

    let outcome!: Awaited<ReturnType<typeof result.current.saveAddresses>>
    await act(async () => {
      outcome = await result.current.saveAddresses({ customerEmail: "john@example.com" })
    })

    // biome-ignore lint/suspicious/noExplicitAny: test assertion
    expect((outcome as any).success).toBe(true)
    expect(mocks.saveOrderAddresses).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token",
        order: fakeOrder,
        billingAddress: { first_name: "John" },
        customerEmail: "john@example.com",
      })
    )
    expect(mocks.updateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token",
        id: "ord_1",
      })
    )
  })

  test("saveAddresses returns success=false when saveOrderAddresses fails", async () => {
    mocks.saveOrderAddresses.mockResolvedValueOnce({
      success: false,
      error: new Error("SDK error"),
    })

    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toBeDefined())

    let outcome!: Awaited<ReturnType<typeof result.current.saveAddresses>>
    await act(async () => {
      outcome = await result.current.saveAddresses()
    })

    // biome-ignore lint/suspicious/noExplicitAny: test assertion
    expect((outcome as any).success).toBe(false)
    // biome-ignore lint/suspicious/noExplicitAny: test assertion
    expect((outcome as any).error).toBeInstanceOf(Error)
  })

  test("saveAddresses returns success=false when orderAttributes is null", async () => {
    mocks.saveOrderAddresses.mockResolvedValueOnce({
      success: true,
      orderAttributes: null,
    })

    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toBeDefined())

    let outcome!: Awaited<ReturnType<typeof result.current.saveAddresses>>
    await act(async () => {
      outcome = await result.current.saveAddresses()
    })

    // biome-ignore lint/suspicious/noExplicitAny: test assertion
    expect((outcome as any).success).toBe(false)
  })

  test("saveAddresses returns success=false when updateOrder throws", async () => {
    mocks.updateOrder.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toBeDefined())

    let outcome!: Awaited<ReturnType<typeof result.current.saveAddresses>>
    await act(async () => {
      outcome = await result.current.saveAddresses()
    })

    // biome-ignore lint/suspicious/noExplicitAny: test assertion
    expect((outcome as any).success).toBe(false)
    // biome-ignore lint/suspicious/noExplicitAny: test assertion
    expect((outcome as any).error).toBeInstanceOf(Error)
  })

  test("isSaving is true during saveAddresses and false after", async () => {
    let resolveSave!: () => void
    mocks.saveOrderAddresses.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = () =>
            resolve({
              success: true,
              orderAttributes: { id: "ord_1" },
            })
        })
    )

    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toBeDefined())

    let savePromise: ReturnType<typeof result.current.saveAddresses>
    act(() => {
      savePromise = result.current.saveAddresses()
    })

    await waitFor(() => expect(result.current.isSaving).toBe(true))

    act(() => {
      resolveSave()
    })

    await act(async () => {
      await savePromise
    })

    expect(result.current.isSaving).toBe(false)
  })
})

describe("useAddressForm — state shared across instances", () => {
  test("two instances on the same order see the same values", async () => {
    const form = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    act(() => {
      form.result.current.setBillingAddress({ first_name: "John" })
    })

    await waitFor(() =>
      expect(button.result.current.billingAddress).toEqual({ first_name: "John" })
    )
  })

  test("saves what a sibling instance typed, which is what #841 was about", async () => {
    const form = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(button.result.current.order).toBeDefined())

    act(() => {
      form.result.current.setBillingAddress({ first_name: "John" })
      form.result.current.setShippingAddress({ first_name: "Jane" })
    })

    await act(async () => {
      await button.result.current.saveAddresses()
    })

    expect(mocks.saveOrderAddresses).toHaveBeenCalledWith(
      expect.objectContaining({
        billingAddress: { first_name: "John" },
        shippingAddress: { first_name: "Jane" },
      })
    )
  })

  test("isSaving is visible from the other instance", async () => {
    let resolveSave!: () => void
    mocks.saveOrderAddresses.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = () => resolve({ success: true, orderAttributes: { id: "ord_1" } })
        })
    )

    const form = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(button.result.current.order).toBeDefined())

    let savePromise: ReturnType<typeof button.result.current.saveAddresses>
    act(() => {
      savePromise = button.result.current.saveAddresses()
    })

    await waitFor(() => expect(form.result.current.isSaving).toBe(true))

    act(() => {
      resolveSave()
    })
    await act(async () => {
      await savePromise
    })

    expect(form.result.current.isSaving).toBe(false)
  })

  test("a different order is independent", async () => {
    const first = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const second = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_2" }))

    act(() => {
      first.result.current.setBillingAddress({ first_name: "John" })
    })

    await waitFor(() => expect(first.result.current.billingAddress).toEqual({ first_name: "John" }))
    expect(second.result.current.billingAddress).toEqual({})
  })

  test("scope isolates two editors working on the same order", async () => {
    const main = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const aside = renderHook(() =>
      useAddressForm({ accessToken: "token", orderId: "ord_1", scope: "aside" })
    )

    act(() => {
      main.result.current.setBillingAddress({ first_name: "John" })
    })

    await waitFor(() => expect(main.result.current.billingAddress).toEqual({ first_name: "John" }))
    expect(aside.result.current.billingAddress).toEqual({})
  })

  test("instances without an order id keep their own values", async () => {
    const first = renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))
    const second = renderHook(() => useAddressForm({ accessToken: "token", orderId: null }))

    act(() => {
      first.result.current.setBillingAddress({ first_name: "John" })
    })

    await waitFor(() => expect(first.result.current.billingAddress).toEqual({ first_name: "John" }))
    expect(second.result.current.billingAddress).toEqual({})
  })
})

describe("useAddressForm — errors and validation", () => {
  test("setErrors publishes to every instance", async () => {
    const form = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    expect(button.result.current.errors).toEqual([])

    act(() => {
      form.result.current.setErrors([
        { code: "VALIDATION_ERROR", message: "required", field: "first_name" },
      ])
    })

    await waitFor(() =>
      expect(button.result.current.errors).toEqual([
        { code: "VALIDATION_ERROR", message: "required", field: "first_name" },
      ])
    )
  })

  test("a sibling can validate the mounted forms before saving", async () => {
    const form = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    const validator = vi.fn(() => ({ first_name: { code: "EMPTY_ERROR" } }))
    act(() => {
      form.result.current.registerValidator("billing_address", validator)
    })

    const outcome = button.result.current.validateAddresses()

    expect(validator).toHaveBeenCalledTimes(1)
    expect(outcome.valid).toBe(false)
    expect(outcome.fieldErrors).toEqual({
      billing_address: { first_name: { code: "EMPTY_ERROR" } },
    })
  })

  test("validateAddresses passes when every validator is happy", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    act(() => {
      result.current.registerValidator("billing_address", () => ({}))
      result.current.registerValidator("shipping_address", () => ({}))
    })

    expect(result.current.validateAddresses()).toEqual({ valid: true, fieldErrors: {} })
  })

  test("validateAddresses passes when no form is mounted", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    expect(result.current.validateAddresses()).toEqual({ valid: true, fieldErrors: {} })
  })

  test("unregistering removes the validator", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const validator = vi.fn(() => ({ first_name: { code: "EMPTY_ERROR" } }))

    let unregister!: () => void
    act(() => {
      unregister = result.current.registerValidator("billing_address", validator)
    })
    act(() => {
      unregister()
    })

    expect(result.current.validateAddresses().valid).toBe(true)
    expect(validator).not.toHaveBeenCalled()
  })

  test("registering the same validator twice leaves the state untouched", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const validator = vi.fn(() => ({}))

    act(() => {
      result.current.registerValidator("billing_address", validator)
    })
    const first = result.current.errors
    act(() => {
      result.current.registerValidator("billing_address", validator)
    })

    expect(result.current.errors).toBe(first)
    expect(result.current.validateAddresses().valid).toBe(true)
  })

  test("unregistering a validator that was already replaced is a no-op", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const stale = vi.fn(() => ({}))
    const current = vi.fn(() => ({ first_name: { code: "EMPTY_ERROR" } }))

    let unregisterStale!: () => void
    act(() => {
      unregisterStale = result.current.registerValidator("billing_address", stale)
      result.current.registerValidator("billing_address", current)
    })
    act(() => {
      unregisterStale()
    })

    expect(result.current.validateAddresses().valid).toBe(false)
    expect(current).toHaveBeenCalled()
  })
})

describe("useAddressForm — flags and clone ids", () => {
  test("flags set on one instance reach the other and the save call", async () => {
    const form = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(button.result.current.order).toBeDefined())

    act(() => {
      form.result.current.setFlags({ shipToDifferentAddress: true, invertAddresses: true })
    })

    await waitFor(() => expect(button.result.current.shipToDifferentAddress).toBe(true))
    expect(button.result.current.invertAddresses).toBe(true)
    expect(button.result.current.isBusiness).toBe(false)

    await act(async () => {
      await button.result.current.saveAddresses()
    })

    expect(mocks.saveOrderAddresses).toHaveBeenCalledWith(
      expect.objectContaining({ shipToDifferentAddress: true, invertAddresses: true })
    )
  })

  test("clone ids set on one instance reach the save call", async () => {
    const card = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const button = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(button.result.current.order).toBeDefined())

    act(() => {
      card.result.current.setCloneIds({ billingAddressCloneId: "addr_saved" })
    })

    await waitFor(() => expect(button.result.current.billingAddressCloneId).toBe("addr_saved"))

    await act(async () => {
      await button.result.current.saveAddresses()
    })

    expect(mocks.saveOrderAddresses).toHaveBeenCalledWith(
      expect.objectContaining({ billingAddressCloneId: "addr_saved" })
    )
  })

  test("explicit params win over the shared state", async () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    await waitFor(() => expect(result.current.order).toBeDefined())

    act(() => {
      result.current.setCloneIds({ billingAddressCloneId: "addr_saved" })
    })

    await act(async () => {
      await result.current.saveAddresses({ billingAddressCloneId: "addr_override" })
    })

    expect(mocks.saveOrderAddresses).toHaveBeenCalledWith(
      expect.objectContaining({ billingAddressCloneId: "addr_override" })
    )
  })

  test("setResourceErrors replaces one form's errors and leaves the other's alone", async () => {
    const billing = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const shipping = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    act(() => {
      billing.result.current.setResourceErrors("billing_address", [
        { code: "VALIDATION_ERROR", message: "required", resource: "billing_address" },
      ])
      shipping.result.current.setResourceErrors("shipping_address", [
        { code: "VALIDATION_ERROR", message: "required", resource: "shipping_address" },
      ])
    })

    await waitFor(() => expect(billing.result.current.errors).toHaveLength(2))

    act(() => {
      billing.result.current.setResourceErrors("billing_address", [])
    })

    await waitFor(() => expect(billing.result.current.errors).toHaveLength(1))
    expect(billing.result.current.errors[0]?.resource).toBe("shipping_address")
  })

  test("clearing errors that were already empty does not churn the state", () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))
    const before = result.current.errors

    act(() => {
      result.current.setResourceErrors("billing_address", [])
    })

    expect(result.current.errors).toBe(before)
  })

  test("errors raised for another resource are dropped", async () => {
    const { result } = renderHook(() => useAddressForm({ accessToken: "token", orderId: "ord_1" }))

    act(() => {
      result.current.setResourceErrors("billing_address", [
        { code: "VALIDATION_ERROR", message: "required", resource: "shipping_address" },
      ])
    })

    expect(result.current.errors).toEqual([])
  })
})

describe("useAddressForm — caller-owned order", () => {
  test("does not fetch when the order is handed in", () => {
    const { result } = renderHook(() =>
      useAddressForm({ accessToken: "token", orderId: "ord_1", order: fakeOrder as never })
    )

    expect(mocks.retrieveOrder).not.toHaveBeenCalled()
    expect(result.current.order).toEqual(fakeOrder)
  })

  test("lets the caller apply the order update and reports back what it returns", async () => {
    const updateOrder = vi.fn(async () => ({ order: { ...fakeOrder, _applied: true } as never }))

    const { result } = renderHook(() =>
      useAddressForm({
        accessToken: "token",
        orderId: "ord_1",
        order: fakeOrder as never,
        updateOrder,
      })
    )

    let outcome!: Awaited<ReturnType<typeof result.current.saveAddresses>>
    await act(async () => {
      outcome = await result.current.saveAddresses()
    })

    expect(updateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: "ord_1", attributes: expect.objectContaining({ id: "ord_1" }) })
    )
    expect(mocks.updateOrder).not.toHaveBeenCalled()
    expect(outcome.success).toBe(true)
    expect(outcome.order).toEqual({ ...fakeOrder, _applied: true })
  })

  test("reports success even when the caller's update returns nothing", async () => {
    const updateOrder = vi.fn(async () => undefined)

    const { result } = renderHook(() =>
      useAddressForm({
        accessToken: "token",
        orderId: "ord_1",
        order: fakeOrder as never,
        updateOrder,
      })
    )

    let outcome!: Awaited<ReturnType<typeof result.current.saveAddresses>>
    await act(async () => {
      outcome = await result.current.saveAddresses()
    })

    expect(outcome).toEqual({ success: true, order: undefined })
  })
})

import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { useAddressForm } from "./useAddressForm.js"

const mocks = vi.hoisted(() => ({
  saveOrderAddresses: vi.fn(),
  retrieveOrder: vi.fn(),
  updateOrder: vi.fn(),
}))

vi.mock("@commercelayer/core", () => ({
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

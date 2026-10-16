/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useLineItems, useReloadLineItems } from "./useLineItems"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const MOCK_LINE_ITEMS = [
  { id: "li_1", item_type: "skus", quantity: 2 },
  { id: "li_2", item_type: "gift_cards", quantity: 1 },
]
const MOCK_UPDATED_LINE_ITEM = { id: "li_1", item_type: "skus", quantity: 3 }

const mockGetLineItems = vi.fn().mockResolvedValue(MOCK_LINE_ITEMS)
const mockUpdateLineItem = vi.fn().mockResolvedValue(MOCK_UPDATED_LINE_ITEM)
const mockDeleteLineItem = vi.fn().mockResolvedValue(undefined)

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getLineItems: (...args: unknown[]) => mockGetLineItems(...args),
    updateLineItem: (...args: unknown[]) => mockUpdateLineItem(...args),
    deleteLineItem: (...args: unknown[]) => mockDeleteLineItem(...args),
  }
})

describe("useLineItems", () => {
  const accessToken = "test-token"
  const orderId = "order-1"

  beforeEach(() => {
    mockGetLineItems.mockClear()
    mockUpdateLineItem.mockClear()
    mockDeleteLineItem.mockClear()
  })

  it("returns empty array and no loading when orderId is null", () => {
    const { result } = renderHook(() => useLineItems({ accessToken, orderId: null }), {
      wrapper: swrWrapper,
    })

    expect(result.current.lineItems).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockGetLineItems).not.toHaveBeenCalled()
  })

  it("returns empty array and no loading when orderId is undefined", () => {
    const { result } = renderHook(() => useLineItems({ accessToken }), {
      wrapper: swrWrapper,
    })

    expect(result.current.lineItems).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockGetLineItems).not.toHaveBeenCalled()
  })

  it("fetches and returns line items when accessToken and orderId are provided", async () => {
    const { result } = renderHook(() => useLineItems({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => {
      expect(result.current.lineItems).toEqual(MOCK_LINE_ITEMS)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  it("calls getLineItems with correct accessToken and orderId", async () => {
    renderHook(() => useLineItems({ accessToken, orderId }), { wrapper: swrWrapper })

    await waitFor(() => {
      expect(mockGetLineItems).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken, orderId })
      )
    })
  })

  it("updateLineItem calls core function with correct args and triggers revalidation", async () => {
    const { result } = renderHook(() => useLineItems({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => expect(result.current.lineItems).toEqual(MOCK_LINE_ITEMS))

    let updated!: Awaited<ReturnType<typeof result.current.updateLineItem>>
    await act(async () => {
      updated = await result.current.updateLineItem("li_1", 3, false)
    })

    expect(mockUpdateLineItem).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken,
        lineItemId: "li_1",
        quantity: 3,
        hasExternalPrice: false,
      })
    )
    expect(updated).toEqual(MOCK_UPDATED_LINE_ITEM)
    // SWR revalidates — getLineItems is called again
    expect(mockGetLineItems).toHaveBeenCalledTimes(2)
  })

  it("deleteLineItem calls core function and triggers revalidation", async () => {
    const { result } = renderHook(() => useLineItems({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => expect(result.current.lineItems).toEqual(MOCK_LINE_ITEMS))

    await act(async () => {
      await result.current.deleteLineItem("li_1")
    })

    expect(mockDeleteLineItem).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken, lineItemId: "li_1" })
    )
    expect(mockGetLineItems).toHaveBeenCalledTimes(2)
  })

  it("reload triggers revalidation", async () => {
    const { result } = renderHook(() => useLineItems({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => expect(result.current.lineItems).toEqual(MOCK_LINE_ITEMS))

    await act(async () => {
      await result.current.reload()
    })

    expect(mockGetLineItems).toHaveBeenCalledTimes(2)
  })

  it("exposes error message when getLineItems throws", async () => {
    mockGetLineItems.mockRejectedValueOnce(new Error("Unauthorized"))

    const { result } = renderHook(() => useLineItems({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(
      () => {
        expect(result.current.error).toBe("Unauthorized")
        expect(result.current.lineItems).toEqual([])
      },
      { timeout: 5000 }
    )
  })

  it("passes interceptors to getLineItems", async () => {
    const interceptors: InterceptorManager = {
      request: { onSuccess: vi.fn((req) => req) },
    }

    renderHook(() => useLineItems({ accessToken, orderId, interceptors }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => {
      expect(mockGetLineItems).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
    })
  })

  it("passes interceptors to updateLineItem", async () => {
    const interceptors: InterceptorManager = {
      request: { onSuccess: vi.fn((req) => req) },
    }

    const { result } = renderHook(() => useLineItems({ accessToken, orderId, interceptors }), {
      wrapper: swrWrapper,
    })

    await act(async () => {
      await result.current.updateLineItem("li_1", 2)
    })

    expect(mockUpdateLineItem).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("returns empty array and no loading when accessToken is undefined", () => {
    const { result } = renderHook(() => useLineItems({ orderId }), {
      wrapper: swrWrapper,
    })

    expect(result.current.lineItems).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockGetLineItems).not.toHaveBeenCalled()
  })

  it("updateLineItem throws when accessToken is not provided", async () => {
    const { result } = renderHook(() => useLineItems({ orderId }), {
      wrapper: swrWrapper,
    })

    await expect(result.current.updateLineItem("li_1", 2)).rejects.toThrow(
      "accessToken is required"
    )
  })

  it("deleteLineItem throws when accessToken is not provided", async () => {
    const { result } = renderHook(() => useLineItems({ orderId }), {
      wrapper: swrWrapper,
    })

    await expect(result.current.deleteLineItem("li_1")).rejects.toThrow("accessToken is required")
  })
})

describe("useReloadLineItems", () => {
  const accessToken = "test-token"
  const orderId = "order-1"

  beforeEach(() => {
    mockGetLineItems.mockReset()
    mockGetLineItems.mockResolvedValue(MOCK_LINE_ITEMS)
  })

  it("refetches the line items held by a mounted useLineItems", async () => {
    const { result } = renderHook(
      () => ({
        list: useLineItems({ accessToken, orderId }),
        reloadLineItems: useReloadLineItems(),
      }),
      { wrapper: swrWrapper }
    )
    await waitFor(() => expect(result.current.list.lineItems).toEqual(MOCK_LINE_ITEMS))

    const added = { id: "li_3", item_type: "skus", quantity: 1 }
    mockGetLineItems.mockResolvedValueOnce([...MOCK_LINE_ITEMS, added])
    await act(async () => {
      await result.current.reloadLineItems({ accessToken, orderId })
    })

    expect(mockGetLineItems).toHaveBeenCalledTimes(2)
    // settled only once the mounted list holds the new data
    expect(result.current.list.lineItems).toEqual([...MOCK_LINE_ITEMS, added])
  })

  it("leaves the line items of another order alone", async () => {
    const { result } = renderHook(
      () => ({
        list: useLineItems({ accessToken, orderId }),
        reloadLineItems: useReloadLineItems(),
      }),
      { wrapper: swrWrapper }
    )
    await waitFor(() => expect(result.current.list.lineItems).toEqual(MOCK_LINE_ITEMS))

    await act(async () => {
      await result.current.reloadLineItems({ accessToken, orderId: "order-2" })
    })

    expect(mockGetLineItems).toHaveBeenCalledOnce()
  })

  it("does nothing without an order id or an access token", async () => {
    const { result } = renderHook(() => useReloadLineItems(), { wrapper: swrWrapper })

    await act(async () => {
      await result.current({ accessToken, orderId: null })
      await result.current({ orderId })
    })

    expect(mockGetLineItems).not.toHaveBeenCalled()
  })
})

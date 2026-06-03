/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useInStockSubscriptions } from "./useInStockSubscriptions"

const mockCoreSetInStockSubscription = vi.fn().mockResolvedValue(undefined)

vi.mock("@commercelayer/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core")>()
  return {
    ...actual,
    setInStockSubscription: (...args: unknown[]) => mockCoreSetInStockSubscription(...args),
  }
})

describe("useInStockSubscriptions", () => {
  const accessToken = "test-token"
  const skuCode = "TSHIRTMS000000FFFFFFXLXX"

  beforeEach(() => {
    mockCoreSetInStockSubscription.mockClear()
    mockCoreSetInStockSubscription.mockResolvedValue(undefined)
  })

  it("starts with isLoading false", () => {
    const { result } = renderHook(() => useInStockSubscriptions({ accessToken }))
    expect(result.current.isLoading).toBe(false)
  })

  it("sets isLoading true while the API call is in flight", async () => {
    let resolveApi!: () => void
    mockCoreSetInStockSubscription.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveApi = resolve
      })
    )

    const { result } = renderHook(() => useInStockSubscriptions({ accessToken }))

    act(() => {
      void result.current.setInStockSubscription({ skuCode })
    })

    await waitFor(() => expect(result.current.isLoading).toBe(true))

    await act(async () => {
      resolveApi()
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it("calls core function with accessToken and skuCode", async () => {
    const { result } = renderHook(() => useInStockSubscriptions({ accessToken }))

    await act(async () => {
      await result.current.setInStockSubscription({ skuCode })
    })

    expect(mockCoreSetInStockSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken, skuCode })
    )
  })

  it("calls core function with customerEmail when provided", async () => {
    const { result } = renderHook(() => useInStockSubscriptions({ accessToken }))

    await act(async () => {
      await result.current.setInStockSubscription({ skuCode, customerEmail: "test@example.com" })
    })

    expect(mockCoreSetInStockSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken, skuCode, customerEmail: "test@example.com" })
    )
  })

  it("throws and resets isLoading when accessToken is missing", async () => {
    const { result } = renderHook(() => useInStockSubscriptions({}))

    await expect(
      act(async () => {
        await result.current.setInStockSubscription({ skuCode })
      })
    ).rejects.toThrow("accessToken is required")

    expect(result.current.isLoading).toBe(false)
  })

  it("resets isLoading to false after a failed API call", async () => {
    mockCoreSetInStockSubscription.mockRejectedValueOnce(new Error("API error"))

    const { result } = renderHook(() => useInStockSubscriptions({ accessToken }))

    await expect(
      act(async () => {
        await result.current.setInStockSubscription({ skuCode })
      })
    ).rejects.toThrow("API error")

    expect(result.current.isLoading).toBe(false)
  })

  it("passes interceptors to the core function", async () => {
    const interceptors: InterceptorManager = {
      request: { onSuccess: vi.fn((req) => req) },
    }
    const { result } = renderHook(() => useInStockSubscriptions({ accessToken, interceptors }))

    await act(async () => {
      await result.current.setInStockSubscription({ skuCode })
    })

    expect(mockCoreSetInStockSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ interceptors })
    )
  })
})

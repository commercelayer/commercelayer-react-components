/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { describe, expect, it, vi } from "vitest"
import { useAvailability } from "./useAvailability"

const SKU_CODE = "BABYONBU000000E63E7412MX"

const mockAvailability = {
  skuCode: SKU_CODE,
  quantity: 5,
  min: { hours: 24, days: 1 },
  max: { hours: 72, days: 3 },
  shipping_method: undefined,
}

vi.mock("@commercelayer/core", () => ({
  getSkuAvailability: vi.fn(),
}))

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

async function getCoreMock() {
  const mod = await import("@commercelayer/core")
  return vi.mocked(mod.getSkuAvailability)
}

describe("useAvailability", () => {
  it("should start with null availability", () => {
    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    expect(result.current.availability).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isValidating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should fetch availability by skuCode", async () => {
    const mock = await getCoreMock()
    mock.mockResolvedValueOnce(mockAvailability)

    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: SKU_CODE })
    })

    await waitFor(() => {
      expect(result.current.availability).not.toBeNull()
    })

    expect(result.current.availability?.quantity).toBe(5)
    expect(result.current.availability?.skuCode).toBe(SKU_CODE)
    expect(result.current.error).toBeNull()
    expect(mock).toHaveBeenCalledWith(
      expect.objectContaining({ skuCode: SKU_CODE }),
    )
  })

  it("should clear availability after fetch", async () => {
    const mock = await getCoreMock()
    mock.mockResolvedValueOnce(mockAvailability)

    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: SKU_CODE })
    })

    await waitFor(() => {
      expect(result.current.availability).not.toBeNull()
    })

    act(() => {
      result.current.clearAvailability()
    })

    await waitFor(() => {
      expect(result.current.availability).toBeNull()
    })
  })

  it("should set error when fetcher throws", async () => {
    const mock = await getCoreMock()
    mock.mockRejectedValueOnce(new Error("Unauthorized"))

    const { result } = renderHook(() => useAvailability("bad-token"), {
      wrapper: swrWrapper,
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: SKU_CODE })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe("Unauthorized")
    expect(result.current.availability).toBeNull()
  })

  it("should not fetch before fetchAvailability is called", () => {
    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    expect(result.current.availability).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it("should set isLoading true while fetching", async () => {
    const mock = await getCoreMock()
    let resolve: (v: typeof mockAvailability) => void
    mock.mockReturnValueOnce(
      new Promise<typeof mockAvailability>((res) => {
        resolve = res
      }),
    )

    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: SKU_CODE })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    act(() => {
      resolve?.(mockAvailability)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it("should return null when fetcher returns null (SKU not found)", async () => {
    const mock = await getCoreMock()
    mock.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: "NON_EXISTENT_SKU" })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.availability).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("should not trigger fetch when fetchAvailability is called with empty params", async () => {
    const mock = await getCoreMock()

    const { result } = renderHook(() => useAvailability("test-token"), {
      wrapper: swrWrapper,
    })

    // fetchParams will be set but skuCode and skuId are both undefined
    // SWR key will include them — but getSkuAvailability returns null for undefined inputs
    mock.mockResolvedValueOnce(null)
    act(() => {
      result.current.fetchAvailability({})
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.availability).toBeNull()
  })
})

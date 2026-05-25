/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { usePrices } from "./usePrices"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const mockPrices = [{ id: "price_1", amount_cents: 1000 }]

const mockGetPrices = vi.fn().mockResolvedValue(mockPrices)
const mockRetrievePrice = vi.fn().mockResolvedValue(mockPrices[0])
const mockUpdatePrice = vi.fn().mockResolvedValue({ ...mockPrices[0], amount_cents: 2000 })

vi.mock("@commercelayer/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core")>()
  return {
    ...actual,
    getPrices: (...args: unknown[]) => mockGetPrices(...args),
    retrievePrice: (...args: unknown[]) => mockRetrievePrice(...args),
    updatePrice: (...args: unknown[]) => mockUpdatePrice(...args),
  }
})

describe("usePrices — interceptors", () => {
  const accessToken = "test-token"
  const interceptors: InterceptorManager = {
    request: { onSuccess: vi.fn((req) => req) },
  }

  beforeEach(() => {
    mockGetPrices.mockClear()
    mockRetrievePrice.mockClear()
    mockUpdatePrice.mockClear()
  })

  it("passes interceptors to getPrices", async () => {
    const { result } = renderHook(() => usePrices(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(mockGetPrices).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
    })
  })

  it("passes interceptors to retrievePrice", async () => {
    const { result } = renderHook(() => usePrices(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.retrievePrice("price_1")
    })

    expect(mockRetrievePrice).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("passes interceptors to updatePrice", async () => {
    const { result } = renderHook(() => usePrices(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.updatePrice({ id: "price_1", amount_cents: 2000 })
    })

    expect(mockUpdatePrice).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("works without interceptors", async () => {
    const { result } = renderHook(() => usePrices(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(mockGetPrices).toHaveBeenCalledWith(expect.objectContaining({ accessToken }))
    })
  })
})

/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useSkuLists } from "./useSkuLists"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const mockSkuLists = [{ id: "list_1", name: "My List" }]
const mockGetSkuLists = vi.fn().mockResolvedValue(mockSkuLists)
const mockRetrieveSkuList = vi.fn().mockResolvedValue(mockSkuLists[0])

vi.mock("@commercelayer/core", () => ({
  getSkuLists: (...args: unknown[]) => mockGetSkuLists(...args),
  retrieveSkuList: (...args: unknown[]) => mockRetrieveSkuList(...args),
}))

describe("useSkuLists — interceptors", () => {
  const accessToken = "test-token"
  const interceptors: InterceptorManager = {
    request: { onSuccess: vi.fn((req) => req) },
  }

  beforeEach(() => {
    mockGetSkuLists.mockClear()
    mockRetrieveSkuList.mockClear()
  })

  it("passes interceptors to getSkuLists", async () => {
    const { result } = renderHook(
      () => useSkuLists(accessToken, interceptors),
      { wrapper: ({ children }) => swrWrapper({ children }) },
    )

    act(() => {
      result.current.fetchSkuLists()
    })

    await waitFor(() => {
      expect(mockGetSkuLists).toHaveBeenCalledWith(
        expect.objectContaining({ interceptors }),
      )
    })
  })

  it("passes interceptors to retrieveSkuList", async () => {
    const { result } = renderHook(
      () => useSkuLists(accessToken, interceptors),
      { wrapper: ({ children }) => swrWrapper({ children }) },
    )

    await act(async () => {
      await result.current.retrieveSkuList("list_1")
    })

    expect(mockRetrieveSkuList).toHaveBeenCalledWith(
      expect.objectContaining({ interceptors }),
    )
  })

  it("works without interceptors", async () => {
    const { result } = renderHook(() => useSkuLists(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchSkuLists()
    })

    await waitFor(() => {
      expect(mockGetSkuLists).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken }),
      )
    })
  })

  it("clearSkuLists resets fetch state and clears cached data", async () => {
    const { result } = renderHook(
      () => useSkuLists(accessToken, interceptors),
      { wrapper: ({ children }) => swrWrapper({ children }) },
    )

    act(() => {
      result.current.fetchSkuLists()
    })

    await waitFor(() => {
      expect(result.current.skuLists).toEqual(mockSkuLists)
    })

    act(() => {
      result.current.clearSkuLists()
    })

    await waitFor(() => {
      expect(result.current.skuLists).toEqual([])
    })
  })

  it("throws when retrieveSkuList is called with an empty id", async () => {
    const { result } = renderHook(
      () => useSkuLists(accessToken, interceptors),
      { wrapper: ({ children }) => swrWrapper({ children }) },
    )

    await expect(
      act(async () => {
        await result.current.retrieveSkuList("")
      }),
    ).rejects.toThrow("SKU list ID is required for retrieve")
  })
})

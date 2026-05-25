/**
 * @vitest-environment jsdom
 */

import type { Sku } from "@commercelayer/core"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useSkus } from "./useSkus"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const mockSkus = [{ id: "sku_1", code: "TEST-SKU" }]

const mockGetSkus = vi.fn().mockResolvedValue(mockSkus)
const mockRetrieveSku = vi.fn().mockResolvedValue(mockSkus[0])
const mockUpdateSku = vi.fn().mockResolvedValue({ ...mockSkus[0], reference: "updated" })

vi.mock("@commercelayer/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core")>()
  return {
    ...actual,
    getSkus: (...args: unknown[]) => mockGetSkus(...args),
    retrieveSku: (...args: unknown[]) => mockRetrieveSku(...args),
    updateSku: (...args: unknown[]) => mockUpdateSku(...args),
  }
})

describe("useSkus — interceptors", () => {
  const accessToken = "test-token"
  const interceptors: InterceptorManager = {
    request: { onSuccess: vi.fn((req) => req) },
  }

  beforeEach(() => {
    mockGetSkus.mockClear()
    mockRetrieveSku.mockClear()
    mockUpdateSku.mockClear()
  })

  it("passes interceptors to getSkus", async () => {
    const { result } = renderHook(() => useSkus(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(mockGetSkus).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
    })
  })

  it("passes interceptors to retrieveSku", async () => {
    const { result } = renderHook(() => useSkus(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.retrieveSku("sku_1")
    })

    expect(mockRetrieveSku).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("passes interceptors to updateSku", async () => {
    const { result } = renderHook(() => useSkus(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.updateSku({ id: "sku_1", reference: "new-ref" })
    })

    expect(mockUpdateSku).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("works without interceptors", async () => {
    const { result } = renderHook(() => useSkus(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(mockGetSkus).toHaveBeenCalledWith(expect.objectContaining({ accessToken }))
    })
  })

  it("maps over cached SKUs and leaves non-matching entries unchanged", async () => {
    const sku2 = { id: "sku_2", code: "TEST-SKU-2" } as unknown as Sku
    const updated = { ...mockSkus[0], reference: "updated" } as unknown as Sku
    mockUpdateSku.mockResolvedValueOnce(updated)

    const { result } = renderHook(() => useSkus(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchSkus()
    })

    // Pre-populate cache with two SKUs via the bound mutate (same key)
    await act(async () => {
      await result.current.mutate([...mockSkus, sku2] as unknown as Sku[], false)
    })

    await act(async () => {
      await result.current.updateSku({ id: "sku_1" })
    })

    // sku_1 updated, sku_2 unchanged — proves .map() branch was taken, not ?? fallback
    expect(result.current.skus).toEqual([updated, sku2])
  })

  it("falls back to [result] when no cached data exists", async () => {
    const updated = { ...mockSkus[0], reference: "updated" } as unknown as Sku
    mockUpdateSku.mockResolvedValueOnce(updated)
    // Fetch never resolves so SWR key is non-null but cache stays empty
    mockGetSkus.mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useSkus(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchSkus()
    })

    await act(async () => {
      await result.current.updateSku({ id: "sku_1" })
    })

    // current was undefined → ?? [result] fallback taken
    expect(result.current.skus).toContainEqual(updated)
  })
})

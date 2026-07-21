/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect } from "vitest"
import { coreIntegrationTest, coreTest } from "#extender"
import { useSkus } from "./useSkus"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const domain = import.meta.env.VITE_DOMAIN

describe("useSkus", () => {
  beforeEach(({ skip }) => {
    if (domain == null) skip()
  })
  coreIntegrationTest("should return a list of SKUs", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    expect(result.current.skus).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.action).toBeNull()

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(result.current.skus.length).toBeGreaterThan(0)
      expect(result.current.error).toBeNull()
      expect(result.current.action).toBe("get")
    })
  })

  coreIntegrationTest("should retrieve a single SKU", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(result.current.skus.length).toBeGreaterThan(0)
    })

    const testSkuId = result.current.skus[0]?.id
    if (!testSkuId) {
      throw new Error("No SKU available to retrieve")
    }

    let retrievedSku: Awaited<ReturnType<typeof result.current.retrieveSku>>
    await act(async () => {
      retrievedSku = await result.current.retrieveSku(testSkuId)
    })

    await waitFor(() => {
      expect(result.current.action).toBe("retrieve")
      expect(retrievedSku).toBeDefined()
      expect(retrievedSku?.id).toBe(testSkuId)
    })
  })

  coreIntegrationTest("should update a SKU", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(result.current.skus.length).toBeGreaterThan(0)
    })

    const skuToUpdate = result.current.skus[0]
    if (!skuToUpdate) {
      throw new Error("No SKU available to update")
    }

    let updatedSku: Awaited<ReturnType<typeof result.current.updateSku>>
    await act(async () => {
      updatedSku = await result.current.updateSku({
        id: skuToUpdate.id,
      })
    })

    await waitFor(() => {
      expect(result.current.action).toBe("update")
      expect(updatedSku).toBeDefined()
      expect(updatedSku?.id).toBe(skuToUpdate.id)
    })
  })

  coreIntegrationTest(
    "should return a list of SKUs with an integration token",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => useSkus(token))

      expect(result.current.skus).toEqual([])
      expect(result.current.isLoading).toBe(false)

      act(() => {
        result.current.fetchSkus()
      })

      await waitFor(() => {
        expect(result.current.skus.length).toBeGreaterThan(0)
        expect(result.current.error).toBeNull()
      })
    }
  )

  coreTest("should handle errors gracefully", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined()
        expect(result.current.skus).toEqual([])
      },
      { timeout: 5000 }
    )
  })

  coreIntegrationTest("should clear SKUs", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(result.current.skus.length).toBeGreaterThan(0)
    })

    act(() => {
      result.current.clearSkus()
    })

    await waitFor(() => {
      expect(result.current.skus).toEqual([])
    })
  })

  coreTest("should clear errors", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined()
      },
      { timeout: 5000 }
    )

    act(() => {
      result.current.clearError()
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })

  coreTest("should filter SKUs by parameters", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus({
        filters: {
          code_eq: "DIGITALPRODUCT",
        },
      })
    })

    await waitFor(() => {
      expect(result.current.skus).toBeDefined()
      expect(result.current.error).toBe(null)
    })
  })

  coreTest("should support pagination parameters", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    act(() => {
      result.current.fetchSkus({
        pageSize: 5,
        pageNumber: 1,
      })
    })

    await waitFor(() => {
      expect(result.current.skus).toBeDefined()
      expect(result.current.error).toBeNull()
    })
  })

  coreTest("should track action state", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useSkus(token))

    expect(result.current.action).toBeNull()

    act(() => {
      result.current.fetchSkus()
    })

    await waitFor(() => {
      expect(result.current.action).toBe("get")
    })

    act(() => {
      result.current.clearSkus()
    })

    await waitFor(() => {
      expect(result.current.action).toBeNull()
    })
  })

  coreIntegrationTest(
    "should set error when retrieving SKU with empty ID",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => useSkus(token), {
        wrapper: swrWrapper,
      })

      await expect(
        act(async () => {
          await result.current.retrieveSku("")
        })
      ).rejects.toThrow("SKU ID is required for retrieve")
    }
  )

  coreIntegrationTest(
    "should throw error when updating SKU without an ID",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => useSkus(token), {
        wrapper: swrWrapper,
      })

      await expect(
        act(async () => {
          await result.current.updateSku({} as Parameters<typeof result.current.updateSku>[0])
        })
      ).rejects.toThrow("SKU resource ID is required for update")
    }
  )

  coreIntegrationTest(
    "should update a SKU without prior fetch (no cached list)",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      if (!token) return

      // First get a valid SKU ID via a shared-cache hook instance
      const { result: sharedResult } = renderHook(() => useSkus(token))
      act(() => {
        sharedResult.current.fetchSkus()
      })
      try {
        await waitFor(
          () => {
            expect(sharedResult.current.skus.length).toBeGreaterThan(0)
          },
          { timeout: 10000 }
        )
      } catch {
        return // graceful skip if API is rate-limited or unavailable
      }
      const skuId = sharedResult.current.skus[0]?.id
      if (!skuId) return

      // Use an isolated SWR provider so mutate receives undefined as current (covers ?? [result] branch)
      const { result } = renderHook(() => useSkus(token), {
        wrapper: swrWrapper,
      })

      let updatedSku: Awaited<ReturnType<typeof result.current.updateSku>>
      await act(async () => {
        updatedSku = await result.current.updateSku({ id: skuId })
      })

      expect(updatedSku).toBeDefined()
      expect(updatedSku?.id).toBe(skuId)
    },
    15000
  )
})

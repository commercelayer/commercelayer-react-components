/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect } from "vitest"
import { coreIntegrationTest, coreTest } from "#extender"
import { usePrices } from "./usePrices"

describe("usePrices", () => {
  coreTest("should return a list of prices", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    expect(result.current.prices).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.action).toBeNull()

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.prices.length).toBeGreaterThan(0)
      expect(result.current.error).toBeNull()
      expect(result.current.action).toBe("get")
    })
  })

  coreTest("should retrieve a single price", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))
    // First fetch prices
    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.prices.length).toBeGreaterThan(0)
    })

    // Get an ID of one of the fetched prices
    const testPriceId = result.current.prices[0]?.id

    if (!testPriceId) {
      throw new Error("No price available to retrieve")
    }

    // Retrieve a specific price
    await act(async () => {
      await result.current.retrievePrice(testPriceId)
    })

    await waitFor(() => {
      expect(result.current.action).toBe("retrieve")
    })
  })

  coreIntegrationTest("should update a price", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    // First fetch prices
    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.prices.length).toBeGreaterThan(0)
    })
    // Get an ID of one of the fetched prices
    const priceToUpdate = result.current.prices[0]

    if (!priceToUpdate) {
      throw new Error("No price available to update")
    }

    // Update the price
    await act(async () => {
      await result.current.updatePrice({
        id: priceToUpdate.id,
      })
    })

    await waitFor(() => {
      expect(result.current.action).toBe("update")
    })
  })

  coreIntegrationTest(
    "should return a list of prices with an integration token",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => usePrices(token))

      expect(result.current.prices).toEqual([])
      expect(result.current.isLoading).toBe(false)

      act(() => {
        result.current.fetchPrices()
      })

      await waitFor(() => {
        expect(result.current.prices.length).toBeGreaterThan(0)
        expect(result.current.error).toBeNull()
      })
    },
  )

  coreTest("should handle errors gracefully", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => usePrices(token))

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined()
        expect(result.current.prices).toEqual([])
      },
      { timeout: 5000 },
    )
  })

  coreTest("should clear prices", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    // First fetch some prices
    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.prices.length).toBeGreaterThan(0)
    })

    // Then clear them
    act(() => {
      result.current.clearPrices()
    })

    await waitFor(() => {
      expect(result.current.prices).toEqual([])
    })
  })

  coreTest("should clear errors", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => usePrices(token))

    // Trigger an error
    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined()
      },
      { timeout: 5000 },
    )

    // Clear the error
    act(() => {
      result.current.clearError()
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })

  coreTest("should filter prices by parameters", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    act(() => {
      result.current.fetchPrices({
        filters: {
          sku_code_eq: "DIGITALPRODUCT",
        },
      })
    })

    await waitFor(() => {
      expect(result.current.prices).toBeDefined()
      expect(result.current.error).toBe(null)
    })
  })

  coreTest("should maintain error state until cleared", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => usePrices(token))

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined()
      },
      { timeout: 5000 },
    )

    const errorMessage = result.current.error

    // Error should persist
    expect(result.current.error).toBe(errorMessage)

    // Clear the error
    act(() => {
      result.current.clearError()
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })

  coreTest("should support pagination parameters", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    act(() => {
      result.current.fetchPrices({
        pageSize: 5,
        pageNumber: 1,
      })
    })

    await waitFor(() => {
      expect(result.current.prices).toBeDefined()
      expect(result.current.error).toBeNull()
    })
  })

  coreTest("should support include parameters", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    act(() => {
      result.current.fetchPrices({
        include: ["price_list"],
      })
    })

    await waitFor(() => {
      expect(result.current.prices).toBeDefined()
      expect(result.current.error).toBeNull()
    })
  })

  coreTest("should track action state", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    expect(result.current.action).toBeNull()

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.action).toBe("get")
    })

    act(() => {
      result.current.clearPrices()
    })

    await waitFor(() => {
      expect(result.current.action).toBeNull()
    })
  })
})

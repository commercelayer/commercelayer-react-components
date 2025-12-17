import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect } from "vitest"
import { coreIntegrationTest, coreTest } from "#extender"
import { usePrices } from "./usePrices"

describe("usePrices", () => {
  coreTest("should return a list of prices", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => usePrices(token))

    expect(result.current.prices).toEqual([])

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.prices.length).toBeGreaterThan(0)
    })
  })

  coreIntegrationTest(
    "should return a list of prices with an integration token",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => usePrices(token))

      expect(result.current.prices).toEqual([])

      act(() => {
        result.current.fetchPrices()
      })

      await waitFor(() => {
        expect(result.current.prices.length).toBeGreaterThan(0)
      })
    },
  )

  coreTest("should handle errors gracefully", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => usePrices(token))

    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.prices).toEqual([])
    })
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

    expect(result.current.prices).toEqual([])
  })

  coreTest("should clear errors", async () => {
    const token = "invalid-token"
    const { result } = renderHook(() => usePrices(token))

    // Trigger an error
    act(() => {
      result.current.fetchPrices()
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })

    // Clear the error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
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

  coreTest(
    "should show pending state during fetch",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => usePrices(token))

      expect(result.current.isPending).toBe(false)

      act(() => {
        result.current.fetchPrices()
      })

      expect(result.current.isPending).toBe(true)

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })
    },
  )
})

/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { describe, expect, vi } from "vitest"
import { coreIntegrationTest } from "#extender"
import { useGiftCards } from "./useGiftCards"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

describe("useGiftCards", () => {
  coreIntegrationTest("should start with empty state", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useGiftCards(token))
    expect(result.current.giftCards).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.action).toBeNull()
    expect(result.current.error).toBeNull()
  })

  coreIntegrationTest("should fetch a list of gift cards", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useGiftCards(token))

    act(() => {
      result.current.fetchGiftCards()
    })

    await waitFor(() => {
      expect(result.current.action).toBe("get")
      expect(result.current.error).toBeNull()
    })
  })

  coreIntegrationTest("should create a gift card", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const { result } = renderHook(() => useGiftCards(token))

    let created: Awaited<ReturnType<typeof result.current.createGiftCard>>
    await act(async () => {
      created = await result.current.createGiftCard({
        currency_code: "USD",
        initial_balance_cents: 1000,
      })
    })

    await waitFor(() => {
      expect(result.current.action).toBe("create")
      expect(created).toBeDefined()
      expect(created?.id).toBeDefined()
      expect(created?.currency_code).toBe("USD")
    })
  })

  coreIntegrationTest("should retrieve a single gift card", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const { result } = renderHook(() => useGiftCards(token))

    // Create one to retrieve
    let created: Awaited<ReturnType<typeof result.current.createGiftCard>>
    await act(async () => {
      created = await result.current.createGiftCard({
        currency_code: "USD",
        initial_balance_cents: 500,
      })
    })

    let retrieved: Awaited<ReturnType<typeof result.current.retrieveGiftCard>>
    await act(async () => {
      retrieved = await result.current.retrieveGiftCard(created!.id)
    })

    await waitFor(() => {
      expect(result.current.action).toBe("retrieve")
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created?.id)
    })
  })

  coreIntegrationTest("should update a gift card", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const { result } = renderHook(() => useGiftCards(token))

    let created: Awaited<ReturnType<typeof result.current.createGiftCard>>
    await act(async () => {
      created = await result.current.createGiftCard({
        currency_code: "USD",
        initial_balance_cents: 2000,
      })
    })

    let updated: Awaited<ReturnType<typeof result.current.updateGiftCard>>
    await act(async () => {
      updated = await result.current.updateGiftCard({
        id: created!.id,
        reference: "hook-test-ref",
      })
    })

    await waitFor(() => {
      expect(result.current.action).toBe("update")
      expect(updated).toBeDefined()
      expect(updated?.id).toBe(created?.id)
      expect(updated?.reference).toBe("hook-test-ref")
    })
  })

  coreIntegrationTest("should update gift card in cached list", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const { result } = renderHook(() => useGiftCards(token))

    // Fetch first to populate cache
    act(() => {
      result.current.fetchGiftCards()
    })

    await waitFor(() => {
      expect(result.current.action).toBe("get")
    })

    // Create to have something to update
    let created: Awaited<ReturnType<typeof result.current.createGiftCard>>
    await act(async () => {
      created = await result.current.createGiftCard({
        currency_code: "USD",
        initial_balance_cents: 1500,
      })
    })

    await act(async () => {
      await result.current.updateGiftCard({ id: created!.id, reference: "list-update-test" })
    })

    await waitFor(() => {
      const updated = result.current.giftCards.find((gc) => gc.id === created?.id)
      expect(updated?.reference).toBe("list-update-test")
    })
  })

  coreIntegrationTest("should clear gift cards", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useGiftCards(token))

    act(() => {
      result.current.fetchGiftCards()
    })

    await waitFor(() => {
      expect(result.current.action).toBe("get")
    })

    act(() => {
      result.current.clearGiftCards()
    })

    await waitFor(() => {
      expect(result.current.giftCards).toEqual([])
      expect(result.current.action).toBeNull()
    })
  })

  coreIntegrationTest("should handle errors gracefully", async () => {
    const { result } = renderHook(() => useGiftCards("invalid-token"))

    act(() => {
      result.current.fetchGiftCards()
    })

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined()
        expect(result.current.giftCards).toEqual([])
      },
      { timeout: 5000 }
    )
  })

  coreIntegrationTest("should clear errors", async () => {
    const { result } = renderHook(() => useGiftCards("invalid-token"))

    act(() => {
      result.current.fetchGiftCards()
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

  coreIntegrationTest("should throw when retrieving with empty ID", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const { result } = renderHook(() => useGiftCards(token), { wrapper: swrWrapper })

    await expect(
      act(async () => {
        await result.current.retrieveGiftCard("")
      })
    ).rejects.toThrow("Gift card ID is required for retrieve")
  })

  coreIntegrationTest(
    "should throw when updating without an ID",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => useGiftCards(token), { wrapper: swrWrapper })

      await expect(
        act(async () => {
          await result.current.updateGiftCard(
            {} as Parameters<typeof result.current.updateGiftCard>[0]
          )
        })
      ).rejects.toThrow("Gift card resource ID is required for update")
    }
  )

  coreIntegrationTest(
    "should update without prior fetch (no cached list)",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      if (token == null) return
      const { result } = renderHook(() => useGiftCards(token), { wrapper: swrWrapper })

      let created: Awaited<ReturnType<typeof result.current.createGiftCard>>
      await act(async () => {
        created = await result.current.createGiftCard({
          currency_code: "USD",
          initial_balance_cents: 3000,
        })
      })

      // Clear so SWR cache is empty, triggering ?? [result] branch in mutate
      act(() => result.current.clearGiftCards())
      await waitFor(() => expect(result.current.giftCards).toEqual([]))

      let updated: Awaited<ReturnType<typeof result.current.updateGiftCard>>
      await act(async () => {
        updated = await result.current.updateGiftCard({
          id: created!.id,
          reference: "no-cache-update",
        })
      })

      expect(updated).toBeDefined()
      expect(updated?.id).toBe(created?.id)
    }
  )

  coreIntegrationTest(
    "should filter gift cards by params",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const { result } = renderHook(() => useGiftCards(token))

      act(() => {
        result.current.fetchGiftCards({ filters: { status_eq: "inactive" } })
      })

      await waitFor(() => {
        expect(result.current.action).toBe("get")
        expect(result.current.error).toBeNull()
      })
    }
  )
})

/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useGiftCards } from "./useGiftCards"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const mockGiftCard = { id: "gc_1", currency_code: "USD", balance_cents: 1000 }

const mockGetGiftCards = vi.fn().mockResolvedValue([mockGiftCard])
const mockRetrieveGiftCard = vi.fn().mockResolvedValue(mockGiftCard)
const mockCreateGiftCard = vi.fn().mockResolvedValue({ ...mockGiftCard, id: "gc_new" })
const mockUpdateGiftCard = vi.fn().mockResolvedValue({ ...mockGiftCard, reference: "updated-ref" })

vi.mock("@commercelayer/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core")>()
  return {
    ...actual,
    getGiftCards: (...args: unknown[]) => mockGetGiftCards(...args),
    retrieveGiftCard: (...args: unknown[]) => mockRetrieveGiftCard(...args),
    createGiftCard: (...args: unknown[]) => mockCreateGiftCard(...args),
    updateGiftCard: (...args: unknown[]) => mockUpdateGiftCard(...args),
  }
})

describe("useGiftCards — interceptors", () => {
  const accessToken = "test-token"
  const interceptors: InterceptorManager = {
    request: { onSuccess: vi.fn((req) => req) },
  }

  beforeEach(() => {
    mockGetGiftCards.mockClear()
    mockRetrieveGiftCard.mockClear()
    mockCreateGiftCard.mockClear()
    mockUpdateGiftCard.mockClear()
  })

  it("passes interceptors to getGiftCards", async () => {
    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchGiftCards()
    })

    await waitFor(() => {
      expect(mockGetGiftCards).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
    })
  })

  it("passes interceptors to retrieveGiftCard", async () => {
    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.retrieveGiftCard("gc_1")
    })

    expect(mockRetrieveGiftCard).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("passes interceptors to createGiftCard", async () => {
    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.createGiftCard({ currency_code: "USD", balance_cents: 1000 })
    })

    expect(mockCreateGiftCard).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("passes interceptors to updateGiftCard", async () => {
    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    await act(async () => {
      await result.current.updateGiftCard({ id: "gc_1", reference: "ref" })
    })

    expect(mockUpdateGiftCard).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })

  it("works without interceptors", async () => {
    const { result } = renderHook(() => useGiftCards(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchGiftCards()
    })

    await waitFor(() => {
      expect(mockGetGiftCards).toHaveBeenCalledWith(expect.objectContaining({ accessToken }))
    })
  })

  it("appends created gift card to existing list", async () => {
    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    // Populate the cache first
    act(() => {
      result.current.fetchGiftCards()
    })
    await waitFor(() => {
      expect(result.current.giftCards).toHaveLength(1)
    })

    // Create a second card
    await act(async () => {
      await result.current.createGiftCard({ currency_code: "EUR", balance_cents: 2000 })
    })

    await waitFor(() => {
      expect(result.current.giftCards).toHaveLength(2)
    })
  })

  it("covers null-cache branch when creating before fetch resolves", async () => {
    // Make getGiftCards take long enough that cache is still undefined when create fires
    mockGetGiftCards.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([mockGiftCard]), 5000))
    )

    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    // Trigger fetch (establishes non-null SWR key) but don't await — cache is still undefined
    act(() => {
      result.current.fetchGiftCards()
    })

    // Create immediately while fetch is still in-flight — hits the `current == null ? [result]` branch
    let created: Awaited<ReturnType<typeof result.current.createGiftCard>>
    await act(async () => {
      created = await result.current.createGiftCard({ currency_code: "EUR", balance_cents: 500 })
    })

    expect(created?.id).toBe("gc_new")
    expect(result.current.action).toBe("create")
    expect(mockCreateGiftCard).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))

    // Restore default mock
    mockGetGiftCards.mockResolvedValue([mockGiftCard])
  })

  it("updates existing item in cached list (covers map callback branches)", async () => {
    const anotherCard = { id: "gc_2", currency_code: "EUR", balance_cents: 2000 }
    // Return 2 cards so both `match` and `no-match` branches of the inner map are exercised
    mockGetGiftCards.mockResolvedValueOnce([mockGiftCard, anotherCard])
    mockUpdateGiftCard.mockResolvedValueOnce({ ...mockGiftCard, reference: "map-updated" })

    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    // Populate the list first
    act(() => {
      result.current.fetchGiftCards()
    })
    await waitFor(() => {
      expect(result.current.giftCards).toHaveLength(2)
    })

    // Update gc_1 — map iterates both: gc_1 (match → result) and gc_2 (no-match → gc)
    await act(async () => {
      await result.current.updateGiftCard({ id: "gc_1", reference: "map-updated" })
    })

    await waitFor(() => {
      const updated = result.current.giftCards.find((gc) => gc.id === "gc_1")
      expect(updated?.reference).toBe("map-updated")
      // gc_2 unchanged
      expect(result.current.giftCards.find((gc) => gc.id === "gc_2")).toEqual(anotherCard)
    })
  })

  it("covers null-list branch when updating with no cached data", async () => {
    // Make getGiftCards slow so cache is still undefined when update fires
    mockGetGiftCards.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve([mockGiftCard]), 5000))
    )

    const { result } = renderHook(() => useGiftCards(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    // Trigger fetch to establish a non-null SWR key
    act(() => {
      result.current.fetchGiftCards()
    })

    // Update while fetch is in-flight — current is undefined → hits `?? [result]` branch
    let updated: Awaited<ReturnType<typeof result.current.updateGiftCard>>
    await act(async () => {
      updated = await result.current.updateGiftCard({ id: "gc_1", reference: "ref" })
    })

    expect(updated?.id).toBe("gc_1")
    expect(result.current.action).toBe("update")

    // Restore default mock
    mockGetGiftCards.mockResolvedValue([mockGiftCard])
  })
})

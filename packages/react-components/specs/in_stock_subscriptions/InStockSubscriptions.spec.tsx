import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InStockSubscriptions } from "#components/in_stock_subscriptions/InStockSubscriptions"
import CommerceLayerContext from "#context/CommerceLayerContext"
import InStockSubscriptionContext from "#context/InStockSubscriptionContext"

const mockHookSetInStockSubscription = vi.fn().mockResolvedValue(undefined)
const mockUseInStockSubscriptions = vi.fn()

vi.mock("@commercelayer/react-hooks-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/react-hooks-components")>()
  return {
    ...actual,
    useInStockSubscriptions: (...args: unknown[]) => mockUseInStockSubscriptions(...args),
  }
})

function defaultHookReturn(overrides = {}) {
  return {
    isLoading: false,
    setInStockSubscription: mockHookSetInStockSubscription,
    ...overrides,
  }
}

function Providers({
  accessToken = "test-token",
  children,
}: {
  accessToken?: string
  children: ReactNode
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

describe("InStockSubscriptions component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseInStockSubscriptions.mockReturnValue(defaultHookReturn())
  })

  it("renders children", () => {
    render(
      <Providers>
        <InStockSubscriptions>
          <span data-testid="child">content</span>
        </InStockSubscriptions>
      </Providers>
    )

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("passes accessToken to useInStockSubscriptions", () => {
    render(
      <Providers accessToken="ctx-token">
        <InStockSubscriptions>
          <span />
        </InStockSubscriptions>
      </Providers>
    )

    expect(mockUseInStockSubscriptions).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "ctx-token" })
    )
  })

  it("provides setInStockSubscription via InStockSubscriptionContext", () => {
    let capturedSetter: unknown = null

    function Consumer() {
      const { setInStockSubscription } = useContext(InStockSubscriptionContext)
      capturedSetter = setInStockSubscription
      return null
    }

    render(
      <Providers>
        <InStockSubscriptions>
          <Consumer />
        </InStockSubscriptions>
      </Providers>
    )

    expect(capturedSetter).toBeTypeOf("function")
  })

  it("setInStockSubscription returns { success: true } on success", async () => {
    mockHookSetInStockSubscription.mockResolvedValueOnce(undefined)

    let capturedSetter: ((p: { skuCode: string }) => Promise<{ success: boolean }>) | undefined

    function Consumer() {
      const { setInStockSubscription } = useContext(InStockSubscriptionContext)
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      capturedSetter = setInStockSubscription as any
      return null
    }

    render(
      <Providers>
        <InStockSubscriptions>
          <Consumer />
        </InStockSubscriptions>
      </Providers>
    )

    let result: { success: boolean } | undefined
    await act(async () => {
      result = await capturedSetter?.({ skuCode: "SKU001" })
    })

    expect(result).toEqual({ success: true })
  })

  it("setInStockSubscription returns { success: false } and sets errors on failure", async () => {
    mockHookSetInStockSubscription.mockRejectedValueOnce({
      errors: [{ code: "ERR", message: "fail", source: {} }],
    })

    let capturedCtx: { errors: unknown; setInStockSubscription: unknown } = {
      errors: null,
      setInStockSubscription: null,
    }

    function Consumer() {
      const ctx = useContext(InStockSubscriptionContext)
      capturedCtx = { errors: ctx.errors, setInStockSubscription: ctx.setInStockSubscription }
      return null
    }

    render(
      <Providers>
        <InStockSubscriptions>
          <Consumer />
        </InStockSubscriptions>
      </Providers>
    )

    let result: { success: boolean } | undefined
    await act(async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      result = await (capturedCtx.setInStockSubscription as any)?.({ skuCode: "SKU001" })
    })

    expect(result).toEqual({ success: false })
    expect(capturedCtx.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "ERR", resource: "in_stock_subscriptions" }),
      ])
    )
  })

  it("setInStockSubscription returns { success: false } and sets empty errors when error has no .errors array", async () => {
    mockHookSetInStockSubscription.mockRejectedValueOnce(new Error("plain error"))

    let capturedCtx: { errors: unknown; setInStockSubscription: unknown } = {
      errors: null,
      setInStockSubscription: null,
    }

    function Consumer() {
      const ctx = useContext(InStockSubscriptionContext)
      capturedCtx = { errors: ctx.errors, setInStockSubscription: ctx.setInStockSubscription }
      return null
    }

    render(
      <Providers>
        <InStockSubscriptions>
          <Consumer />
        </InStockSubscriptions>
      </Providers>
    )

    let result: { success: boolean } | undefined
    await act(async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      result = await (capturedCtx.setInStockSubscription as any)?.({ skuCode: "SKU001" })
    })

    expect(result).toEqual({ success: false })
    expect(capturedCtx.errors).toEqual([])
  })

  it("clears errors after a successful call", async () => {
    mockHookSetInStockSubscription.mockRejectedValueOnce({
      errors: [{ code: "ERR", message: "fail", source: {} }],
    })

    let capturedCtx: { errors: unknown; setInStockSubscription: unknown } = {
      errors: null,
      setInStockSubscription: null,
    }

    function Consumer() {
      const ctx = useContext(InStockSubscriptionContext)
      capturedCtx = { errors: ctx.errors, setInStockSubscription: ctx.setInStockSubscription }
      return null
    }

    render(
      <Providers>
        <InStockSubscriptions>
          <Consumer />
        </InStockSubscriptions>
      </Providers>
    )

    await act(async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      await (capturedCtx.setInStockSubscription as any)?.({ skuCode: "SKU001" })
    })

    mockHookSetInStockSubscription.mockResolvedValueOnce(undefined)

    await act(async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      await (capturedCtx.setInStockSubscription as any)?.({ skuCode: "SKU001" })
    })

    expect(capturedCtx.errors).toEqual([])
  })

  it("provides empty errors array initially", () => {
    let capturedErrors: unknown = null

    function Consumer() {
      const { errors } = useContext(InStockSubscriptionContext)
      capturedErrors = errors
      return null
    }

    render(
      <Providers>
        <InStockSubscriptions>
          <Consumer />
        </InStockSubscriptions>
      </Providers>
    )

    expect(capturedErrors).toEqual([])
  })
})

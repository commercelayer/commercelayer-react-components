import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import InStockSubscriptionsContainer from "#components/in_stock_subscriptions/InStockSubscriptionsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import InStockSubscriptionContext from "#context/InStockSubscriptionContext"

const mockUseInStockSubscriptions = vi.fn()

vi.mock("@commercelayer/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/hooks")>()
  return {
    ...actual,
    useInStockSubscriptions: (...args: unknown[]) => mockUseInStockSubscriptions(...args),
  }
})

function defaultHookReturn(overrides = {}) {
  return {
    isLoading: false,
    setInStockSubscription: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

describe("InStockSubscriptionsContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    mockUseInStockSubscriptions.mockReturnValue(defaultHookReturn())
  })

  it("renders children", async () => {
    await act(async () => {
      render(
        <Providers>
          <InStockSubscriptionsContainer>
            <span data-testid="child">content</span>
          </InStockSubscriptionsContainer>
        </Providers>
      )
    })

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("warns in dev", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      render(
        <Providers>
          <InStockSubscriptionsContainer>
            <span>child</span>
          </InStockSubscriptionsContainer>
        </Providers>
      )
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[InStockSubscriptionsContainer] is deprecated")
    )
    warnSpy.mockRestore()
  })

  it("does not warn in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      render(
        <Providers>
          <InStockSubscriptionsContainer>
            <span>child</span>
          </InStockSubscriptionsContainer>
        </Providers>
      )
    })

    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it("delegates to InStockSubscriptions: provides InStockSubscriptionContext with setInStockSubscription", async () => {
    let capturedSetter: unknown = null

    function Consumer() {
      const { setInStockSubscription } = useContext(InStockSubscriptionContext)
      capturedSetter = setInStockSubscription
      return null
    }

    await act(async () => {
      render(
        <Providers>
          <InStockSubscriptionsContainer>
            <Consumer />
          </InStockSubscriptionsContainer>
        </Providers>
      )
    })

    expect(capturedSetter).toBeTypeOf("function")
  })
})

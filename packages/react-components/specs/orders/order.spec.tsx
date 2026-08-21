import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import { vi } from "vitest"
import { Order } from "#components/orders/Order"
import { OrderContainer } from "#components/orders/OrderContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import OrderStorageContext from "#context/OrderStorageContext"
import { useOrderContainer } from "#hooks/useOrderContainer"

/**
 * Mock useOrderState so tests stay synchronous and don't require real API calls.
 * The hook is the internal engine of both <Order> and <OrderContainer>; we only
 * need to verify the component wiring, not the state machine itself.
 */
vi.mock("#hooks/useOrderState", () => ({
  useOrderState: vi.fn(() => defaultOrderContext),
}))

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

const storageCtxValue = {
  persistKey: undefined,
  clearWhenPlaced: false,
  getLocalOrder: vi.fn(),
  setLocalOrder: vi.fn(),
  deleteLocalOrder: vi.fn(),
}

/**
 * Minimal wrapper that supplies CommerceLayerContext and OrderStorageContext,
 * mirroring the real usage: <CommerceLayer> wraps <Order>.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: FAKE_TOKEN }}>
      <OrderStorageContext.Provider value={storageCtxValue}>
        {children}
      </OrderStorageContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// <Order>
// ---------------------------------------------------------------------------

describe("Order component", () => {
  it("renders children", () => {
    render(
      <Wrapper>
        <Order orderId="test-order-id">
          <span data-testid="child">hello</span>
        </Order>
      </Wrapper>
    )
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("provides OrderContext to children", () => {
    let capturedCtx: typeof defaultOrderContext | null = null

    function Consumer() {
      capturedCtx = useContext(OrderContext)
      return null
    }

    render(
      <Wrapper>
        <Order orderId="test-order-id">
          <Consumer />
        </Order>
      </Wrapper>
    )

    expect(capturedCtx).not.toBeNull()
  })

  it("throws when rendered outside <CommerceLayer>", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)

    expect(() =>
      render(
        <Order orderId="test-order-id">
          <span />
        </Order>
      )
    ).toThrow("Cannot use <Order/> outside of <CommerceLayer/>")

    consoleSpy.mockRestore()
  })

  it("renders multiple children", () => {
    render(
      <Wrapper>
        <Order orderId="test-order-id">
          <span data-testid="child-1">one</span>
          <span data-testid="child-2">two</span>
        </Order>
      </Wrapper>
    )
    expect(screen.getByTestId("child-1")).toBeDefined()
    expect(screen.getByTestId("child-2")).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// <OrderContainer> — deprecated wrapper
// ---------------------------------------------------------------------------

describe("OrderContainer component (deprecated)", () => {
  it("renders children (delegates to <Order>)", () => {
    render(
      <Wrapper>
        <OrderContainer orderId="test-order-id">
          <span data-testid="oc-child">content</span>
        </OrderContainer>
      </Wrapper>
    )
    expect(screen.getByTestId("oc-child")).toBeDefined()
  })

  it("emits console.warn deprecation notice in non-production env", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    render(
      <Wrapper>
        <OrderContainer orderId="test-order-id">
          <span />
        </OrderContainer>
      </Wrapper>
    )

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("<OrderContainer> is deprecated"))
    warnSpy.mockRestore()
  })

  it("does NOT emit console.warn in production env", () => {
    vi.stubEnv("NODE_ENV", "production")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    render(
      <Wrapper>
        <OrderContainer orderId="test-order-id">
          <span />
        </OrderContainer>
      </Wrapper>
    )

    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it("provides OrderContext to children via <Order>", () => {
    let capturedCtx: typeof defaultOrderContext | null = null

    function Consumer() {
      capturedCtx = useContext(OrderContext)
      return null
    }

    render(
      <Wrapper>
        <OrderContainer orderId="test-order-id">
          <Consumer />
        </OrderContainer>
      </Wrapper>
    )

    expect(capturedCtx).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// useOrderContainer hook
// ---------------------------------------------------------------------------

describe("useOrderContainer hook", () => {
  it("throws when used outside <Order>", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)

    function BadConsumer() {
      useOrderContainer()
      return null
    }

    expect(() => render(<BadConsumer />)).toThrow(
      "Cannot use `useOrderContainer` outside of <Order/>"
    )

    consoleSpy.mockRestore()
  })

  it("returns order context when inside <Order>", () => {
    const mockOrder = {
      id: "ord-1",
      type: "orders",
      status: "pending",
    }
    const mockCtx = {
      ...defaultOrderContext,
      order: mockOrder as any,
      getOrder: vi.fn().mockResolvedValue(mockOrder),
      addToCart: vi.fn(),
      createOrder: vi.fn(),
    }

    let result: ReturnType<typeof useOrderContainer> | null = null

    function Consumer() {
      result = useOrderContainer()
      return null
    }

    render(
      <OrderContext.Provider value={mockCtx}>
        <Consumer />
      </OrderContext.Provider>
    )

    expect(result).not.toBeNull()
    expect(result!.order).toEqual(mockOrder)
  })
})

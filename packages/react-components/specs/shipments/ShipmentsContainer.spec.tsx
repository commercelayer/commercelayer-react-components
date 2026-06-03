import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ShipmentsContainer from "#components/shipments/ShipmentsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShipmentContext from "#context/ShipmentContext"

const mockUseShipments = vi.fn()

vi.mock("@commercelayer/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/hooks")>()
  return {
    ...actual,
    useShipments: (...args: unknown[]) => mockUseShipments(...args),
  }
})

function defaultHookReturn(overrides = {}) {
  return {
    shipments: [{ id: "ship_1", available_shipping_methods: [{ id: "sm_1" }] }],
    deliveryLeadTimes: [],
    isLoading: false,
    isValidating: false,
    error: null,
    setShippingMethod: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn(),
    mutate: vi.fn(),
    ...overrides,
  }
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          orderId: "order-1",
          // biome-ignore lint/suspicious/noExplicitAny: test cast
          order: { id: "order-1", status: "pending", shipments: [] } as any,
        }}
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("ShipmentsContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    mockUseShipments.mockReturnValue(defaultHookReturn())
  })

  it("warns in dev", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      render(
        <Providers>
          <ShipmentsContainer>
            <span>child</span>
          </ShipmentsContainer>
        </Providers>
      )
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[ShipmentsContainer] is deprecated")
    )
    warnSpy.mockRestore()
  })

  it("does not warn in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      render(
        <Providers>
          <ShipmentsContainer>
            <span>child</span>
          </ShipmentsContainer>
        </Providers>
      )
    })

    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it("renders children", async () => {
    await act(async () => {
      render(
        <Providers>
          <ShipmentsContainer>
            <span data-testid="child">child</span>
          </ShipmentsContainer>
        </Providers>
      )
    })

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("delegates to Shipments: provides ShipmentContext with setShippingMethod", async () => {
    let capturedSetShippingMethod: unknown = null

    function Consumer() {
      const { setShippingMethod } = useContext(ShipmentContext)
      capturedSetShippingMethod = setShippingMethod
      return null
    }

    await act(async () => {
      render(
        <Providers>
          <ShipmentsContainer>
            <Consumer />
          </ShipmentsContainer>
        </Providers>
      )
    })

    expect(capturedSetShippingMethod).toBeTypeOf("function")
  })

  it("forwards loader prop to Shipments", async () => {
    mockUseShipments.mockReturnValue(defaultHookReturn({ isLoading: true }))

    await act(async () => {
      render(
        <Providers>
          <ShipmentsContainer loader={<span data-testid="loader">Loading…</span>}>
            <span data-testid="child">content</span>
          </ShipmentsContainer>
        </Providers>
      )
    })

    expect(screen.getByTestId("loader")).toBeDefined()
    expect(screen.queryByTestId("child")).toBeNull()
  })
})

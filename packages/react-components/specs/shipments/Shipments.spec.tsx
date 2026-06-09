import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Shipments } from "#components/shipments/Shipments"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShipmentContext from "#context/ShipmentContext"

const MOCK_SHIPMENTS = [
  {
    id: "ship_1",
    available_shipping_methods: [{ id: "sm_1", name: "Standard" }],
  },
  {
    id: "ship_2",
    available_shipping_methods: [{ id: "sm_2", name: "Express" }],
  },
]

const MOCK_DELIVERY_LEAD_TIMES = [{ id: "dlt_1", shipping_method: { id: "sm_1" } }]

const mockHookSetShippingMethod = vi.fn().mockResolvedValue(undefined)
const mockMutate = vi.fn()

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
    shipments: MOCK_SHIPMENTS,
    deliveryLeadTimes: MOCK_DELIVERY_LEAD_TIMES,
    isLoading: false,
    isValidating: false,
    error: null,
    setShippingMethod: mockHookSetShippingMethod,
    reload: vi.fn(),
    mutate: mockMutate,
    ...overrides,
  }
}

// biome-ignore lint/suspicious/noExplicitAny: test cast
const MOCK_ORDER_PENDING = { id: "order-1", status: "pending", shipments: MOCK_SHIPMENTS } as any

function Providers({
  accessToken = "token",
  orderId = "order-1",
  order = MOCK_ORDER_PENDING,
  getOrder = vi.fn().mockResolvedValue(MOCK_ORDER_PENDING),
  children,
}: {
  accessToken?: string
  orderId?: string
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  order?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  getOrder?: any
  children: ReactNode
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken }}>
      <OrderContext.Provider value={{ ...defaultOrderContext, orderId, order, getOrder }}>
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("Shipments component", () => {
  beforeEach(() => {
    mockUseShipments.mockReturnValue(defaultHookReturn())
    mockHookSetShippingMethod.mockClear()
    vi.clearAllMocks()
    mockUseShipments.mockReturnValue(defaultHookReturn())
  })

  it("renders children when not loading", () => {
    render(
      <Providers>
        <Shipments>
          <span data-testid="child">content</span>
        </Shipments>
      </Providers>
    )

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("renders the loader while isLoading is true", () => {
    mockUseShipments.mockReturnValue(defaultHookReturn({ isLoading: true }))

    render(
      <Providers>
        <Shipments loader={<span data-testid="loader">Loading…</span>}>
          <span data-testid="child">content</span>
        </Shipments>
      </Providers>
    )

    expect(screen.getByTestId("loader")).toBeDefined()
    expect(screen.queryByTestId("child")).toBeNull()
  })

  it("hides the loader and shows children when isLoading is false", () => {
    mockUseShipments.mockReturnValue(defaultHookReturn({ isLoading: false }))

    render(
      <Providers>
        <Shipments loader={<span data-testid="loader">Loading…</span>}>
          <span data-testid="child">content</span>
        </Shipments>
      </Providers>
    )

    expect(screen.queryByTestId("loader")).toBeNull()
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("provides shipments via ShipmentContext to children", () => {
    let capturedShipments: unknown = null

    function Consumer() {
      const { shipments } = useContext(ShipmentContext)
      capturedShipments = shipments
      return null
    }

    render(
      <Providers>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    expect(capturedShipments).toEqual(MOCK_SHIPMENTS)
  })

  it("provides null shipments via context when hook returns empty array", () => {
    mockUseShipments.mockReturnValue(defaultHookReturn({ shipments: [] }))

    let capturedShipments: unknown = "NOT_SET"

    function Consumer() {
      const { shipments } = useContext(ShipmentContext)
      capturedShipments = shipments
      return null
    }

    render(
      <Providers>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    expect(capturedShipments).toBeNull()
  })

  it("provides deliveryLeadTimes via ShipmentContext", () => {
    let capturedTimes: unknown = null

    function Consumer() {
      const { deliveryLeadTimes } = useContext(ShipmentContext)
      capturedTimes = deliveryLeadTimes
      return null
    }

    render(
      <Providers>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    expect(capturedTimes).toEqual(MOCK_DELIVERY_LEAD_TIMES)
  })

  it("passes accessToken and orderId to useShipments", () => {
    render(
      <Providers accessToken="ctx-token" orderId="ctx-order">
        <Shipments>
          <span />
        </Shipments>
      </Providers>
    )

    expect(mockUseShipments).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "ctx-token", orderId: "ctx-order" })
    )
  })

  it("sets NO_SHIPPING_METHODS error when a shipment has no available shipping methods", async () => {
    const shipmentNoMethods = [
      { id: "ship_1", available_shipping_methods: [] },
      { id: "ship_2", available_shipping_methods: [{ id: "sm_1" }] },
    ]
    mockUseShipments.mockReturnValue(defaultHookReturn({ shipments: shipmentNoMethods }))

    let capturedErrors: unknown = null

    function Consumer() {
      const { errors } = useContext(ShipmentContext)
      capturedErrors = errors
      return null
    }

    await act(async () => {
      render(
        <Providers order={{ ...MOCK_ORDER_PENDING, shipments: shipmentNoMethods }}>
          <Shipments>
            <Consumer />
          </Shipments>
        </Providers>
      )
    })

    expect(capturedErrors).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "NO_SHIPPING_METHODS" })])
    )
  })

  it("sets OUT_OF_STOCK error when a sku line item has insufficient inventory", async () => {
    const orderWithOutOfStock = {
      ...MOCK_ORDER_PENDING,
      line_items: [
        {
          id: "li_1",
          item_type: "skus",
          quantity: 5,
          // @ts-expect-error test
          item: { inventory: { quantity: 2 } },
        },
      ],
    }
    mockUseShipments.mockReturnValue(defaultHookReturn({ shipments: [] }))

    let capturedErrors: unknown = null

    function Consumer() {
      const { errors } = useContext(ShipmentContext)
      capturedErrors = errors
      return null
    }

    await act(async () => {
      render(
        <Providers order={orderWithOutOfStock}>
          <Shipments>
            <Consumer />
          </Shipments>
        </Providers>
      )
    })

    expect(capturedErrors).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "OUT_OF_STOCK" })])
    )
  })

  it("does not set OUT_OF_STOCK error when all stock line items have sufficient inventory", async () => {
    const shipmentsWithStock = [
      {
        ...MOCK_SHIPMENTS[0],
        stock_line_items: [
          {
            id: "sli_1",
            quantity: 2,
            // @ts-expect-error test
            item: { inventory: { quantity: 10 } },
          },
        ],
      },
    ]
    const orderWithStock = {
      ...MOCK_ORDER_PENDING,
      // @ts-expect-error test
      line_items: [{ id: "li_1", item_type: "skus", quantity: 2, item: { inventory: { quantity: 10 } } }],
    }
    mockUseShipments.mockReturnValue(defaultHookReturn({ shipments: shipmentsWithStock as any }))

    let capturedErrors: unknown = null

    function Consumer() {
      const { errors } = useContext(ShipmentContext)
      capturedErrors = errors
      return null
    }

    await act(async () => {
      render(
        <Providers order={orderWithStock}>
          <Shipments>
            <Consumer />
          </Shipments>
        </Providers>
      )
    })

    expect(capturedErrors).toEqual([])
  })

  it("setShippingMethod calls hook and returns success with refreshed order", async () => {
    const refreshedOrder = { ...MOCK_ORDER_PENDING, id: "order-1" }
    const getOrder = vi.fn().mockResolvedValue(refreshedOrder)

    let capturedSetShippingMethod: ((id: string, smId: string) => Promise<unknown>) | undefined

    function Consumer() {
      const { setShippingMethod } = useContext(ShipmentContext)
      capturedSetShippingMethod = setShippingMethod
      return null
    }

    render(
      <Providers getOrder={getOrder}>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    let result: unknown
    await act(async () => {
      result = await capturedSetShippingMethod?.("ship_1", "sm_1")
    })

    expect(mockHookSetShippingMethod).toHaveBeenCalledWith("ship_1", "sm_1")
    expect(getOrder).toHaveBeenCalledWith("order-1")
    expect(result).toEqual({ success: true, order: refreshedOrder })
  })

  it("setShippingMethod returns success: false when order cannot be placed", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const placedOrder = { id: "order-1", status: "placed", shipments: MOCK_SHIPMENTS } as any

    let capturedSetShippingMethod: ((id: string, smId: string) => Promise<unknown>) | undefined

    function Consumer() {
      const { setShippingMethod } = useContext(ShipmentContext)
      capturedSetShippingMethod = setShippingMethod
      return null
    }

    render(
      <Providers order={placedOrder}>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    let result: unknown
    await act(async () => {
      result = await capturedSetShippingMethod?.("ship_1", "sm_1")
    })

    expect(mockHookSetShippingMethod).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, order: placedOrder })
  })

  it("setShippingMethod returns success: true without order when orderId is not available", async () => {
    let capturedSetShippingMethod: ((id: string, smId: string) => Promise<unknown>) | undefined

    function Consumer() {
      const { setShippingMethod } = useContext(ShipmentContext)
      capturedSetShippingMethod = setShippingMethod
      return null
    }

    render(
      <CommerceLayerContext.Provider value={{ accessToken: "token" }}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
        <OrderContext.Provider value={{ ...defaultOrderContext, orderId: null as any, order: MOCK_ORDER_PENDING }}>
          <Shipments>
            <Consumer />
          </Shipments>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )

    let result: unknown
    await act(async () => {
      result = await capturedSetShippingMethod?.("ship_1", "sm_1")
    })

    expect(mockHookSetShippingMethod).toHaveBeenCalledWith("ship_1", "sm_1")
    expect(result).toEqual({ success: true })
  })

  it("setShippingMethod returns success: false when the hook throws", async () => {
    mockHookSetShippingMethod.mockRejectedValueOnce(new Error("Network error"))

    let capturedSetShippingMethod: ((id: string, smId: string) => Promise<unknown>) | undefined

    function Consumer() {
      const { setShippingMethod } = useContext(ShipmentContext)
      capturedSetShippingMethod = setShippingMethod
      return null
    }

    render(
      <Providers>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    let result: unknown
    await act(async () => {
      result = await capturedSetShippingMethod?.("ship_1", "sm_1")
    })

    expect(result).toEqual({ success: false })
  })

  it("does not cause infinite re-renders when useShipments returns a new array reference on every call", async () => {
    // Regression test for "Maximum update depth exceeded".
    // When useShipments returns a new shipments array reference on every render (unstable identity),
    // the old cleanup setErrors([]) + setErrors(nextErrors) on every effect run caused an infinite loop.
    // The fix: remove the cleanup and use a functional updater that bails out when errors are unchanged.
    let callCount = 0
    mockUseShipments.mockImplementation(() => {
      callCount++
      return {
        ...defaultHookReturn(),
        // New array reference on every call — simulates unstable hook return
        shipments: [...MOCK_SHIPMENTS],
      }
    })

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    await act(async () => {
      render(
        <Providers>
          <Shipments>
            <span data-testid="child">content</span>
          </Shipments>
        </Providers>
      )
    })

    const errorCalls = consoleError.mock.calls.map((c) => String(c[0]))
    expect(errorCalls.some((msg) => msg.includes("Maximum update depth exceeded"))).toBe(false)
    // Component should stabilise after 1-3 renders — well under the 50-render React limit
    expect(callCount).toBeLessThan(10)
    expect(screen.getByTestId("child")).toBeDefined()
    consoleError.mockRestore()
  })

  it("setShipmentErrors updates the errors in context", async () => {
    let capturedCtx: { errors: unknown; setShipmentErrors: ((...args: unknown[]) => void) | undefined } = {
      errors: null,
      setShipmentErrors: undefined,
    }

    function Consumer() {
      const { errors, setShipmentErrors } = useContext(ShipmentContext)
      capturedCtx = { errors, setShipmentErrors }
      return null
    }

    render(
      <Providers>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    await act(async () => {
      capturedCtx.setShipmentErrors?.([
        { code: "CUSTOM_ERROR", message: "custom", resource: "shipments" },
      ])
    })

    expect(capturedCtx.errors).toEqual([
      expect.objectContaining({ code: "CUSTOM_ERROR" }),
    ])
  })
})

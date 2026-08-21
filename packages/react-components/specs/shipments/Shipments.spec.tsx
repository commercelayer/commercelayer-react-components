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
const mockReload = vi.fn()

const mockUseShipments = vi.fn()

vi.mock("@commercelayer/react-hooks-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/react-hooks-components")>()
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
    reload: mockReload,
    mutate: mockMutate,
    ...overrides,
  }
}

const ORDER_UPDATED_AT = "2026-08-12T10:00:00.000Z"

const MOCK_ORDER_PENDING = {
  id: "order-1",
  status: "pending",
  updated_at: ORDER_UPDATED_AT,
  shipments: MOCK_SHIPMENTS,
  // biome-ignore lint/suspicious/noExplicitAny: test cast
} as any

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
      line_items: [
        { id: "li_1", item_type: "skus", quantity: 2, item: { inventory: { quantity: 10 } } },
      ],
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
        <OrderContext.Provider
          value={{ ...defaultOrderContext, orderId: null as any, order: MOCK_ORDER_PENDING }}
        >
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

  it("keeps the same errors array when a recompute yields identical error codes", async () => {
    // The errors effect bails out via a functional updater when the recomputed codes
    // match, so repeated order updates don't hand children a new array each time and
    // spin the render loop. Needs a non-empty error to actually run the comparison.
    mockUseShipments.mockReturnValue(
      defaultHookReturn({
        shipments: [{ id: "ship_1", available_shipping_methods: [] }],
      })
    )

    const seen: unknown[] = []
    function Consumer() {
      const { errors } = useContext(ShipmentContext)
      seen.push(errors)
      return null
    }

    const tree = (order: unknown) => (
      <Providers order={order}>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    const { rerender } = render(tree(MOCK_ORDER_PENDING))

    await act(async () => {
      rerender(tree({ ...MOCK_ORDER_PENDING, updated_at: "2026-08-12T10:05:00.000Z" }))
    })

    const withErrors = seen.filter(
      (e): e is Array<{ code: string }> => Array.isArray(e) && e.length > 0
    )
    expect(withErrors[0]?.[0]?.code).toBe("NO_SHIPPING_METHODS")
    // Same identity across the recompute — the updater returned `prev`.
    expect(new Set(withErrors).size).toBe(1)
  })

  describe("revalidating shipments when the order changes", () => {
    // Regression tests for "shipping method stays selected after applying a coupon".
    // The API clears `shipment.shipping_method` server-side whenever the order totals
    // change, because shipping method availability depends on them. The shipments SWR
    // cache is keyed on (accessToken, orderId) alone with revalidateOnFocus/Reconnect
    // off, so it never revalidated on its own: the cached shipment kept a shipping
    // method the order no longer had, <ShippingMethodRadioButton> stayed checked on it,
    // and re-clicking a checked radio fires no change event — so the user was stuck
    // with a disabled save button and no way to re-select.

    // Every "does not reload" assertion below is paired with a positive control in the
    // same test — a real order revision that MUST refetch. Without it, a test asserting
    // only "reload was not called" would also pass if the revalidation effect were
    // deleted outright, i.e. it would guard nothing. Each test names the specific broken
    // implementation it exists to kill.
    const NEXT_REVISION = "2026-08-12T10:05:00.000Z"
    const LATER_REVISION = "2026-08-12T10:10:00.000Z"

    function renderScenario({
      order,
      getOrder,
      children = <span data-testid="child">content</span>,
    }: {
      order: unknown
      getOrder?: unknown
      children?: ReactNode
    }) {
      const tree = (o: unknown) => (
        <Providers order={o} getOrder={getOrder}>
          <Shipments>{children}</Shipments>
        </Providers>
      )
      const view = render(tree(order))
      return {
        ...view,
        async showOrder(next: unknown) {
          await act(async () => {
            view.rerender(tree(next))
          })
        },
      }
    }

    it("reloads shipments when order.updated_at changes (e.g. a coupon is applied)", async () => {
      // The bug itself: applying a coupon bumps the order revision and nulls
      // shipping_method server-side, so the shipments cache must refetch.
      // Kills: no revalidation effect at all (the original implementation).
      const { showOrder } = renderScenario({ order: MOCK_ORDER_PENDING })

      expect(mockReload).not.toHaveBeenCalled()

      await showOrder({
        ...MOCK_ORDER_PENDING,
        coupon_code: "test50off",
        updated_at: NEXT_REVISION,
      })

      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it("reloads once per order revision, not once per render", async () => {
      // Kills: refetching on every render that carries a revision differing from the
      // one the effect last acted on, rather than stamping it as synced.
      const orderWithCoupon = { ...MOCK_ORDER_PENDING, updated_at: NEXT_REVISION }
      const { showOrder } = renderScenario({ order: MOCK_ORDER_PENDING })

      await showOrder(orderWithCoupon)
      await showOrder(orderWithCoupon)
      await showOrder(orderWithCoupon)

      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it("does not reload on mount, only once the order moves on", async () => {
      // Kills: dropping the first-order-seen guard, which would make mount treat the
      // very first revision as a change and refetch shipments we just fetched.
      const { showOrder } = renderScenario({ order: MOCK_ORDER_PENDING })

      expect(mockReload).not.toHaveBeenCalled()

      // Positive control: the effect is live, so the assertion above is about the
      // mount guard rather than about a missing mechanism.
      await showOrder({ ...MOCK_ORDER_PENDING, updated_at: NEXT_REVISION })
      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it("does not refetch on every render when the hook returns a fresh reload identity", async () => {
      // `reload` is a dependency of the revalidation effect, so an unstable identity
      // re-runs the effect on every single render.
      // Kills: relying on the dependency array alone and dropping the
      // `syncedOrderUpdatedAt.current === updatedAt` short-circuit.
      mockUseShipments.mockImplementation(() => ({
        ...defaultHookReturn(),
        reload: (...args: unknown[]) => mockReload(...args),
      }))

      const { showOrder } = renderScenario({ order: MOCK_ORDER_PENDING })

      await showOrder(MOCK_ORDER_PENDING)
      await showOrder(MOCK_ORDER_PENDING)
      await showOrder(MOCK_ORDER_PENDING)

      expect(mockReload).not.toHaveBeenCalled()

      // Positive control, with the identity still churning on every render.
      await showOrder({ ...MOCK_ORDER_PENDING, updated_at: NEXT_REVISION })
      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it("suppresses only the order revision produced by our own setShippingMethod", async () => {
      // `hookSetShippingMethod` already revalidates the cache, so refetching for the
      // order update it caused is a redundant round trip.
      // Kills: dropping the stamp in setShippingMethod. The coupon step then proves the
      // suppression is scoped to our own revision and does not deafen the effect.
      const orderAfterSelection = { ...MOCK_ORDER_PENDING, updated_at: NEXT_REVISION }
      const getOrder = vi.fn().mockResolvedValue(orderAfterSelection)

      let capturedSetShippingMethod: ((id: string, smId: string) => Promise<unknown>) | undefined

      function Consumer() {
        const { setShippingMethod } = useContext(ShipmentContext)
        capturedSetShippingMethod = setShippingMethod
        return null
      }

      const { showOrder } = renderScenario({
        order: MOCK_ORDER_PENDING,
        getOrder,
        children: <Consumer />,
      })

      await act(async () => {
        await capturedSetShippingMethod?.("ship_1", "sm_1")
      })

      // OrderContext now carries the revision our own update produced.
      await showOrder(orderAfterSelection)

      expect(mockHookSetShippingMethod).toHaveBeenCalledWith("ship_1", "sm_1")
      expect(mockReload).not.toHaveBeenCalled()

      // Positive control: an order change we did NOT cause must still refetch.
      await showOrder({
        ...orderAfterSelection,
        coupon_code: "test50off",
        updated_at: LATER_REVISION,
      })
      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it("does not reload when an order revision goes missing", async () => {
      // A partial or optimistic order object without `updated_at` must not read as a
      // new revision.
      // Kills: dropping the `updatedAt == null` guard, which would compare the stamped
      // revision against undefined, see a difference, and refetch.
      const { showOrder } = renderScenario({ order: MOCK_ORDER_PENDING })

      await showOrder({ ...MOCK_ORDER_PENDING, updated_at: undefined })
      expect(mockReload).not.toHaveBeenCalled()

      // Positive control: the next real revision still refetches, so the guard skipped
      // the update without desynchronising the stamped revision.
      await showOrder({ ...MOCK_ORDER_PENDING, updated_at: NEXT_REVISION })
      expect(mockReload).toHaveBeenCalledTimes(1)
    })
  })

  it("setShipmentErrors updates the errors in context", async () => {
    let capturedCtx: {
      errors: unknown
      setShipmentErrors: ((...args: unknown[]) => void) | undefined
    } = {
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

    expect(capturedCtx.errors).toEqual([expect.objectContaining({ code: "CUSTOM_ERROR" })])
  })

  it("provides a stable setShippingMethod reference across renders (does not change on re-render)", async () => {
    // Regression test: setShippingMethod was recreated on every Shipments render.
    // Shipment.tsx has setShippingMethod in its useEffect deps, so an unstable
    // reference caused the effect to re-run on every render → infinite loop.
    const references = new Set<unknown>()
    // Use a stable getOrder mock — a new vi.fn() on every render would incorrectly
    // invalidate the useCallback that wraps setShippingMethod.
    const stableGetOrder = vi.fn().mockResolvedValue(MOCK_ORDER_PENDING)

    function Consumer() {
      const { setShippingMethod } = useContext(ShipmentContext)
      references.add(setShippingMethod)
      return null
    }

    const { rerender } = render(
      <Providers getOrder={stableGetOrder}>
        <Shipments>
          <Consumer />
        </Shipments>
      </Providers>
    )

    await act(async () => {
      rerender(
        <Providers getOrder={stableGetOrder}>
          <Shipments>
            <Consumer />
          </Shipments>
        </Providers>
      )
    })

    // setShippingMethod should be the same reference across renders
    expect(references.size).toBe(1)
  })
})

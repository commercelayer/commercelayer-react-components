import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Shipment } from "#components/shipments/Shipment"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"
import ShipmentContext from "#context/ShipmentContext"

const SHIPPING_METHOD_A = { id: "sm_1", name: "Standard" }
const SHIPPING_METHOD_B = { id: "sm_2", name: "Express" }

function makeShipment(overrides = {}) {
  return {
    id: "ship_1",
    available_shipping_methods: [SHIPPING_METHOD_A, SHIPPING_METHOD_B],
    shipping_method: SHIPPING_METHOD_A,
    stock_line_items: [
      { quantity: 3, line_item: { id: "li_1", name: "T-shirt", quantity: 1 } },
      { quantity: 1, line_item: null },
    ],
    stock_transfers: [{ id: "st_1" }],
    parcels: [{ id: "parcel_1" }],
    stock_location: { id: "loc_1" },
    ...overrides,
  }
}

const DELIVERY_LEAD_TIMES = [
  { id: "dlt_1", stock_location: { id: "loc_1" } },
  { id: "dlt_2", stock_location: { id: "loc_other" } },
]

const mockSetShippingMethod = vi.fn()

/** Captures whatever ShipmentChildrenContext the component publishes. */
let captured: ReturnType<typeof useContext<typeof ShipmentChildrenContext>> | undefined

function Capture() {
  captured = useContext(ShipmentChildrenContext)
  return <span data-testid="child">child</span>
}

function renderShipment({
  shipments,
  deliveryLeadTimes = DELIVERY_LEAD_TIMES,
  autoSelectSingleShippingMethod,
}: {
  shipments: unknown
  deliveryLeadTimes?: unknown
  autoSelectSingleShippingMethod?: boolean | ((order?: unknown) => void)
}) {
  return render(
    <ShipmentContext.Provider
      value={
        {
          shipments,
          deliveryLeadTimes,
          setShippingMethod: mockSetShippingMethod,
          // biome-ignore lint/suspicious/noExplicitAny: test cast
        } as any
      }
    >
      <Shipment
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        autoSelectSingleShippingMethod={autoSelectSingleShippingMethod as any}
        loader={<span data-testid="loader">loading</span>}
      >
        <Capture />
      </Shipment>
    </ShipmentContext.Provider>
  )
}

describe("Shipment", () => {
  beforeEach(() => {
    captured = undefined
    vi.clearAllMocks()
    mockSetShippingMethod.mockResolvedValue({ success: true, order: { id: "order-1" } })
  })

  it("shows the loader until shipments resolve", () => {
    renderShipment({ shipments: null })

    expect(screen.getByTestId("loader")).toBeDefined()
    expect(screen.queryByTestId("child")).toBeNull()
  })

  it("falls back to the default loader when none is supplied", () => {
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <ShipmentContext.Provider value={{ shipments: null } as any}>
        <Shipment>
          <Capture />
        </Shipment>
      </ShipmentContext.Provider>
    )

    expect(screen.getByText("Loading...")).toBeDefined()
  })

  it("renders one child subtree per shipment once loaded", async () => {
    renderShipment({ shipments: [makeShipment(), makeShipment({ id: "ship_2" })] })

    await waitFor(() => {
      expect(screen.getAllByTestId("child")).toHaveLength(2)
    })
  })

  it("publishes the shipment's derived data on ShipmentChildrenContext", async () => {
    renderShipment({ shipments: [makeShipment()] })

    await waitFor(() => expect(captured).toBeDefined())

    // Line items are lifted out of stock_line_items, with the stock quantity copied
    // onto the line item — and a null line_item is passed through untouched.
    expect(captured?.lineItems).toEqual([{ id: "li_1", name: "T-shirt", quantity: 3 }, null])
    expect(captured?.shippingMethods).toEqual([SHIPPING_METHOD_A, SHIPPING_METHOD_B])
    expect(captured?.parcels).toEqual([{ id: "parcel_1" }])
    expect(captured?.stockTransfers).toEqual([{ id: "st_1" }])
    expect(captured?.keyNumber).toBe("ship_1")
    // Only lead times for this shipment's stock location.
    expect(captured?.deliveryLeadTimes).toEqual([{ id: "dlt_1", stock_location: { id: "loc_1" } }])
  })

  it("derives currentShippingMethodId from the shipment's saved shipping method", async () => {
    // This is the hop that carried a stale selection in the coupon bug: the radio
    // button's checked state is driven entirely by this value.
    renderShipment({ shipments: [makeShipment()] })

    await waitFor(() => expect(captured?.currentShippingMethodId).toBe("sm_1"))
  })

  it("reports no current shipping method once the order clears it", async () => {
    // Applying a coupon nulls shipping_method server-side; nothing may stay selected.
    renderShipment({ shipments: [makeShipment({ shipping_method: null })] })

    await waitFor(() => expect(captured).toBeDefined())
    expect(captured?.currentShippingMethodId).toBeUndefined()
  })

  it("publishes no lead times when the shipment has no stock location", async () => {
    renderShipment({ shipments: [makeShipment({ stock_location: undefined })] })

    await waitFor(() => expect(captured).toBeDefined())
    expect(captured?.deliveryLeadTimes).toEqual([])
  })

  it("tolerates lead times being absent entirely", async () => {
    renderShipment({ shipments: [makeShipment()], deliveryLeadTimes: null })

    await waitFor(() => expect(captured).toBeDefined())
    expect(captured?.deliveryLeadTimes).toBeUndefined()
  })

  describe("autoSelectSingleShippingMethod", () => {
    it("auto-selects when the shipment has exactly one method and none chosen", async () => {
      const onAutoSelect = vi.fn()

      renderShipment({
        shipments: [
          makeShipment({
            shipping_method: null,
            available_shipping_methods: [SHIPPING_METHOD_A],
          }),
        ],
        autoSelectSingleShippingMethod: onAutoSelect,
      })

      await waitFor(() => {
        expect(mockSetShippingMethod).toHaveBeenCalledWith("ship_1", "sm_1")
      })
      // The callback receives the order returned by setShippingMethod.
      await waitFor(() => expect(onAutoSelect).toHaveBeenCalledWith({ id: "order-1" }))
    })

    it("stays on the loader while auto-selection is in flight", async () => {
      // The effect only clears `loading` on the branch that skips auto-selection, so a
      // shipment being auto-selected keeps showing the loader.
      renderShipment({
        shipments: [
          makeShipment({
            shipping_method: null,
            available_shipping_methods: [SHIPPING_METHOD_A],
          }),
        ],
        autoSelectSingleShippingMethod: true,
      })

      await waitFor(() => expect(mockSetShippingMethod).toHaveBeenCalled())
      expect(screen.getByTestId("loader")).toBeDefined()
      expect(screen.queryByTestId("child")).toBeNull()
    })

    it("prefers the lone available method over the saved one when auto-selecting", async () => {
      // With auto-select on and exactly one method available, currentShippingMethodId
      // comes from that method rather than from `shipment.shipping_method`. Saved and
      // available deliberately differ so the two branches are distinguishable.
      renderShipment({
        shipments: [
          makeShipment({
            shipping_method: SHIPPING_METHOD_B,
            available_shipping_methods: [SHIPPING_METHOD_A],
          }),
        ],
        autoSelectSingleShippingMethod: true,
      })

      await waitFor(() => expect(captured).toBeDefined())
      expect(captured?.currentShippingMethodId).toBe("sm_1")
    })

    it("does not fire the callback when the update fails", async () => {
      mockSetShippingMethod.mockResolvedValue({ success: false })
      const onAutoSelect = vi.fn()

      renderShipment({
        shipments: [
          makeShipment({
            shipping_method: null,
            available_shipping_methods: [SHIPPING_METHOD_A],
          }),
        ],
        autoSelectSingleShippingMethod: onAutoSelect,
      })

      await waitFor(() => expect(mockSetShippingMethod).toHaveBeenCalled())
      expect(onAutoSelect).not.toHaveBeenCalled()
    })

    it("does not auto-select when more than one method is available", async () => {
      renderShipment({
        shipments: [makeShipment({ shipping_method: null })],
        autoSelectSingleShippingMethod: true,
      })

      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeDefined()
      })
      expect(mockSetShippingMethod).not.toHaveBeenCalled()
    })

    it("does not auto-select when a shipping method is already chosen", async () => {
      renderShipment({
        shipments: [makeShipment({ available_shipping_methods: [SHIPPING_METHOD_A] })],
        autoSelectSingleShippingMethod: true,
      })

      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeDefined()
      })
      expect(mockSetShippingMethod).not.toHaveBeenCalled()
    })

    it("tolerates a missing setShippingMethod on the context", async () => {
      render(
        <ShipmentContext.Provider
          value={
            {
              shipments: [
                makeShipment({
                  shipping_method: null,
                  available_shipping_methods: [SHIPPING_METHOD_A],
                }),
              ],
              deliveryLeadTimes: DELIVERY_LEAD_TIMES,
              setShippingMethod: undefined,
              // biome-ignore lint/suspicious/noExplicitAny: test cast
            } as any
          }
        >
          <Shipment autoSelectSingleShippingMethod loader={<span>loading</span>}>
            <Capture />
          </Shipment>
        </ShipmentContext.Provider>
      )

      // Stays on the loader rather than throwing: there is nothing to select with.
      await act(async () => {})
      expect(mockSetShippingMethod).not.toHaveBeenCalled()
    })

    it("skips a shipment with no available shipping methods at all", async () => {
      renderShipment({
        shipments: [makeShipment({ shipping_method: null, available_shipping_methods: null })],
        autoSelectSingleShippingMethod: true,
      })

      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeDefined()
      })
      expect(mockSetShippingMethod).not.toHaveBeenCalled()
    })
  })
})

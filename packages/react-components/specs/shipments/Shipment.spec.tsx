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

    function autoSelectTree(onAutoSelect: unknown) {
      return (shipments: unknown) => (
        <ShipmentContext.Provider
          value={
            {
              shipments,
              deliveryLeadTimes: DELIVERY_LEAD_TIMES,
              setShippingMethod: mockSetShippingMethod,
              // biome-ignore lint/suspicious/noExplicitAny: test cast
            } as any
          }
        >
          <Shipment
            // biome-ignore lint/suspicious/noExplicitAny: test cast
            autoSelectSingleShippingMethod={onAutoSelect as any}
            loader={<span data-testid="loader">loading</span>}
          >
            <Capture />
          </Shipment>
        </ShipmentContext.Provider>
      )
    }

    function unselected() {
      return [
        makeShipment({ shipping_method: null, available_shipping_methods: [SHIPPING_METHOD_A] }),
      ]
    }

    function deferSelection() {
      let resolve: (value: unknown) => void = () => {}
      mockSetShippingMethod.mockReturnValueOnce(
        new Promise((r) => {
          resolve = r
        })
      )
      return (value: unknown = { success: true, order: { id: "order-1" } }) =>
        act(async () => {
          resolve(value)
        })
    }

    function selected() {
      return [makeShipment({ available_shipping_methods: [SHIPPING_METHOD_A] })]
    }

    it("does not auto-select the same shipment twice while the data catches up", async () => {
      // A refetch that started before the selection lands while it is in
      // flight, before the API reports the method as set, so the effect re-runs
      // on identical data with a new identity. Selecting again is harmless
      // server-side but tells a caller's callback — analytics, in practice —
      // about it a second time. The refetch the selection makes itself, after
      // its PATCH, does show the method.
      const resolveSelection = deferSelection()
      const onAutoSelect = vi.fn()
      const tree = autoSelectTree(onAutoSelect)

      const { rerender } = render(tree(unselected()))
      await waitFor(() => expect(mockSetShippingMethod).toHaveBeenCalledTimes(1))

      await act(async () => {
        rerender(tree(unselected()))
      })
      await act(async () => {
        rerender(tree(selected()))
      })
      await resolveSelection()

      expect(mockSetShippingMethod).toHaveBeenCalledTimes(1)
      expect(onAutoSelect).toHaveBeenCalledTimes(1)
    })

    it("selects again at once when the selection's own refetch shows the method cleared", async () => {
      // Kills: waiting for a later `shipments` update to notice the reset.
      // A coupon applied while the selection is in flight clears the method
      // (#887), and the refetch inside the selection already shows it gone. The
      // refetches after it bring the very same data, and SWR hands back the
      // previous array when a refetch is deep-equal to it, so the effect is
      // never re-run: the shipment stayed unselected and the step on the loader.
      const resolveFirst = deferSelection()
      const tree = autoSelectTree(true)

      const { rerender } = render(tree(unselected()))
      await waitFor(() => expect(mockSetShippingMethod).toHaveBeenCalledTimes(1))

      // The refetch inside the selection already reflects the coupon's reset.
      await act(async () => {
        rerender(tree(unselected()))
      })
      const resolveSecond = deferSelection()
      await resolveFirst()

      // No further `shipments` update arrives, and the shipment is selected again.
      expect(mockSetShippingMethod).toHaveBeenCalledTimes(2)
      expect(mockSetShippingMethod).toHaveBeenLastCalledWith("ship_1", "sm_1")

      await act(async () => {
        rerender(tree(selected()))
      })
      await resolveSecond()
      expect(mockSetShippingMethod).toHaveBeenCalledTimes(2)
      await waitFor(() => expect(screen.getByTestId("child")).toBeDefined())
    })

    it("selects again when the method is cleared by a later update", async () => {
      // The other way a reset shows up: the selection's own refetch has the
      // method, and a later one, with a new identity, has it gone.
      const resolveSelection = deferSelection()
      const tree = autoSelectTree(true)

      const { rerender } = render(tree(unselected()))
      await waitFor(() => expect(mockSetShippingMethod).toHaveBeenCalledTimes(1))
      await act(async () => {
        rerender(tree(selected()))
      })
      await resolveSelection()
      expect(mockSetShippingMethod).toHaveBeenCalledTimes(1)

      deferSelection()
      await act(async () => {
        rerender(tree(unselected()))
      })
      expect(mockSetShippingMethod).toHaveBeenCalledTimes(2)
    })

    it("stops selecting again when the API never reports the method as set", async () => {
      // A bound, not a loop: every selection succeeds and every refetch still
      // shows no method.
      const tree = autoSelectTree(true)

      render(tree(unselected()))
      await act(async () => {})

      expect(mockSetShippingMethod).toHaveBeenCalledTimes(3)
    })

    it("selects again when a selection that failed sees the shipment still unselected", async () => {
      mockSetShippingMethod.mockResolvedValueOnce({ success: false })
      const tree = autoSelectTree(true)

      const { rerender } = render(tree(unselected()))
      await waitFor(() => expect(mockSetShippingMethod).toHaveBeenCalledTimes(1))

      deferSelection()
      await act(async () => {
        rerender(tree(unselected()))
      })

      expect(mockSetShippingMethod).toHaveBeenCalledTimes(2)
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

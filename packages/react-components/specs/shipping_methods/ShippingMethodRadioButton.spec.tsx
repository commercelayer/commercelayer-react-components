import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ShippingMethodRadioButton } from "#components/shipping_methods/ShippingMethodRadioButton"
import ShipmentContext, { defaultShipmentContext } from "#context/ShipmentContext"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"
import { MOCK_SHIPPING_METHOD, ShipmentContextProvider, ShippingMethodProvider } from "./helpers"

function renderRadioButton({
  currentShippingMethodId = "sm_1",
  setShippingMethod = vi.fn().mockResolvedValue({ success: true }),
  onChange,
}: {
  currentShippingMethodId?: string
  setShippingMethod?: (id: string, smId: string) => Promise<{ success: boolean; order?: object }>
  onChange?: (params: object) => void
} = {}) {
  return render(
    <ShipmentContextProvider setShippingMethod={setShippingMethod}>
      <ShippingMethodProvider
        shippingMethod={MOCK_SHIPPING_METHOD}
        currentShippingMethodId={currentShippingMethodId}
        shipmentId="ship_1"
      >
        <ShippingMethodRadioButton onChange={onChange} data-testid="radio" />
      </ShippingMethodProvider>
    </ShipmentContextProvider>
  )
}

describe("ShippingMethodRadioButton component", () => {
  it("renders a radio input", () => {
    renderRadioButton()

    const radio = screen.getByTestId("radio")
    expect(radio.getAttribute("type")).toBe("radio")
  })

  it("is checked when shippingMethodId matches currentShippingMethodId", () => {
    renderRadioButton({ currentShippingMethodId: "sm_1" })

    const radio = screen.getByTestId("radio") as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it("is unchecked when shippingMethodId does not match currentShippingMethodId", () => {
    renderRadioButton({ currentShippingMethodId: "sm_99" })

    const radio = screen.getByTestId("radio") as HTMLInputElement
    expect(radio.checked).toBe(false)
  })

  it("sets name to shipment-{shipmentId}", () => {
    renderRadioButton()

    const radio = screen.getByTestId("radio")
    expect(radio.getAttribute("name")).toBe("shipment-ship_1")
  })

  it("sets id to shipment-{shipmentId}-{shippingMethodId}", () => {
    renderRadioButton()

    const radio = screen.getByTestId("radio")
    expect(radio.getAttribute("id")).toBe("shipment-ship_1-sm_1")
  })

  it("calls setShippingMethod when the radio is clicked", async () => {
    const setShippingMethod = vi.fn().mockResolvedValue({ success: true })

    renderRadioButton({ currentShippingMethodId: "sm_99", setShippingMethod })

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    expect(setShippingMethod).toHaveBeenCalledWith("ship_1", "sm_1")
  })

  it("calls onChange callback with shippingMethod, shipmentId and order after setShippingMethod", async () => {
    const mockOrder = { id: "order-1" }
    const setShippingMethod = vi.fn().mockResolvedValue({ success: true, order: mockOrder })
    const onChange = vi.fn()

    renderRadioButton({ currentShippingMethodId: "sm_99", setShippingMethod, onChange })

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    expect(onChange).toHaveBeenCalledWith({
      shippingMethod: MOCK_SHIPPING_METHOD,
      shipmentId: "ship_1",
      order: mockOrder,
    })
  })

  it("renders children render-prop", () => {
    const setShippingMethod = vi.fn().mockResolvedValue({ success: true })

    render(
      <ShipmentContextProvider setShippingMethod={setShippingMethod}>
        <ShippingMethodProvider
          shippingMethod={MOCK_SHIPPING_METHOD}
          currentShippingMethodId="sm_1"
          shipmentId="ship_1"
        >
          <ShippingMethodRadioButton>
            {({ shippingMethod }) => <span data-testid="custom-radio">{shippingMethod?.id}</span>}
          </ShippingMethodRadioButton>
        </ShippingMethodProvider>
      </ShipmentContextProvider>
    )

    expect(screen.getByTestId("custom-radio").textContent).toBe("sm_1")
  })

  it("does not call setShippingMethod when shipmentId is absent", async () => {
    const setShippingMethod = vi.fn().mockResolvedValue({ success: true })

    render(
      <ShipmentContext.Provider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        value={{ ...defaultShipmentContext, setShippingMethod: setShippingMethod as any }}
      >
        <ShippingMethodChildrenContext.Provider
          value={{
            // biome-ignore lint/suspicious/noExplicitAny: test cast
            shippingMethod: MOCK_SHIPPING_METHOD as any,
            currentShippingMethodId: "sm_99",
            shipmentId: undefined,
          }}
        >
          <ShippingMethodRadioButton data-testid="radio" />
        </ShippingMethodChildrenContext.Provider>
      </ShipmentContext.Provider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    expect(setShippingMethod).not.toHaveBeenCalled()
  })

  it("does not call setShippingMethod when it is not provided in context", async () => {
    render(
      <ShipmentContextProvider>
        <ShippingMethodProvider
          shippingMethod={MOCK_SHIPPING_METHOD}
          currentShippingMethodId="sm_99"
          shipmentId="ship_1"
        >
          <ShippingMethodRadioButton data-testid="radio" />
        </ShippingMethodProvider>
      </ShipmentContextProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    // no crash, no setShippingMethod call
  })

  it("name and id use empty strings when shippingMethodId is absent", () => {
    render(
      <ShipmentContextProvider>
        <ShippingMethodProvider
          // biome-ignore lint/suspicious/noExplicitAny: test cast
          shippingMethod={{ ...MOCK_SHIPPING_METHOD, id: undefined } as any}
          shipmentId="ship_1"
        >
          <ShippingMethodRadioButton data-testid="radio" />
        </ShippingMethodProvider>
      </ShipmentContextProvider>
    )

    const radio = screen.getByTestId("radio")
    expect(radio.getAttribute("name")).toBe("shipment-ship_1")
    expect(radio.getAttribute("id")).toBe("shipment-ship_1-")
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ShippingMethodName } from "#components/shipping_methods/ShippingMethodName"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"
import { MOCK_SHIPPING_METHOD, ShippingMethodProvider } from "./helpers"

describe("ShippingMethodName component", () => {
  it("renders a label with the shipping method name", () => {
    render(
      <ShippingMethodProvider>
        <ShippingMethodName />
      </ShippingMethodProvider>
    )

    expect(screen.getByText("Standard Shipping")).toBeDefined()
  })

  it("renders a label element by default", () => {
    render(
      <ShippingMethodProvider>
        <ShippingMethodName data-testid="name-label" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("name-label").tagName.toLowerCase()).toBe("label")
  })

  it("sets htmlFor to shipment-{shipmentId}-{shippingMethodId}", () => {
    render(
      <ShippingMethodProvider shipmentId="ship_1" shippingMethod={MOCK_SHIPPING_METHOD}>
        <ShippingMethodName data-testid="name-label" />
      </ShippingMethodProvider>
    )

    const label = screen.getByTestId("name-label")
    expect(label.getAttribute("for")).toBe("shipment-ship_1-sm_1")
  })

  it("renders children render-prop with shippingMethod and label", () => {
    render(
      <ShippingMethodProvider>
        <ShippingMethodName>
          {({ label }) => <span data-testid="custom-name">{label}</span>}
        </ShippingMethodName>
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("custom-name").textContent).toBe("Standard Shipping")
  })

  it("produces empty htmlFor when both shipmentId and shippingMethod.id are absent", () => {
    render(
      <ShippingMethodChildrenContext.Provider
        value={{ shippingMethod: undefined, shipmentId: undefined }}
      >
        <ShippingMethodName data-testid="name-label" />
      </ShippingMethodChildrenContext.Provider>
    )

    // `shipment-${undefined ?? ""}-${undefined?.id ?? ""}` → "shipment--" which is truthy, so || "" is not used
    const label = screen.getByTestId("name-label")
    expect(label.getAttribute("for")).toBe("shipment--")
  })
})

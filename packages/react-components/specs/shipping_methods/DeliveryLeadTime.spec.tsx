import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DeliveryLeadTime } from "#components/shipping_methods/DeliveryLeadTime"
import { ShippingMethodProvider } from "./helpers"

describe("DeliveryLeadTime component", () => {
  it("renders min_hours", () => {
    render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="min_hours" data-testid="dlt" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").textContent).toBe("24")
  })

  it("renders max_hours", () => {
    render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="max_hours" data-testid="dlt" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").textContent).toBe("48")
  })

  it("renders min_days", () => {
    render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="min_days" data-testid="dlt" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").textContent).toBe("1")
  })

  it("renders max_days", () => {
    render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="max_days" data-testid="dlt" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").textContent).toBe("2")
  })

  it("renders empty when no deliveryLeadTimeForShipment is set", () => {
    render(
      <ShippingMethodProvider deliveryLeadTimeForShipment={null}>
        <DeliveryLeadTime type="min_hours" data-testid="dlt" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").textContent).toBe("")
  })

  it("renders children render-prop with the lead time value", () => {
    render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="min_days">
          {({ text }) => <span data-testid="custom-dlt">{String(text)}</span>}
        </DeliveryLeadTime>
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("custom-dlt").textContent).toBe("1")
  })

  it("passes extra span props through", () => {
    render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="max_days" data-testid="dlt" className="lead-time" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").getAttribute("class")).toBe("lead-time")
  })

  it("clears the value on unmount", () => {
    const { unmount } = render(
      <ShippingMethodProvider>
        <DeliveryLeadTime type="min_hours" data-testid="dlt" />
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("dlt").textContent).toBe("24")
    unmount()
  })
})

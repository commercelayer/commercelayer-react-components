import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ShippingMethodPrice } from "#components/shipping_methods/ShippingMethodPrice"
import { MOCK_SHIPPING_METHOD, ShippingMethodProvider } from "./helpers"

const FREE_METHOD = {
  ...MOCK_SHIPPING_METHOD,
  price_amount_for_shipment_cents: 0,
  formatted_price_amount_for_shipment: "€0.00",
}

const EXTERNAL_METHOD = {
  ...MOCK_SHIPPING_METHOD,
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  scheme: "external" as any,
}

describe("ShippingMethodPrice component", () => {
  it("renders the formatted price amount for a paid shipping method", () => {
    render(
      <ShippingMethodProvider>
        <ShippingMethodPrice />
      </ShippingMethodProvider>
    )

    expect(screen.getByText("€5.00")).toBeDefined()
  })

  it('shows "Free" label when price is zero', () => {
    render(
      <ShippingMethodProvider shippingMethod={FREE_METHOD}>
        <ShippingMethodPrice />
      </ShippingMethodProvider>
    )

    expect(screen.getByText("Free")).toBeDefined()
  })

  it("shows custom labelFreeOver when price is zero", () => {
    render(
      <ShippingMethodProvider shippingMethod={FREE_METHOD}>
        <ShippingMethodPrice labelFreeOver="Gratis" />
      </ShippingMethodProvider>
    )

    expect(screen.getByText("Gratis")).toBeDefined()
  })

  it("shows external label when scheme is external", () => {
    render(
      <ShippingMethodProvider shippingMethod={EXTERNAL_METHOD}>
        <ShippingMethodPrice />
      </ShippingMethodProvider>
    )

    expect(screen.getByText("Price estimates after the shipping method selection")).toBeDefined()
  })

  it("shows custom labelExternal when scheme is external", () => {
    render(
      <ShippingMethodProvider shippingMethod={EXTERNAL_METHOD}>
        <ShippingMethodPrice labelExternal="External price" />
      </ShippingMethodProvider>
    )

    expect(screen.getByText("External price")).toBeDefined()
  })

  it("renders children render-prop with price", () => {
    render(
      <ShippingMethodProvider>
        <ShippingMethodPrice>
          {({ price }) => <span data-testid="custom-price">{price}</span>}
        </ShippingMethodPrice>
      </ShippingMethodProvider>
    )

    expect(screen.getByTestId("custom-price").textContent).toBe("€5.00")
  })

  it("renders nothing meaningful when shippingMethod is absent", () => {
    render(
      <ShippingMethodProvider shippingMethod={null}>
        <ShippingMethodPrice data-testid="price" />
      </ShippingMethodProvider>
    )

    // price stays empty string and priceCents stays 0, so "Free" is shown
    expect(screen.getByTestId("price").textContent).toBe("Free")
  })
})

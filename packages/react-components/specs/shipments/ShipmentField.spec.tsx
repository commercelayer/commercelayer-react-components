import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { ShipmentField } from "#components/shipments/ShipmentField"
import ShipmentChildrenContext, {
  type InitialShipmentContext,
} from "#context/ShipmentChildrenContext"

const SHIPMENT = {
  id: "ship_1",
  number: "#1234",
  currency_code: "EUR",
  status: "draft",
  cost_amount_cents: 500,
  cost_amount_float: 5,
  formatted_cost_amount: "€5,00",
}

function withContext(children: ReactNode, overrides: Partial<InitialShipmentContext> = {}) {
  return render(
    <ShipmentChildrenContext.Provider
      value={
        {
          keyNumber: 2,
          shipment: SHIPMENT,
          ...overrides,
          // biome-ignore lint/suspicious/noExplicitAny: test cast
        } as any
      }
    >
      {children}
    </ShipmentChildrenContext.Provider>
  )
}

describe("ShipmentField", () => {
  it.each([
    ["number", "#1234"],
    ["currency_code", "EUR"],
    ["status", "draft"],
    ["cost_amount_cents", "500"],
    ["cost_amount_float", "5"],
    ["formatted_cost_amount", "€5,00"],
  ])("renders the %s attribute", (name, expected) => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising every ShipmentAttribute
    withContext(<ShipmentField data-testid="field" name={name as any} />)

    expect(screen.getByTestId("field").textContent).toBe(expected)
  })

  it("renders keyNumber rather than a shipment attribute for key_number", () => {
    // `key_number` is synthesised by <Shipment>, not a field on the resource.
    withContext(<ShipmentField data-testid="field" name="key_number" />)

    expect(screen.getByTestId("field").textContent).toBe("2")
  })

  it("passes props through to the span", () => {
    withContext(<ShipmentField className="custom" data-testid="field" name="number" />)

    expect(screen.getByTestId("field").className).toBe("custom")
  })

  it("renders nothing for an attribute the shipment does not carry", () => {
    withContext(<ShipmentField data-testid="field" name="number" />, { shipment: undefined })

    expect(screen.getByTestId("field").textContent).toBe("")
  })

  it("hands the shipment to a children function instead of rendering a span", () => {
    withContext(
      <ShipmentField name="number">
        {({ shipment }) => <span data-testid="custom">{`shipment ${shipment?.id}`}</span>}
      </ShipmentField>
    )

    expect(screen.getByTestId("custom").textContent).toBe("shipment ship_1")
    expect(screen.queryByTestId("field")).toBeNull()
  })
})

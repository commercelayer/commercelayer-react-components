import { LineItemAmount } from "#components/line_items/LineItemAmount"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineItemProvider } from "./helpers"

describe("LineItemAmount component", () => {
  it("renders formatted_total_amount by default", () => {
    render(
      <LineItemProvider>
        <LineItemAmount data-testid="line-item-amount" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("line-item-amount").textContent).toBe("€24.00")
  })

  it('renders formatted_unit_amount when type="unit"', () => {
    render(
      <LineItemProvider>
        <LineItemAmount type="unit" data-testid="line-item-unit-amount" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("line-item-unit-amount").textContent).toBe("€12.00")
  })

  it("renders children render-prop with price prop", () => {
    render(
      <LineItemProvider>
        <LineItemAmount>{({ price }) => <span data-testid="custom-amount">{price}</span>}</LineItemAmount>
      </LineItemProvider>
    )

    expect(screen.getByTestId("custom-amount").textContent).toBe("€24.00")
  })

  it("renders an empty string when lineItem is missing", () => {
    render(
      <LineItemProvider lineItem={undefined}>
        <LineItemAmount data-testid="empty-amount" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("empty-amount").textContent).toBe("")
  })
})

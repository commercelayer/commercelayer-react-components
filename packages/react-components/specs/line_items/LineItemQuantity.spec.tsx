import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LineItemQuantity } from "#components/line_items/LineItemQuantity"
import { LineItemProvider, LineItemsProvider } from "./helpers"

describe("LineItemQuantity component", () => {
  it("renders a select with the current quantity selected", () => {
    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemQuantity />
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect((screen.getByTestId("BABYONBU000000E63E7412MX") as HTMLSelectElement).value).toBe("2")
  })

  it("renders a span with quantity when readonly=true", () => {
    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemQuantity readonly data-testid="readonly-quantity" />
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("readonly-quantity").textContent).toBe("2")
  })

  it("calls updateLineItem from context when select changes", () => {
    const mockUpdate = vi.fn()

    render(
      <LineItemsProvider updateLineItem={mockUpdate}>
        <LineItemProvider>
          <LineItemQuantity hasExternalPrice />
        </LineItemProvider>
      </LineItemsProvider>
    )

    fireEvent.change(screen.getByTestId("BABYONBU000000E63E7412MX"), {
      target: { value: "4" },
    })

    expect(mockUpdate).toHaveBeenCalledWith("li_1", 4, true)
  })

  it("renders children render-prop", () => {
    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemQuantity>
            {({ quantity }) => <span data-testid="custom-quantity">{quantity}</span>}
          </LineItemQuantity>
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("custom-quantity").textContent).toBe("2")
  })

  it("renders an empty title and skips updates when lineItem is missing", () => {
    render(
      <LineItemsProvider updateLineItem={vi.fn()}>
        <LineItemProvider lineItem={undefined}>
          <LineItemQuantity data-testid="missing-line-item-quantity" />
        </LineItemProvider>
      </LineItemsProvider>
    )

    const select = screen.getByTestId("missing-line-item-quantity") as HTMLSelectElement
    fireEvent.change(select, { target: { value: "3" } })

    expect(select.getAttribute("title")).toBe("")
  })
})

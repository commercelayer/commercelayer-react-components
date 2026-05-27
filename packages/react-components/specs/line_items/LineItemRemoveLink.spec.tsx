import { LineItemRemoveLink } from "#components/line_items/LineItemRemoveLink"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LineItemProvider, LineItemsProvider } from "./helpers"

describe("LineItemRemoveLink component", () => {
  it('renders a "Remove" link with data-testid', () => {
    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemRemoveLink />
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("line-item-remove-link-BABYONBU000000E63E7412MX").textContent).toBe(
      "Remove"
    )
  })

  it("calls deleteLineItem from context on click", () => {
    const mockDelete = vi.fn()

    render(
      <LineItemsProvider deleteLineItem={mockDelete}>
        <LineItemProvider>
          <LineItemRemoveLink />
        </LineItemProvider>
      </LineItemsProvider>
    )

    fireEvent.click(screen.getByTestId("line-item-remove-link-BABYONBU000000E63E7412MX"))

    expect(mockDelete).toHaveBeenCalledWith("li_1")
  })

  it("calls onClick prop on click", () => {
    const onClick = vi.fn()

    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemRemoveLink onClick={onClick} />
        </LineItemProvider>
      </LineItemsProvider>
    )

    fireEvent.click(screen.getByTestId("line-item-remove-link-BABYONBU000000E63E7412MX"))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it("renders a custom label", () => {
    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemRemoveLink label="Delete item" />
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect(screen.getByText("Delete item")).toBeDefined()
  })

  it("renders children render-prop", () => {
    render(
      <LineItemsProvider>
        <LineItemProvider>
          <LineItemRemoveLink label="Delete item">
            {({ label }) => <span data-testid="custom-remove-link">{label}</span>}
          </LineItemRemoveLink>
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("custom-remove-link").textContent).toBe("Delete item")
  })

  it("renders a fallback test id when lineItem is missing", () => {
    render(
      <LineItemsProvider>
        <LineItemProvider lineItem={undefined}>
          <LineItemRemoveLink />
        </LineItemProvider>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("line-item-remove-link-").textContent).toBe("Remove")
  })
})

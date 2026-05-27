import { LineItemsEmpty } from "#components/line_items/LineItemsEmpty"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineItemsProvider, MOCK_LINE_ITEM } from "./helpers"

describe("LineItemsEmpty component", () => {
  it('renders default text "Your shopping bag is empty" when lineItems is empty', () => {
    render(
      <LineItemsProvider lineItems={[]}>
        <LineItemsEmpty />
      </LineItemsProvider>
    )

    expect(screen.getByText("Your shopping bag is empty")).toBeDefined()
  })

  it("renders custom text when lineItems is empty", () => {
    render(
      <LineItemsProvider lineItems={[]}>
        <LineItemsEmpty text="Nothing here" />
      </LineItemsProvider>
    )

    expect(screen.getByText("Nothing here")).toBeDefined()
  })

  it("renders nothing when lineItems has items", () => {
    const { container } = render(
      <LineItemsProvider lineItems={[MOCK_LINE_ITEM]}>
        <LineItemsEmpty />
      </LineItemsProvider>
    )

    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when lineItems is null or undefined", () => {
    const { container } = render(
      <LineItemsProvider lineItems={undefined}>
        <LineItemsEmpty />
      </LineItemsProvider>
    )

    expect(container.firstChild).toBeNull()
  })

  it("renders children render-prop", () => {
    render(
      <LineItemsProvider lineItems={[]}>
        <LineItemsEmpty>
          {({ quantity, text }) => <span data-testid="custom-empty">{`${quantity}:${text}`}</span>}
        </LineItemsEmpty>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("custom-empty").textContent).toBe("0:Your shopping bag is empty")
  })
})

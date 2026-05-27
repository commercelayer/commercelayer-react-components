import { LineItemField } from "#components/line_items/LineItemField"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineItemProvider } from "./helpers"

describe("LineItemField component", () => {
  it("renders the name attribute from lineItem", () => {
    render(
      <LineItemProvider>
        <LineItemField attribute="name" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("Baby Onesie").textContent).toBe("Baby Onesie")
  })

  it("renders with a custom tagElement", () => {
    render(
      <LineItemProvider>
        <LineItemField attribute="name" tagElement="p" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("Baby Onesie").tagName.toLowerCase()).toBe("p")
  })

  it("renders children render-prop", () => {
    render(
      <LineItemProvider>
        <LineItemField attribute="name">
          {({ attributeValue }) => <span data-testid="custom-field">{String(attributeValue)}</span>}
        </LineItemField>
      </LineItemProvider>
    )

    expect(screen.getByTestId("custom-field").textContent).toBe("Baby Onesie")
  })
})

import { LineItemName } from "#components/line_items/LineItemName"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineItemProvider } from "./helpers"

describe("LineItemName component", () => {
  it("renders lineItem.name in a p tag with data-testid", () => {
    render(
      <LineItemProvider>
        <LineItemName />
      </LineItemProvider>
    )

    const name = screen.getByTestId("line-item-name-BABYONBU000000E63E7412MX")
    expect(name.tagName.toLowerCase()).toBe("p")
    expect(name.textContent).toBe("Baby Onesie")
  })

  it("renders children render-prop", () => {
    render(
      <LineItemProvider>
        <LineItemName>{({ label }) => <span data-testid="custom-name">{label}</span>}</LineItemName>
      </LineItemProvider>
    )

    expect(screen.getByTestId("custom-name").textContent).toBe("Baby Onesie")
  })

  it("renders fallback test id when lineItem is missing", () => {
    render(
      <LineItemProvider lineItem={undefined}>
        <LineItemName />
      </LineItemProvider>
    )

    expect(screen.getByTestId("line-item-name-").textContent).toBe("")
  })
})

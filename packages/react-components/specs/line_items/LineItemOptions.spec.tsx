import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineItemOption } from "#components/line_items/LineItemOption"
import { LineItemOptions } from "#components/line_items/LineItemOptions"
import { buildLineItem, buildLineItemOption, LineItemProvider } from "./helpers"

describe("LineItemOptions component", () => {
  const lineItemOptions = [
    buildLineItemOption(),
    buildLineItemOption({
      name: "Engraving",
      options: { Text: "Hello" },
      sku_option: { id: "sku-opt-2" },
    }),
  ]

  it("renders nothing when line_item_options is empty", () => {
    const { container } = render(
      <LineItemProvider lineItem={buildLineItem({ line_item_options: [] })}>
        <LineItemOptions showAll>
          <LineItemOption />
        </LineItemOptions>
      </LineItemProvider>
    )

    expect(container.firstChild).toBeNull()
  })

  it("renders options with showAll=true", () => {
    render(
      <LineItemProvider lineItem={buildLineItem({ line_item_options: lineItemOptions })}>
        <LineItemOptions showAll titleTagElement="h5" titleClassName="title">
          <LineItemOption />
        </LineItemOptions>
      </LineItemProvider>
    )

    expect(screen.getByText("Customization")).toBeDefined()
    expect(screen.getByText("Engraving")).toBeDefined()
    expect(screen.getByText("Size:")).toBeDefined()
    expect(screen.getByText("Text:")).toBeDefined()
  })

  it("filters options by skuOptionId and can hide the title", () => {
    render(
      <LineItemProvider lineItem={buildLineItem({ line_item_options: lineItemOptions })}>
        <LineItemOptions skuOptionId="sku-opt-2" showName={false} className="option-group">
          <LineItemOption name="Text" />
        </LineItemOptions>
      </LineItemProvider>
    )

    expect(screen.queryByText("Customization")).toBeNull()
    expect(screen.getByText("Text:")).toBeDefined()
    expect(screen.getByText("Hello")).toBeDefined()
  })

  it("renders nothing when lineItem is missing", () => {
    const { container } = render(
      <LineItemProvider lineItem={undefined}>
        <LineItemOptions showAll>
          <LineItemOption />
        </LineItemOptions>
      </LineItemProvider>
    )

    expect(container.firstChild).toBeNull()
  })

  it("falls back to an empty array when line_item_options is undefined", () => {
    const { container } = render(
      <LineItemProvider lineItem={buildLineItem({ line_item_options: undefined })}>
        <LineItemOptions showAll>
          <LineItemOption />
        </LineItemOptions>
      </LineItemProvider>
    )

    expect(container.firstChild).toBeNull()
  })
})

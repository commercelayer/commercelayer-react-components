import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineItemOption } from "#components/line_items/LineItemOption"
import { buildLineItemOption, LineItemOptionProvider } from "./helpers"

describe("LineItemOption component", () => {
  it("renders all options when showAll=true", () => {
    render(
      <LineItemOptionProvider showAll>
        <LineItemOption valueClassName="option-value" />
      </LineItemOptionProvider>
    )

    expect(screen.getByText("Size:")).toBeDefined()
    expect(screen.getByText("Color:")).toBeDefined()
    expect(screen.getByText("M").className).toBe("option-value")
    expect(screen.getByText("Blue").className).toBe("option-value")
  })

  it("renders a specific option when the name prop matches", () => {
    render(
      <LineItemOptionProvider lineItemOption={buildLineItemOption()}>
        <LineItemOption name="Size" tagElement="li" tagContainer="ol" />
      </LineItemOptionProvider>
    )

    expect(screen.getByText("Size:")).toBeDefined()
    expect(screen.getByText("M")).toBeDefined()
  })

  it("renders nothing when the requested option is missing", () => {
    const { container } = render(
      <LineItemOptionProvider>
        <LineItemOption name="Material" />
      </LineItemOptionProvider>
    )

    expect(container.querySelector("ul")?.textContent).toBe("")
  })

  it("renders an empty list when showAll=true and options are missing", () => {
    const { container } = render(
      <LineItemOptionProvider lineItemOption={buildLineItemOption({ options: undefined })} showAll>
        <LineItemOption />
      </LineItemOptionProvider>
    )

    expect(container.querySelector("ul")?.textContent).toBe("")
  })

  it("renders an empty list when showAll=true and options are empty", () => {
    const { container } = render(
      <LineItemOptionProvider lineItemOption={buildLineItemOption({ options: {} })} showAll>
        <LineItemOption />
      </LineItemOptionProvider>
    )

    expect(container.querySelector("ul")?.textContent).toBe("")
  })

  it("renders children render-prop", () => {
    render(
      <LineItemOptionProvider>
        <LineItemOption>
          {({ lineItemOption }) => <span data-testid="custom-option">{lineItemOption.name}</span>}
        </LineItemOption>
      </LineItemOptionProvider>
    )

    expect(screen.getByTestId("custom-option").textContent).toBe("Customization")
  })

  it("falls back to an empty string when the option value is undefined", () => {
    render(
      <LineItemOptionProvider
        lineItemOption={buildLineItemOption({ options: { Size: undefined } })}
      >
        <LineItemOption name="Size" />
      </LineItemOptionProvider>
    )

    expect(screen.getByText("Size:").parentElement?.textContent).toBe("Size:")
  })
})

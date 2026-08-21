import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StockTransferField } from "#components/stock_transfers/StockTransferField"
import StockTransferChildrenContext from "#context/StockTransferChildrenContext"
import { MOCK_LINE_ITEM, StockTransferProvider } from "./helpers"

describe("StockTransferField component", () => {
  it("renders the name attribute from stockTransfer", () => {
    render(
      <StockTransferProvider>
        <StockTransferField attribute="name" />
      </StockTransferProvider>
    )

    expect(screen.getByTestId("Test Product").textContent).toBe("Test Product")
  })

  it("renders the sku_code attribute from stockTransfer", () => {
    render(
      <StockTransferProvider>
        <StockTransferField attribute="sku_code" />
      </StockTransferProvider>
    )

    expect(screen.getByTestId("SUB_SKU").textContent).toBe("SUB_SKU")
  })

  it("renders with a custom tagElement", () => {
    render(
      <StockTransferProvider>
        <StockTransferField attribute="name" tagElement="p" />
      </StockTransferProvider>
    )

    expect(screen.getByTestId("Test Product").tagName.toLowerCase()).toBe("p")
  })

  it("renders children render-prop with attributeValue", () => {
    render(
      <StockTransferProvider>
        <StockTransferField attribute="name">
          {({ attributeValue }) => <span data-testid="custom-field">{String(attributeValue)}</span>}
        </StockTransferField>
      </StockTransferProvider>
    )

    expect(screen.getByTestId("custom-field").textContent).toBe("Test Product")
  })

  it("renders empty when no context provider is present (default empty context)", () => {
    render(
      <StockTransferChildrenContext.Provider value={{}}>
        <StockTransferField attribute="name" data-testid="field" />
      </StockTransferChildrenContext.Provider>
    )

    expect(screen.getByTestId("field").textContent).toBe("")
  })

  it("passes extra props through to the tag", () => {
    render(
      <StockTransferProvider>
        <StockTransferField attribute="name" className="my-class" />
      </StockTransferProvider>
    )

    expect(screen.getByTestId("Test Product").getAttribute("class")).toBe("my-class")
  })

  it("renders a different attribute from a custom stockTransfer", () => {
    const customItem = { ...MOCK_LINE_ITEM, name: "Custom Product", sku_code: "CUSTOM_SKU" }
    render(
      <StockTransferProvider stockTransfer={customItem}>
        <StockTransferField attribute="sku_code" />
      </StockTransferProvider>
    )

    expect(screen.getByTestId("CUSTOM_SKU").textContent).toBe("CUSTOM_SKU")
  })
})

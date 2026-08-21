import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import { describe, expect, it } from "vitest"
import { StockTransfer } from "#components/stock_transfers/StockTransfer"
import StockTransferChildrenContext from "#context/StockTransferChildrenContext"
import {
  MOCK_CART_LINE_ITEM,
  MOCK_LINE_ITEM,
  MOCK_STOCK_TRANSFER,
  ShipmentChildrenProvider,
} from "./helpers"

function Consumer() {
  const { stockTransfer } = useContext(StockTransferChildrenContext)
  return <span data-testid="st-id">{stockTransfer?.id}</span>
}

describe("StockTransfer component", () => {
  it("renders children for each stock transfer that passes the filter", () => {
    // MOCK_STOCK_TRANSFER.sku_code = "STOCK_TRANSFER_SKU", MOCK_CART_LINE_ITEM.sku_code = "CART_SKU" (different → passes)
    render(
      <ShipmentChildrenProvider>
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    expect(screen.getAllByTestId("st-id")).toHaveLength(1)
  })

  it("provides line_item as context when stockTransfer.type is 'stock_transfers'", () => {
    render(
      <ShipmentChildrenProvider>
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    // type !== "line_items" → context.stockTransfer = stockTransfer.line_item (id: "sub_li_1")
    expect(screen.getByTestId("st-id").textContent).toBe("sub_li_1")
  })

  it("provides the item itself as context when type is 'line_items'", () => {
    // A LineItem masquerading as a stock transfer; sku_code differs from MOCK_CART_LINE_ITEM so it passes the filter
    const lineItemEntry = { ...MOCK_LINE_ITEM, id: "li_direct_1", sku_code: "OTHER_SKU" }
    render(
      <ShipmentChildrenProvider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        stockTransfers={[lineItemEntry as any]}
        lineItems={[MOCK_CART_LINE_ITEM]}
      >
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    // type === "line_items" → context.stockTransfer = item itself (id: "li_direct_1")
    expect(screen.getByTestId("st-id").textContent).toBe("li_direct_1")
  })

  it("renders nothing when stockTransfers is null", () => {
    render(
      <ShipmentChildrenProvider stockTransfers={null}>
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    expect(screen.queryByTestId("st-id")).toBeNull()
  })

  it("renders nothing when lineItems is null (filter excludes all via ?. branch)", () => {
    render(
      <ShipmentChildrenProvider lineItems={null}>
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    expect(screen.queryByTestId("st-id")).toBeNull()
  })

  it("excludes stock transfers whose sku_code matches all line item sku_codes", () => {
    // When sku_codes are the same, find returns undefined → filtered out
    render(
      <ShipmentChildrenProvider
        stockTransfers={[{ ...MOCK_STOCK_TRANSFER, sku_code: "SAME_SKU" }]}
        lineItems={[{ ...MOCK_CART_LINE_ITEM, sku_code: "SAME_SKU" }]}
      >
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    expect(screen.queryByTestId("st-id")).toBeNull()
  })

  it("renders multiple stock transfers", () => {
    const st2 = { ...MOCK_STOCK_TRANSFER, id: "st_2", sku_code: "SKU_B" }
    render(
      <ShipmentChildrenProvider
        stockTransfers={[MOCK_STOCK_TRANSFER, st2]}
        lineItems={[MOCK_CART_LINE_ITEM]}
      >
        <StockTransfer>
          <Consumer />
        </StockTransfer>
      </ShipmentChildrenProvider>
    )

    expect(screen.getAllByTestId("st-id")).toHaveLength(2)
  })
})

import type { LineItem, StockTransfer } from "@commercelayer/sdk"
import type { ReactNode } from "react"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"
import StockTransferChildrenContext from "#context/StockTransferChildrenContext"

/** A mock LineItem used as the nested line_item of a stock transfer */
export const MOCK_LINE_ITEM: Partial<LineItem> = {
  id: "sub_li_1",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  type: "line_items" as any,
  sku_code: "SUB_SKU",
  name: "Test Product",
  sku_code_lock: "SKU_LOCK",
}

/** A mock StockTransfer with a different sku_code than MOCK_CART_LINE_ITEM so it passes the filter */
export const MOCK_STOCK_TRANSFER: Partial<StockTransfer> = {
  id: "st_1",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  type: "stock_transfers" as any,
  sku_code: "STOCK_TRANSFER_SKU",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  line_item: MOCK_LINE_ITEM as any,
}

/** A cart line item whose sku_code is different from MOCK_STOCK_TRANSFER so the filter passes */
export const MOCK_CART_LINE_ITEM: Partial<LineItem> = {
  id: "li_cart_1",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  type: "line_items" as any,
  sku_code: "CART_SKU",
}

/** Provides StockTransferChildrenContext — for StockTransferField leaf component */
export function StockTransferProvider({
  children,
  stockTransfer = MOCK_LINE_ITEM,
}: {
  children: ReactNode
  stockTransfer?: Partial<LineItem> | Partial<StockTransfer> | null
}) {
  return (
    <StockTransferChildrenContext.Provider
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      value={{ stockTransfer: stockTransfer as any }}
    >
      {children}
    </StockTransferChildrenContext.Provider>
  )
}

/** Provides ShipmentChildrenContext — for StockTransfer container component */
export function ShipmentChildrenProvider({
  children,
  stockTransfers = [MOCK_STOCK_TRANSFER],
  lineItems = [MOCK_CART_LINE_ITEM],
}: {
  children: ReactNode
  stockTransfers?: Array<Partial<StockTransfer | LineItem>> | null
  lineItems?: Array<Partial<LineItem>> | null
}) {
  return (
    <ShipmentChildrenContext.Provider
      value={{
        keyNumber: 0,
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        stockTransfers: stockTransfers as any,
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        lineItems: lineItems as any,
      }}
    >
      {children}
    </ShipmentChildrenContext.Provider>
  )
}

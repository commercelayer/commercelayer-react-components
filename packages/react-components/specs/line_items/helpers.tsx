import type { LineItem, LineItemOption } from "@commercelayer/sdk"
import type { ReactNode } from "react"
import LineItemChildrenContext from "#context/LineItemChildrenContext"
import LineItemContext from "#context/LineItemContext"
import LineItemOptionChildrenContext from "#context/LineItemOptionChildrenContext"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"

export const MOCK_LINE_ITEM: Partial<LineItem> = {
  id: "li_1",
  item_type: "skus",
  quantity: 2,
  name: "Baby Onesie",
  sku_code: "BABYONBU000000E63E7412MX",
  bundle_code: undefined,
  image_url: "https://example.com/img.jpg",
  formatted_total_amount: "€24.00",
  total_amount_float: 24.0,
  total_amount_cents: 2400,
  formatted_unit_amount: "€12.00",
  unit_amount_float: 12.0,
  unit_amount_cents: 1200,
  line_item_options: [],
}

export function buildLineItem(overrides: Partial<LineItem> = {}): Partial<LineItem> {
  return {
    ...MOCK_LINE_ITEM,
    ...overrides,
  }
}

export function buildLineItemOption(overrides: Record<string, unknown> = {}) {
  return {
    name: "Customization",
    options: {
      Size: "M",
      Color: "Blue",
    },
    sku_option: { id: "sku-opt-1" },
    ...overrides,
  }
}

export function LineItemProvider(props: {
  children: ReactNode
  lineItem?: Partial<LineItem> | null
}) {
  const lineItem = "lineItem" in props ? props.lineItem : MOCK_LINE_ITEM

  return (
    <LineItemChildrenContext.Provider value={{ lineItem }}>
      {props.children}
    </LineItemChildrenContext.Provider>
  )
}

export function LineItemsProvider(props: {
  children: ReactNode
  lineItems?: Array<Partial<LineItem>>
  updateLineItem?: (
    lineItemId: string,
    quantity?: number,
    hasExternalPrice?: boolean
  ) => Promise<void>
  deleteLineItem?: (lineItemId: string) => Promise<void>
}) {
  const lineItems = "lineItems" in props ? props.lineItems : [MOCK_LINE_ITEM]

  return (
    <LineItemContext.Provider
      value={{
        lineItems: lineItems as LineItem[],
        updateLineItem: props.updateLineItem,
        deleteLineItem: props.deleteLineItem,
      }}
    >
      {props.children}
    </LineItemContext.Provider>
  )
}

export function LineItemOptionProvider({
  children,
  lineItemOption = buildLineItemOption() as unknown as Partial<LineItemOption>,
  showAll,
}: {
  children: ReactNode
  lineItemOption?: Partial<LineItemOption>
  showAll?: boolean
}) {
  return (
    <LineItemOptionChildrenContext.Provider value={{ lineItemOption, showAll }}>
      {children}
    </LineItemOptionChildrenContext.Provider>
  )
}

export function ShipmentProvider({
  children,
  lineItems = [],
}: {
  children: ReactNode
  lineItems?: Array<LineItem | null | undefined>
}) {
  return (
    <ShipmentChildrenContext.Provider value={{ keyNumber: 0, lineItems }}>
      {children}
    </ShipmentChildrenContext.Provider>
  )
}

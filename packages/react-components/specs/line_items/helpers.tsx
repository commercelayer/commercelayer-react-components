import LineItemContext from "#context/LineItemContext"
import LineItemChildrenContext from "#context/LineItemChildrenContext"
import LineItemOptionChildrenContext from "#context/LineItemOptionChildrenContext"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"
import type { ReactNode } from "react"

export const MOCK_LINE_ITEM: any = {
  id: "li_1",
  item_type: "skus",
  quantity: 2,
  name: "Baby Onesie",
  sku_code: "BABYONBU000000E63E7412MX",
  bundle_code: null,
  image_url: "https://example.com/img.jpg",
  formatted_total_amount: "€24.00",
  total_amount_float: 24.0,
  total_amount_cents: 2400,
  formatted_unit_amount: "€12.00",
  unit_amount_float: 12.0,
  unit_amount_cents: 1200,
  line_item_options: [],
}

export function buildLineItem(overrides: Record<string, any> = {}) {
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
    skuOption: () => ({ id: "sku-opt-1" }),
    ...overrides,
  }
}

export function LineItemProvider(props: { children: ReactNode; lineItem?: any }) {
  const lineItem = Object.prototype.hasOwnProperty.call(props, "lineItem")
    ? props.lineItem
    : MOCK_LINE_ITEM

  return (
    <LineItemChildrenContext.Provider value={{ lineItem }}>
      {props.children}
    </LineItemChildrenContext.Provider>
  )
}

export function LineItemsProvider(props: {
  children: ReactNode
  lineItems?: any
  updateLineItem?: any
  deleteLineItem?: any
}) {
  const lineItems = Object.prototype.hasOwnProperty.call(props, "lineItems")
    ? props.lineItems
    : [MOCK_LINE_ITEM]

  return (
    <LineItemContext.Provider
      value={{
        lineItems,
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
  lineItemOption = buildLineItemOption(),
  showAll,
}: {
  children: ReactNode
  lineItemOption?: any
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
  lineItems?: any[]
}) {
  return (
    <ShipmentChildrenContext.Provider value={{ keyNumber: 0, lineItems }}>
      {children}
    </ShipmentChildrenContext.Provider>
  )
}

import { LineItem } from "#components/line_items/LineItem"
import LineItemContext from "#context/LineItemContext"
import LineItemChildrenContext from "#context/LineItemChildrenContext"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"
import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import { describe, expect, it } from "vitest"
import { buildLineItem, MOCK_LINE_ITEM } from "./helpers"

function Child() {
  const { lineItem } = useContext(LineItemChildrenContext)
  return <span data-testid={`line-item-${lineItem?.id}`}>{lineItem?.name}</span>
}

function renderComponent({
  type,
  lineItems = [MOCK_LINE_ITEM],
  shipmentLineItems = [],
}: {
  type?: "skus" | "gift_cards" | "bundles"
  lineItems?: any[]
  shipmentLineItems?: any[]
} = {}) {
  return render(
    <LineItemContext.Provider value={{ lineItems }}>
      <ShipmentChildrenContext.Provider value={{ keyNumber: 0, lineItems: shipmentLineItems }}>
        <LineItem type={type}>
          <Child />
        </LineItem>
      </ShipmentChildrenContext.Provider>
    </LineItemContext.Provider>
  )
}

describe("LineItem component", () => {
  it('renders children for matching type="skus"', () => {
    renderComponent()

    expect(screen.getByTestId("line-item-li_1").textContent).toBe("Baby Onesie")
  })

  it("does not render children for a non matching type", () => {
    renderComponent({ type: "gift_cards" })

    expect(screen.queryByTestId("line-item-li_1")).toBeNull()
  })

  it("skips gift cards with total_amount_cents <= 0", () => {
    renderComponent({
      type: "gift_cards",
      lineItems: [
        buildLineItem({
          id: "gift_1",
          item_type: "gift_cards",
          sku_code: "GIFT001",
          total_amount_cents: 0,
          name: "Zero Gift Card",
        }),
      ],
    })

    expect(screen.queryByTestId("line-item-gift_1")).toBeNull()
  })

  it("renders gift cards with total_amount_cents > 0", () => {
    renderComponent({
      type: "gift_cards",
      lineItems: [
        buildLineItem({
          id: "gift_2",
          item_type: "gift_cards",
          sku_code: "GIFT002",
          total_amount_cents: 1000,
          name: "Positive Gift Card",
        }),
      ],
    })

    expect(screen.getByTestId("line-item-gift_2").textContent).toBe("Positive Gift Card")
  })

  it("deduplicates bundles with the same bundle_code", () => {
    renderComponent({
      type: "bundles",
      lineItems: [
        buildLineItem({
          id: "bundle_1",
          item_type: "bundles",
          bundle_code: "BUNDLE001",
          sku_code: "BUNDLE001-1",
          name: "Starter Bundle",
        }),
        buildLineItem({
          id: "bundle_2",
          item_type: "bundles",
          bundle_code: "BUNDLE001",
          sku_code: "BUNDLE001-2",
          name: "Starter Bundle Duplicate",
        }),
      ],
    })

    expect(screen.getAllByText(/Starter Bundle/)).toHaveLength(1)
  })

  it("uses shipmentLineItems from ShipmentChildrenContext when available", () => {
    renderComponent({
      lineItems: [buildLineItem({ id: "line_item", name: "Context line item" })],
      shipmentLineItems: [buildLineItem({ id: "shipment_item", name: "Shipment line item" })],
    })

    expect(screen.queryByText("Context line item")).toBeNull()
    expect(screen.getByText("Shipment line item")).toBeDefined()
  })
})

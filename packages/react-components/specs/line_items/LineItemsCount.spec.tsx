import { LineItemsCount } from "#components/line_items/LineItemsCount"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildLineItem, LineItemsProvider } from "./helpers"

describe("LineItemsCount component", () => {
  const lineItems = [
    buildLineItem({ id: "sku_1", item_type: "skus", quantity: 2 }),
    buildLineItem({ id: "gift_1", item_type: "gift_cards", quantity: 1, total_amount_cents: 1000 }),
    buildLineItem({ id: "bundle_1", item_type: "bundles", quantity: 1 }),
    buildLineItem({ id: "adj_1", item_type: "adjustments", quantity: 3 }),
    buildLineItem({ id: "shipment_1", item_type: "shipments", quantity: 10 }),
  ]

  it("renders count of skus, gift_cards, bundles, and adjustments", () => {
    render(
      <LineItemsProvider lineItems={lineItems}>
        <LineItemsCount data-testid="line-items-count" />
      </LineItemsProvider>
    )

    expect(screen.getByTestId("line-items-count").textContent).toBe("7")
  })

  it("renders 0 when lineItems is empty", () => {
    render(
      <LineItemsProvider lineItems={[]}>
        <LineItemsCount data-testid="empty-line-items-count" />
      </LineItemsProvider>
    )

    expect(screen.getByTestId("empty-line-items-count").textContent).toBe("0")
  })

  it("filters by typeAccepted prop", () => {
    render(
      <LineItemsProvider lineItems={lineItems}>
        <LineItemsCount typeAccepted={["gift_cards"]} data-testid="filtered-line-items-count" />
      </LineItemsProvider>
    )

    expect(screen.getByTestId("filtered-line-items-count").textContent).toBe("1")
  })

  it("renders children render-prop", () => {
    render(
      <LineItemsProvider lineItems={lineItems}>
        <LineItemsCount>{({ quantity }) => <span data-testid="custom-count">{quantity}</span>}</LineItemsCount>
      </LineItemsProvider>
    )

    expect(screen.getByTestId("custom-count").textContent).toBe("7")
  })
})

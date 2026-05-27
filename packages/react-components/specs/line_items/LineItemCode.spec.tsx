import { LineItemCode } from "#components/line_items/LineItemCode"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildLineItem, LineItemProvider } from "./helpers"

describe("LineItemCode component", () => {
  it("renders sku_code by default", () => {
    render(
      <LineItemProvider>
        <LineItemCode data-testid="line-item-code" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("line-item-code").textContent).toBe("BABYONBU000000E63E7412MX")
  })

  it('renders bundle_code when type="bundle_code"', () => {
    render(
      <LineItemProvider lineItem={buildLineItem({ bundle_code: "BUNDLE-123" })}>
        <LineItemCode type="bundle_code" data-testid="bundle-code" />
      </LineItemProvider>
    )

    expect(screen.getByTestId("bundle-code").textContent).toBe("BUNDLE-123")
  })

  it("renders children render-prop", () => {
    render(
      <LineItemProvider>
        <LineItemCode>
          {({ skuCode }) => <span data-testid="custom-code">{skuCode}</span>}
        </LineItemCode>
      </LineItemProvider>
    )

    expect(screen.getByTestId("custom-code").textContent).toBe("BABYONBU000000E63E7412MX")
  })
})

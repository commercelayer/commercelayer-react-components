import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { TLineItemImage } from "#components/line_items/LineItemImage"
import { LineItemImage } from "#components/line_items/LineItemImage"
import type { ChildrenFunction } from "#typings"
import { defaultGiftCardImgUrl, defaultImgUrl } from "#utils/placeholderImages"
import { buildLineItem, LineItemProvider } from "./helpers"

describe("LineItemImage component", () => {
  it("renders image from image_url", () => {
    render(
      <LineItemProvider>
        <LineItemImage />
      </LineItemProvider>
    )

    const image = screen.getByTestId("line-item-image-BABYONBU000000E63E7412MX") as HTMLImageElement
    expect(image.getAttribute("src")).toBe("https://example.com/img.jpg")
  })

  it("uses default placeholder when no image_url is available", () => {
    render(
      <LineItemProvider lineItem={buildLineItem({ image_url: undefined })}>
        <LineItemImage />
      </LineItemProvider>
    )

    const image = screen.getByTestId("line-item-image-BABYONBU000000E63E7412MX") as HTMLImageElement
    expect(image.getAttribute("src")).toBe(defaultImgUrl)
  })

  it('uses the gift card placeholder when item_type is "gift_cards"', () => {
    render(
      <LineItemProvider
        lineItem={buildLineItem({
          item_type: "gift_cards",
          image_url: undefined,
          sku_code: "GIFTCARD001",
        })}
      >
        <LineItemImage />
      </LineItemProvider>
    )

    const image = screen.getByTestId("line-item-image-GIFTCARD001") as HTMLImageElement
    expect(image.getAttribute("src")).toBe(defaultGiftCardImgUrl)
  })

  it("uses a custom placeholder when provided for the item type", () => {
    render(
      <LineItemProvider lineItem={buildLineItem({ image_url: undefined })}>
        <LineItemImage placeholder={{ skus: "https://example.com/custom-placeholder.jpg" }} />
      </LineItemProvider>
    )

    const image = screen.getByTestId("line-item-image-BABYONBU000000E63E7412MX") as HTMLImageElement
    expect(image.getAttribute("src")).toBe("https://example.com/custom-placeholder.jpg")
  })

  it("renders children render-prop with src prop", () => {
    render(
      <LineItemProvider>
        <LineItemImage>
          {
            (({ src }: TLineItemImage) => (
              <span data-testid="custom-image">{src}</span>
            )) as ChildrenFunction<TLineItemImage>
          }
        </LineItemImage>
      </LineItemProvider>
    )

    expect(screen.getByTestId("custom-image").textContent).toBe("https://example.com/img.jpg")
  })

  it("renders fallback attributes when lineItem is missing", () => {
    render(
      <LineItemProvider lineItem={undefined}>
        <LineItemImage />
      </LineItemProvider>
    )

    const image = screen.getByTestId("line-item-image-") as HTMLImageElement
    expect(image.getAttribute("alt")).toBe("")
    expect(image.getAttribute("src")).toBe(defaultImgUrl)
  })
})

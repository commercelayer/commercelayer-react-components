import { describe, expect, it } from "vitest"
import { buildGatewayReturnUrl } from "./buildGatewayReturnUrl"

describe("buildGatewayReturnUrl", () => {
  it("keeps the page the shopper is on", () => {
    expect(buildGatewayReturnUrl("https://shop.example/checkout/order-1")).toBe(
      "https://shop.example/checkout/order-1"
    )
  })

  it("preserves the application's own query", () => {
    expect(buildGatewayReturnUrl("https://shop.example/checkout?orderId=1&lang=it")).toBe(
      "https://shop.example/checkout?orderId=1&lang=it"
    )
  })

  it("strips a spent redirectResult so it is not baked into the next session", () => {
    // Adyen refuses the same `redirectResult` twice, so a second redirect built
    // from the raw location would return a value that is already burnt.
    expect(
      buildGatewayReturnUrl("https://shop.example/checkout?redirectResult=abc&sessionId=CS1&keep=1")
    ).toBe("https://shop.example/checkout?keep=1")
  })

  it("strips resultCode too", () => {
    expect(buildGatewayReturnUrl("https://shop.example/c?resultCode=Authorised")).toBe(
      "https://shop.example/c"
    )
  })

  it("drops the fragment", () => {
    // Adyen appends its parameters as a query string. A returnUrl ending in a
    // fragment would come back as `#payment?redirectResult=…`, which nothing
    // can read.
    expect(buildGatewayReturnUrl("https://shop.example/checkout#payment")).toBe(
      "https://shop.example/checkout"
    )
  })

  it("returns an unparseable href untouched rather than inventing one", () => {
    expect(buildGatewayReturnUrl("not a url")).toBe("not a url")
  })
})

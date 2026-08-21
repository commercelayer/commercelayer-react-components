import { afterEach, describe, expect, it, vi } from "vitest"
import checkIncludeResources from "#utils/checkIncludeResource"
import compareObjAttribute from "#utils/compareObjAttribute"
import { formCleaner } from "#utils/formCleaner"
import { isEmpty } from "#utils/isEmpty"
import { sortPaymentMethods } from "#utils/payment-methods/sortPaymentMethods"
import scrollbarWidth from "#utils/scrollbarWidth"
import { isDoNotShip, shipmentsFilled } from "#utils/shipments"

describe("isEmpty", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""],
    ["empty array", []],
    ["empty object", {}],
    ["empty Map", new Map()],
    ["empty Set", new Set()],
  ])("treats %s as empty", (_label, value) => {
    expect(isEmpty(value)).toBe(true)
  })

  it.each([
    ["string", "a"],
    ["array", [1]],
    ["object", { a: 1 }],
    ["Map", new Map([["a", 1]])],
    ["Set", new Set([1])],
    ["number", 0],
    ["boolean", false],
  ])("treats %s as non-empty", (_label, value) => {
    expect(isEmpty(value)).toBe(false)
  })
})

describe("shipmentsFilled", () => {
  it("is true when at least one shipment has a shipping method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const shipments = [{ shipping_method: null }, { shipping_method: { id: "sm_1" } }] as any

    expect(shipmentsFilled(shipments)).toBe(true)
  })

  it("is false when no shipment has one", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(shipmentsFilled([{ shipping_method: null }, {}] as any)).toBe(false)
  })

  it("is false for no shipments at all", () => {
    expect(shipmentsFilled([])).toBe(false)
  })
})

describe("isDoNotShip", () => {
  it("is true only when every sku line item is flagged do_not_ship", () => {
    const lineItems = [
      { item_type: "skus", item: { do_not_ship: true } },
      { item_type: "skus", item: { do_not_ship: true } },
      // Non-sku rows are excluded from the comparison entirely.
      { item_type: "payment_methods", item: {} },
      // biome-ignore lint/suspicious/noExplicitAny: test cast
    ] as any

    expect(isDoNotShip(lineItems)).toBe(true)
  })

  it("is false when only some sku line items are flagged", () => {
    const lineItems = [
      { item_type: "skus", item: { do_not_ship: true } },
      { item_type: "skus", item: { do_not_ship: false } },
      // biome-ignore lint/suspicious/noExplicitAny: test cast
    ] as any

    expect(isDoNotShip(lineItems)).toBe(false)
  })

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty", []],
  ])("is false for %s line items", (_label, value) => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(isDoNotShip(value as any)).toBe(false)
  })
})

describe("checkIncludeResources", () => {
  it("is true when every requested resource is present on the order", () => {
    const order = { line_items: [], shipments: [] }

    expect(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      checkIncludeResources({ order: order as any, resourceInclude: ["line_items", "shipments"] })
    ).toBe(true)
  })

  it("resolves a dotted include against its first segment", () => {
    const order = { shipments: [] }

    expect(
      checkIncludeResources({
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        order: order as any,
        resourceInclude: ["shipments.shipping_method"],
      })
    ).toBe(true)
  })

  it("is false when a requested resource is missing", () => {
    expect(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      checkIncludeResources({ order: {} as any, resourceInclude: ["line_items"] })
    ).toBe(false)
  })

  it("is false when a dotted include's root is missing", () => {
    expect(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      checkIncludeResources({ order: {} as any, resourceInclude: ["shipments.shipping_method"] })
    ).toBe(false)
  })

  it("is true for an empty include list", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(checkIncludeResources({ order: {} as any, resourceInclude: [] })).toBe(true)
  })
})

describe("compareObjAttribute", () => {
  it("returns only the scalar attributes that differ", () => {
    const result = compareObjAttribute({
      attributes: { city: "Rome", zip: "00100" },
      object: { city: "Milan", zip: "00100" },
    })

    expect(result).toEqual({ city: "Rome" })
  })

  it("compares nested objects regardless of key order", () => {
    const sameContent = compareObjAttribute({
      attributes: { meta: { b: 2, a: 1 } },
      object: { meta: { a: 1, b: 2 } },
    })
    expect(sameContent).toEqual({})

    const different = compareObjAttribute({
      attributes: { meta: { a: 1 } },
      object: { meta: { a: 2 } },
    })
    expect(different).toEqual({ meta: { a: 1 } })
  })

  it("ignores keys absent or falsy on the attributes side", () => {
    const result = compareObjAttribute({
      attributes: { city: "" },
      object: { city: "Milan", zip: "00100" },
    })

    expect(result).toEqual({})
  })
})

describe("sortPaymentMethods", () => {
  const method = (type: string) =>
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    ({ id: type, payment_source_type: type }) as any

  it("orders methods by the supplied label order", () => {
    const methods = [method("stripe_payments"), method("adyen_payments")]

    const sorted = sortPaymentMethods(methods, [
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      "adyen_payments" as any,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      "stripe_payments" as any,
    ])

    expect(sorted.map((m) => m.payment_source_type)).toEqual(["adyen_payments", "stripe_payments"])
  })

  it("pushes unlisted methods to the end and keeps unlisted pairs stable", () => {
    const methods = [method("wire_transfers"), method("paypal_payments"), method("adyen_payments")]

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const sorted = sortPaymentMethods(methods, ["adyen_payments" as any])

    expect(sorted[0]?.payment_source_type).toBe("adyen_payments")
    expect(sorted.slice(1).map((m) => m.payment_source_type)).toHaveLength(2)
  })

  it("leaves the order untouched when no method is listed", () => {
    const methods = [method("wire_transfers"), method("paypal_payments")]

    expect(sortPaymentMethods(methods, []).map((m) => m.payment_source_type)).toEqual([
      "wire_transfers",
      "paypal_payments",
    ])
  })

  it("demotes an unlisted method that already sits after a listed one", () => {
    // Listed first, unlisted second: the comparator is asked to rank the unlisted
    // method against a listed one, which is the branch that sends it to the back.
    const methods = [method("adyen_payments"), method("wire_transfers")]

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const sorted = sortPaymentMethods(methods, ["adyen_payments" as any])

    expect(sorted.map((m) => m.payment_source_type)).toEqual(["adyen_payments", "wire_transfers"])
  })
})

describe("formCleaner", () => {
  it("strips shipping_address_ and billing_address_ prefixes", () => {
    const cleaned = formCleaner({
      shipping_address_city: "Rome",
      billing_address_zip: "00100",
      // biome-ignore lint/suspicious/noExplicitAny: test cast
    } as any)

    expect(cleaned).toEqual({ city: "Rome", zip: "00100" })
  })

  it("drops save_to_customer_book", () => {
    const cleaned = formCleaner({
      shipping_address_save_to_customer_book: true,
      shipping_address_city: "Rome",
      // biome-ignore lint/suspicious/noExplicitAny: test cast
    } as any)

    expect(cleaned).toEqual({ city: "Rome" })
  })

  it("leaves already-clean keys alone", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(formCleaner({ city: "Rome" } as any)).toEqual({ city: "Rome" })
  })

  it.each([
    ["undefined", undefined],
    ["null", null],
  ])("passes %s straight through", (_label, value) => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(formCleaner(value as any)).toBe(value)
  })
})

describe("scrollbarWidth", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("measures without leaving the probe element behind", () => {
    const before = document.body.childElementCount

    expect(typeof scrollbarWidth()).toBe("number")
    expect(document.body.childElementCount).toBe(before)
  })

  it("returns zero when there is no document (SSR)", () => {
    vi.stubGlobal("document", undefined)

    expect(scrollbarWidth()).toBe(0)
  })
})

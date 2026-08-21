import { describe, expect, it, vi } from "vitest"
import customMessages from "#utils/customMessages"
import { getDomain } from "#utils/getDomain"
import isDate from "#utils/isDate"
import isJSON from "#utils/isJSON"
import omit from "#utils/omit"
import { pick } from "#utils/pick"

describe("isDate", () => {
  it.each(["2026-08-12", "2026-08-12T10:00:00.000Z", "Aug 12, 2026"])("accepts %s", (value) => {
    expect(isDate(value)).toBe(true)
  })

  it.each(["", "not-a-date", "tomorrow"])("rejects %s", (value) => {
    expect(isDate(value)).toBe(false)
  })
})

describe("isJSON", () => {
  it.each(['{"a":1}', "[1,2]", '"str"', "42", "null"])("accepts %s", (value) => {
    expect(isJSON(value)).toBe(true)
  })

  it.each(["", "{a:1}", "undefined", "{"])("rejects %s", (value) => {
    expect(isJSON(value)).toBe(false)
  })
})

describe("omit", () => {
  it("drops the named keys and keeps the rest", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 })
  })

  it("returns an equal copy when nothing is omitted", () => {
    const source = { a: 1, b: 2 }
    const result = omit(source, [])

    expect(result).toEqual(source)
    expect(result).not.toBe(source)
  })

  it("ignores keys the object does not have", () => {
    expect(omit({ a: 1 }, ["missing" as "a"])).toEqual({ a: 1 })
  })
})

describe("pick", () => {
  it("keeps only the named keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 })
  })

  it("yields undefined for keys the object lacks", () => {
    expect(pick({ a: 1 } as { a: number; b?: number }, ["b"])).toEqual({ b: undefined })
  })
})

describe("getDomain", () => {
  it("splits an org endpoint into slug and domain", () => {
    expect(getDomain("https://alessani.commercelayer.io")).toEqual({
      slug: "alessani",
      domain: "commercelayer.io",
    })
  })

  it("ignores path and protocol", () => {
    expect(getDomain("http://demo-store.commercelayer.co/api/orders")).toEqual({
      slug: "demo-store",
      domain: "commercelayer.co",
    })
  })

  it("handles a single-label host", () => {
    expect(getDomain("http://localhost:3000")).toEqual({ slug: "localhost", domain: "localhost" })
  })
})

describe("customMessages", () => {
  const error = {
    field: "email",
    code: "VALIDATION_ERROR",
    resource: "orders",
    detail: "email is invalid",
  } as const

  it("matches on field, code and resource together", () => {
    const message = { field: "email", code: "VALIDATION_ERROR", resource: "orders" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages([message] as any, error as any)).toEqual(message)
  })

  it("matches when the detail mentions the field", () => {
    const message = { field: "email", code: "VALIDATION_ERROR", resource: "orders" }
    const detailOnly = { code: "VALIDATION_ERROR", resource: "orders", detail: "email is invalid" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages([message] as any, detailOnly as any)).toEqual(message)
  })

  it("matches a resource-wide message when neither side names a field", () => {
    // `field: null` against an absent field: strict equality fails, so this falls
    // through to the nullish-field case rather than the first one.
    const message = { field: null, code: "EMPTY_ERROR", resource: "orders" }
    const resourceError = { code: "EMPTY_ERROR", resource: "orders" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages([message] as any, resourceError as any)).toEqual(message)
  })

  it("matches on identical undefined fields via the first case", () => {
    const message = { code: "EMPTY_ERROR", resource: "orders" }
    const resourceError = { code: "EMPTY_ERROR", resource: "orders" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages([message] as any, resourceError as any)).toEqual(message)
  })

  it("does not match a nullish-field message when the error names a field", () => {
    const message = { field: null, code: "VALIDATION_ERROR", resource: "orders" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages([message] as any, error as any)).toBeNull()
  })

  it("returns null when nothing matches", () => {
    const message = { field: "other", code: "OTHER", resource: "line_items" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages([message] as any, error as any)).toBeNull()
  })

  it("returns null for an empty message list", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(customMessages(undefined, error as any)).toBeNull()
  })
})

describe("events", () => {
  it("delivers published data to a subscriber and stops after unsubscribe", async () => {
    const { publish, subscribe, unsubscribe } = await import("#utils/events")
    const listener = vi.fn()

    subscribe("open-cart", listener)
    publish("open-cart", { open: true })

    expect(listener).toHaveBeenCalledTimes(1)
    const received = listener.mock.calls[0]?.[0] as CustomEvent | undefined
    expect(received?.detail).toEqual({ open: true })

    unsubscribe("open-cart", listener)
    publish("open-cart")

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

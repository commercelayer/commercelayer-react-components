import type { Order } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { isCreatedWithVersion } from "./createdWithVersion"

// The version as the SDK returns it: under the resource's `meta`.
const order = (createdWithVersion?: string): Order =>
  ({
    id: "order-1",
    ...(createdWithVersion != null ? { meta: { created_with_version: createdWithVersion } } : {}),
  }) as unknown as Order

describe("isCreatedWithVersion", () => {
  it("compares the version the API reports in the order's meta", () => {
    expect(isCreatedWithVersion(order("2026-05"), "2026-05")).toBe(true)
    expect(isCreatedWithVersion(order("2017-08"), "2026-05")).toBe(false)
  })

  it("matches the version exactly", () => {
    expect(isCreatedWithVersion(order("2027-01"), "2026-05")).toBe(false)
  })

  it("takes only a version the SDK supports", () => {
    // @ts-expect-error a mistyped version is a compile error, not a silent false
    expect(isCreatedWithVersion(order("2026-05"), "2026-5")).toBe(false)
  })

  it("is undefined when the order does not say which version created it", () => {
    expect(isCreatedWithVersion(order(), "2026-05")).toBeUndefined()
    expect(isCreatedWithVersion(order(""), "2026-05")).toBeUndefined()
    expect(isCreatedWithVersion(undefined, "2026-05")).toBeUndefined()
    expect(isCreatedWithVersion(null, "2026-05")).toBeUndefined()
  })
})

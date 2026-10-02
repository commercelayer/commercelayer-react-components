import type { Order } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { isCreatedWithVersion } from "./createdWithVersion"

const order = (extra: Record<string, unknown>): Order =>
  ({ id: "order-1", ...extra }) as unknown as Order

describe("isCreatedWithVersion", () => {
  it("compares the version flattened among the attributes", () => {
    expect(isCreatedWithVersion(order({ created_with_version: "2026-05" }), "2026-05")).toBe(true)
    expect(isCreatedWithVersion(order({ created_with_version: "2017-08" }), "2026-05")).toBe(false)
  })

  it("compares the version under meta, where the API sends it", () => {
    expect(
      isCreatedWithVersion(order({ meta: { created_with_version: "2017-08" } }), "2017-08")
    ).toBe(true)
  })

  it("matches the version exactly", () => {
    expect(isCreatedWithVersion(order({ created_with_version: "2027-01" }), "2026-05")).toBe(false)
  })

  it("takes only a version the SDK supports", () => {
    // @ts-expect-error a mistyped version is a compile error, not a silent false
    expect(isCreatedWithVersion(order({ created_with_version: "2026-05" }), "2026-5")).toBe(false)
  })

  it("is undefined when the order does not say which version created it", () => {
    // What every order looks like until the SDK stops dropping `meta`.
    expect(isCreatedWithVersion(order({}), "2026-05")).toBeUndefined()
    expect(isCreatedWithVersion(order({ created_with_version: "" }), "2026-05")).toBeUndefined()
    expect(isCreatedWithVersion(undefined, "2026-05")).toBeUndefined()
    expect(isCreatedWithVersion(null, "2026-05")).toBeUndefined()
  })
})

import type { QueryFilter } from "@commercelayer/sdk"
import { describe, expect } from "vitest"
import { coreTest } from "#extender"
import { getPrices } from "./getPrices.js"
import { retrievePrice } from "./retrievePrice.js"

describe("retrievePrice", () => {
  coreTest("should return a single price", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const firstPrice = (await getPrices({ accessToken: token })).first()
    expect(firstPrice).toBeDefined()
    if (!firstPrice) {
      throw new Error("No price found")
    }
    const id = firstPrice?.id
    const result = await retrievePrice({
      id: id,
      accessToken: token,
    })
    expect(result).toBeDefined()
    expect(result.id).toBe(id)
    expect(result.sku_code).toBe(firstPrice.sku_code)
  })
})

import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { getSkus } from "./getSkus.js"
import { retrieveSku } from "./retrieveSku.js"

describe("retrieveSku", () => {
  coreIntegrationTest("should return a single SKU", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const firstSku = (await getSkus({ accessToken: token })).first()
    expect(firstSku).toBeDefined()
    if (!firstSku) {
      throw new Error("No SKU found")
    }
    const result = await retrieveSku({
      id: firstSku.id,
      accessToken: token,
    })
    expect(result).toBeDefined()
    expect(result.id).toBe(firstSku.id)
    expect(result.code).toBe(firstSku.code)
  })
})

import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { getSkuLists } from "./getSkuLists.js"

describe("getSkuLists", () => {
  coreIntegrationTest("should return a list of SKU lists", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const result = await getSkuLists({ accessToken: token })
    expect(result).toBeDefined()
  })
})

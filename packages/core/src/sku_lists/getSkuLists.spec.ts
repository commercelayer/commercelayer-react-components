import { describe, expect } from "vitest"
import { coreTest } from "#extender"
import { getSkuLists } from "./getSkuLists.js"

describe("getSkuLists", () => {
  coreTest("should return a list of SKU lists", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const result = await getSkuLists({ accessToken: token })
    expect(result).toBeDefined()
  })
})

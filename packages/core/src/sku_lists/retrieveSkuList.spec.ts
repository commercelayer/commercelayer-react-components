import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { getSkuLists } from "./getSkuLists.js"
import { retrieveSkuList } from "./retrieveSkuList.js"

describe("retrieveSkuList", () => {
  coreIntegrationTest(
    "should retrieve a SKU list by id with included skus",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      if (token == null) return
      const lists = await getSkuLists({ accessToken: token })
      const first = lists.first()
      if (!first) {
        console.warn("No SKU lists available, skipping test")
        return
      }
      const result = await retrieveSkuList({
        accessToken: token,
        id: first.id,
        params: { include: ["skus"], fields: { skus: ["code"] } },
      })
      expect(result).toBeDefined()
      expect(result.id).toBe(first.id)
    }
  )
})

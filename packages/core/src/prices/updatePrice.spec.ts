import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { getPrices } from "./getPrices"
import { updatePrice } from "./updatePrice"

describe("updatePrice", () => {
  coreIntegrationTest(
    "should update a single price",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      const firstPrice = (await getPrices({ accessToken: token })).first()
      expect(firstPrice).toBeDefined()
      if (!firstPrice) {
        throw new Error("No price found")
      }
      const id = firstPrice?.id
      const result = await updatePrice({
        accessToken: token,
        resource: {
          id,
          reference: "test-price",
        },
      })
      expect(result).toBeDefined()
      expect(result.id).toBe(id)
      expect(result.reference).toBe("test-price")
      const clean = await updatePrice({
        accessToken: token,
        resource: {
          id,
          reference: "",
        },
      })
      expect(clean).toBeDefined()
      expect(clean.id).toBe(id)
      expect(clean.reference).toBe("")
    },
  )
})

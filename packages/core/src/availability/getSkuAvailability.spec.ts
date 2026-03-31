import { describe, expect } from "vitest"
import { coreTest } from "#extender"
import { getSkuAvailability } from "./getSkuAvailability.js"

describe("getSkuAvailability", () => {
  coreTest(
    "should return availability for a sku code",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      if (token == null) return
      const result = await getSkuAvailability({
        accessToken: token,
        skuCode: "BABYONBU000000E63E7412MX",
      })
      expect(result).toBeDefined()
      if (result != null) {
        expect(typeof result.quantity).toBe("number")
        expect(result.skuCode).toBe("BABYONBU000000E63E7412MX")
      }
    },
  )

  coreTest(
    "should return null for a non-existent sku code",
    async ({ accessToken }) => {
      const token = accessToken?.accessToken
      if (token == null) return
      const result = await getSkuAvailability({
        accessToken: token,
        skuCode: "NON_EXISTENT_SKU_CODE_XYZ",
      })
      expect(result).toBeNull()
    },
  )
})

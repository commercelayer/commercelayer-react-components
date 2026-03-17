import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { getSkus } from "./getSkus"
import { updateSku } from "./updateSku"

describe("updateSku", () => {
  coreIntegrationTest("should update a single SKU", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const firstSku = (await getSkus({ accessToken: token })).first()
    expect(firstSku).toBeDefined()
    if (!firstSku) {
      throw new Error("No SKU found")
    }
    const result = await updateSku({
      accessToken: token,
      resource: {
        id: firstSku.id,
        reference: "test-sku",
      },
    })
    expect(result).toBeDefined()
    expect(result.id).toBe(firstSku.id)
    expect(result.reference).toBe("test-sku")
    const clean = await updateSku({
      accessToken: token,
      resource: {
        id: firstSku.id,
        reference: "",
      },
    })
    expect(clean).toBeDefined()
    expect(clean.id).toBe(firstSku.id)
    expect(clean.reference).toBe("")
  })
})

import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { createGiftCard } from "./createGiftCard.js"
import { updateGiftCard } from "./updateGiftCard.js"

describe("updateGiftCard", () => {
  coreIntegrationTest("should update a gift card", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const created = await createGiftCard({
      accessToken: token,
      resource: { currency_code: "USD", balance_cents: 5000 },
    })
    const result = await updateGiftCard({
      accessToken: token,
      resource: { id: created.id, reference: "test-gift-card" },
    })
    expect(result).toBeDefined()
    expect(result.id).toBe(created.id)
    expect(result.reference).toBe("test-gift-card")
    // Clean up reference
    const clean = await updateGiftCard({
      accessToken: token,
      resource: { id: created.id, reference: "" },
    })
    expect(clean.reference).toBe("")
  })
})

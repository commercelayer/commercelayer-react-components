import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { createGiftCard } from "./createGiftCard.js"

describe("createGiftCard", () => {
  coreIntegrationTest("should create a new gift card", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const result = await createGiftCard({
      accessToken: token,
      resource: {
        currency_code: "USD",
        balance_cents: 5000,
      },
    })
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.currency_code).toBe("USD")
    expect(result.balance_cents).toBe(5000)
  })
})

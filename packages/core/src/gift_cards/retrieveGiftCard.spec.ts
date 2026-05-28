import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { createGiftCard } from "./createGiftCard.js"
import { getGiftCards } from "./getGiftCards.js"
import { retrieveGiftCard } from "./retrieveGiftCard.js"

describe("retrieveGiftCard", () => {
  coreIntegrationTest("should retrieve a single gift card by ID", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const list = await getGiftCards({ accessToken: token })
    const first = list.first()
    if (first == null) {
      // No gift cards yet — create one to retrieve
      const created = await createGiftCard({
        accessToken: token,
        resource: { currency_code: "USD", initial_balance_cents: 1000 },
      })
      const result = await retrieveGiftCard({ accessToken: token, id: created.id })
      expect(result).toBeDefined()
      expect(result.id).toBe(created.id)
      return
    }
    const result = await retrieveGiftCard({ accessToken: token, id: first.id })
    expect(result).toBeDefined()
    expect(result.id).toBe(first.id)
  })
})

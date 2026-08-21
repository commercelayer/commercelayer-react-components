import { describe, expect } from "vitest"
import { coreIntegrationTest } from "#extender"
import { getGiftCards } from "./getGiftCards.js"

describe("getGiftCards", () => {
  coreIntegrationTest("should return a list of gift cards", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const result = await getGiftCards({ accessToken: token })
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  coreIntegrationTest("should return gift cards filtered by status", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const result = await getGiftCards({
      accessToken: token,
      params: {
        filters: { status_eq: "inactive" },
      },
    })
    expect(result).toBeDefined()
  })
})

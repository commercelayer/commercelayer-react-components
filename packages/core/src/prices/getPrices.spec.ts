import type { Price, QueryParamsList } from "@commercelayer/sdk"
import { describe, expect } from "vitest"
import { coreTest } from "#extender"
import { getPrices } from "./getPrices.js"

describe("getPrices", () => {
  coreTest("should return a list of prices", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const result = await getPrices({ accessToken: token })
    expect(result).toBeDefined()
  })

  coreTest("should return a single price", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    const params = {
      filters: {
        sku_code_eq: "DIGITALPRODUCT",
      },
    } satisfies QueryParamsList<Price>
    // Call the getPrices function
    const result = await getPrices({ accessToken: token, params })
    // Assert the expected result
    expect(result).toBeDefined()
    expect(result.getRecordCount()).toBe(1)
    // Add more assertions based on the expected behavior of the getPrices function
  })

  // Add more test cases for different scenarios
})

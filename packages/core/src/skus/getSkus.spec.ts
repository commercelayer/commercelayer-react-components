import type { QueryParamsList, Sku } from "@commercelayer/sdk"
import { describe, expect } from "vitest"
import { coreTest } from "#extender"
import { getSkus } from "./getSkus.js"

describe("getSkus", () => {
  coreTest("should return a list of SKUs", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const result = await getSkus({ accessToken: token })
    expect(result).toBeDefined()
  })

  coreTest("should return a filtered list of SKUs", async ({ accessToken }) => {
    const token = accessToken?.accessToken
    if (token == null) return
    const params = {
      filters: {
        code_eq: "TSHIRTMM000000E63E74MXXX",
      },
    } satisfies QueryParamsList<Sku>
    const result = await getSkus({ accessToken: token, params })
    expect(result).toBeDefined()
    expect(result.getRecordCount()).toBe(1)
  })
})

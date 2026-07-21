import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { setInStockSubscription } from "./setInStockSubscription.js"

const {
  mockCreate,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockCreate = vi.fn()
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockCreate,
    mockAddRequestInterceptor,
    mockAddResponseInterceptor,
    mockAddRawResponseReader,
  }
})

vi.mock("@commercelayer/sdk/bundle", () => ({
  CommerceLayer: vi.fn().mockReturnValue({
    addRequestInterceptor: mockAddRequestInterceptor,
    addResponseInterceptor: mockAddResponseInterceptor,
    addRawResponseReader: mockAddRawResponseReader,
    in_stock_subscriptions: { create: mockCreate },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

describe("setInStockSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
    mockCreate.mockResolvedValue(undefined)
  })

  test("resolves without a return value", async () => {
    const result = await setInStockSubscription({
      accessToken: "fake-token",
      skuCode: "TSHIRTMS000000FFFFFFXLXX",
    })

    expect(result).toBeUndefined()
  })

  test("calls in_stock_subscriptions.create with sku_code only when no customerEmail", async () => {
    await setInStockSubscription({
      accessToken: "fake-token",
      skuCode: "TSHIRTMS000000FFFFFFXLXX",
    })

    expect(mockCreate).toHaveBeenCalledWith({ sku_code: "TSHIRTMS000000FFFFFFXLXX" })
  })

  test("includes customer_email when provided", async () => {
    await setInStockSubscription({
      accessToken: "fake-token",
      skuCode: "TSHIRTMS000000FFFFFFXLXX",
      customerEmail: "test@example.com",
    })

    expect(mockCreate).toHaveBeenCalledWith({
      sku_code: "TSHIRTMS000000FFFFFFXLXX",
      customer_email: "test@example.com",
    })
  })

  test("throws when the API call fails", async () => {
    mockCreate.mockRejectedValue(new Error("API error"))

    await expect(
      setInStockSubscription({
        accessToken: "fake-token",
        skuCode: "TSHIRTMS000000FFFFFFXLXX",
      })
    ).rejects.toThrow("API error")
  })

  test("forwards request interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }

    await setInStockSubscription({
      accessToken: "fake-token",
      skuCode: "TSHIRTMS000000FFFFFFXLXX",
      interceptors,
    })

    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("forwards response interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }

    await setInStockSubscription({
      accessToken: "fake-token",
      skuCode: "TSHIRTMS000000FFFFFFXLXX",
      interceptors,
    })

    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("does not register any interceptors when none are provided", async () => {
    await setInStockSubscription({
      accessToken: "fake-token",
      skuCode: "TSHIRTMS000000FFFFFFXLXX",
    })

    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

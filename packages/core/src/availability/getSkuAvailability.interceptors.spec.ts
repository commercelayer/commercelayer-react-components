import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { getSkuAvailability } from "./getSkuAvailability.js"

const {
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
  mockSdkInstance,
  mockSkusRetrieve,
  mockSkusList,
} = vi.hoisted(() => {
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  const mockSkusRetrieve = vi.fn()
  const mockSkusList = vi.fn()
  return {
    mockAddRequestInterceptor,
    mockAddResponseInterceptor,
    mockAddRawResponseReader,
    mockSdkInstance: {
      addRequestInterceptor: mockAddRequestInterceptor,
      addResponseInterceptor: mockAddResponseInterceptor,
      addRawResponseReader: mockAddRawResponseReader,
    },
    mockSkusRetrieve,
    mockSkusList,
  }
})

vi.mock("@commercelayer/sdk/bundle", () => ({
  CommerceLayer: vi.fn().mockReturnValue(mockSdkInstance),
}))
vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi
    .fn()
    .mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))
vi.mock("@commercelayer/sdk", () => ({
  skus: { list: mockSkusList, retrieve: mockSkusRetrieve },
}))

const mockInventory = {
  available: true,
  quantity: 5,
  levels: [
    {
      quantity: 5,
      delivery_lead_times: [
        {
          min: { hours: 24, days: 1 },
          max: { hours: 48, days: 2 },
          shipping_method: {
            name: "Standard",
            reference: "STD",
            price_amount_cents: 0,
            free_over_amount_cents: 0,
            formatted_price_amount: "$0",
            formatted_free_over_amount: "$0",
          },
        },
      ],
    },
  ],
}

describe("getSkuAvailability interceptors", () => {
  beforeEach(() => vi.clearAllMocks())

  test("should forward request interceptors to getSdk", async () => {
    mockSkusRetrieve.mockResolvedValue({ code: "SKU-1", inventory: null })
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }
    await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
      interceptors,
    })
    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("should forward response interceptors to getSdk", async () => {
    mockSkusRetrieve.mockResolvedValue({ code: "SKU-1", inventory: null })
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }
    await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
      interceptors,
    })
    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(
      onSuccess,
      undefined,
    )
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("should not call interceptor methods when no interceptors provided", async () => {
    mockSkusRetrieve.mockResolvedValue({ code: "SKU-1", inventory: null })
    await getSkuAvailability({ accessToken: "fake-token", skuId: "sku-1" })
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })

  test("should return null when inventory is null (covers inventory == null branch)", async () => {
    mockSkusRetrieve.mockResolvedValue({ code: "SKU-1", inventory: null })
    const result = await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
    })
    expect(result).toBeNull()
    expect(mockSkusRetrieve).toHaveBeenCalledOnce()
  })

  test("should return availability data when inventory is present (covers retrieve + return path)", async () => {
    mockSkusRetrieve.mockResolvedValue({
      code: "SKU-1",
      inventory: mockInventory,
    })
    const result = await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
    })
    expect(result).not.toBeNull()
    expect(result?.skuCode).toBe("SKU-1")
    expect(result?.quantity).toBe(5)
    expect(result?.min).toEqual({ hours: 24, days: 1 })
    expect(result?.max).toEqual({ hours: 48, days: 2 })
    expect(result?.shipping_method?.name).toBe("Standard")
  })

  test("should return null when neither skuId nor skuCode is provided", async () => {
    const result = await getSkuAvailability({ accessToken: "fake-token" })
    expect(result).toBeNull()
    expect(mockSkusList).not.toHaveBeenCalled()
    expect(mockSkusRetrieve).not.toHaveBeenCalled()
  })

  test("should return availability with undefined delivery when levels array is empty", async () => {
    mockSkusRetrieve.mockResolvedValue({
      code: "SKU-1",
      inventory: { quantity: 3, levels: [] },
    })
    const result = await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
    })
    expect(result).not.toBeNull()
    expect(result?.quantity).toBe(3)
    expect(result?.min).toBeUndefined()
    expect(result?.max).toBeUndefined()
  })

  test("should return availability with undefined delivery when levels is undefined", async () => {
    mockSkusRetrieve.mockResolvedValue({
      code: "SKU-1",
      inventory: { quantity: 3 },
    })
    const result = await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
    })
    expect(result).not.toBeNull()
    expect(result?.quantity).toBe(3)
    expect(result?.min).toBeUndefined()
    expect(result?.max).toBeUndefined()
  })

  test("should return availability with undefined delivery when delivery_lead_times is empty", async () => {
    mockSkusRetrieve.mockResolvedValue({
      code: "SKU-1",
      inventory: {
        quantity: 2,
        levels: [{ quantity: 2, delivery_lead_times: [] }],
      },
    })
    const result = await getSkuAvailability({
      accessToken: "fake-token",
      skuId: "sku-1",
    })
    expect(result).not.toBeNull()
    expect(result?.quantity).toBe(2)
    expect(result?.min).toBeUndefined()
    expect(result?.shipping_method).toBeUndefined()
  })
})

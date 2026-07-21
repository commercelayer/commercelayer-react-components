import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { setShippingMethod } from "./setShippingMethod.js"

const {
  mockUpdate,
  mockRelationship,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockUpdate = vi.fn()
  const mockRelationship = vi.fn((id: string) => ({ id, type: "shipping_methods" }))
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockUpdate,
    mockRelationship,
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
    shipments: { update: mockUpdate },
    shipping_methods: { relationship: mockRelationship },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

describe("setShippingMethod", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
    mockUpdate.mockResolvedValue(undefined)
  })

  test("resolves without a return value", async () => {
    const result = await setShippingMethod({
      accessToken: "fake-token",
      shipmentId: "ship_1",
      shippingMethodId: "sm_1",
    })

    expect(result).toBeUndefined()
  })

  test("calls shipments.update with the correct id and shipping_method relationship", async () => {
    await setShippingMethod({
      accessToken: "fake-token",
      shipmentId: "ship_1",
      shippingMethodId: "sm_1",
    })

    expect(mockRelationship).toHaveBeenCalledWith("sm_1")
    expect(mockUpdate).toHaveBeenCalledWith({
      id: "ship_1",
      shipping_method: { id: "sm_1", type: "shipping_methods" },
    })
  })

  test("forwards request interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }

    await setShippingMethod({
      accessToken: "fake-token",
      shipmentId: "ship_1",
      shippingMethodId: "sm_1",
      interceptors,
    })

    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("forwards response interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }

    await setShippingMethod({
      accessToken: "fake-token",
      shipmentId: "ship_1",
      shippingMethodId: "sm_1",
      interceptors,
    })

    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("does not register any interceptors when none are provided", async () => {
    await setShippingMethod({
      accessToken: "fake-token",
      shipmentId: "ship_1",
      shippingMethodId: "sm_1",
    })

    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

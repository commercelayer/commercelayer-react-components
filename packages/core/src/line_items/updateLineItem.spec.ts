import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { updateLineItem } from "./updateLineItem.js"

const {
  mockUpdate,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockUpdate = vi.fn()
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockUpdate,
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
    line_items: { update: mockUpdate },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

const MOCK_LINE_ITEM = { id: "li_1", item_type: "skus", quantity: 3 }

describe("updateLineItem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
    mockUpdate.mockResolvedValue(MOCK_LINE_ITEM)
  })

  test("returns the updated line item", async () => {
    const result = await updateLineItem({
      accessToken: "fake-token",
      lineItemId: "li_1",
      quantity: 3,
    })

    expect(result).toEqual(MOCK_LINE_ITEM)
  })

  test("calls line_items.update with correct id and quantity", async () => {
    await updateLineItem({ accessToken: "fake-token", lineItemId: "li_1", quantity: 2 })

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: "li_1", quantity: 2 }))
  })

  test("passes hasExternalPrice as _external_price", async () => {
    await updateLineItem({
      accessToken: "fake-token",
      lineItemId: "li_1",
      hasExternalPrice: true,
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "li_1", _external_price: true })
    )
  })

  test("forwards request interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }

    await updateLineItem({ accessToken: "fake-token", lineItemId: "li_1", interceptors })

    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("forwards response interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }

    await updateLineItem({ accessToken: "fake-token", lineItemId: "li_1", interceptors })

    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("does not register any interceptors when none are provided", async () => {
    await updateLineItem({ accessToken: "fake-token", lineItemId: "li_1" })

    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

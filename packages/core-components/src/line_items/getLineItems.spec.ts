import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { getLineItems } from "./getLineItems.js"

const {
  mockRetrieve,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockRetrieve = vi.fn()
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockRetrieve,
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
    orders: { retrieve: mockRetrieve },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

const MOCK_LINE_ITEMS = [
  { id: "li_1", item_type: "skus", quantity: 2 },
  { id: "li_2", item_type: "gift_cards", quantity: 1 },
]

describe("getLineItems", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
  })

  test("returns line_items from the retrieved order", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1", line_items: MOCK_LINE_ITEMS })

    const result = await getLineItems({ accessToken: "fake-token", orderId: "order-1" })

    expect(result).toEqual(MOCK_LINE_ITEMS)
  })

  test("returns an empty array when order has no line_items", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1" })

    const result = await getLineItems({ accessToken: "fake-token", orderId: "order-1" })

    expect(result).toEqual([])
  })

  test("calls orders.retrieve with the correct orderId and includes", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1", line_items: [] })

    await getLineItems({ accessToken: "fake-token", orderId: "order-1" })

    expect(mockRetrieve).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({
        include: expect.arrayContaining([
          "line_items",
          "line_items.line_item_options.sku_option",
          "line_items.item",
        ]),
        fields: { orders: ["line_items"] },
      })
    )
  })

  test("forwards request interceptors to getSdk", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1", line_items: [] })
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }

    await getLineItems({ accessToken: "fake-token", orderId: "order-1", interceptors })

    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("forwards response interceptors to getSdk", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1", line_items: [] })
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }

    await getLineItems({ accessToken: "fake-token", orderId: "order-1", interceptors })

    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("does not register any interceptors when none are provided", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1", line_items: [] })

    await getLineItems({ accessToken: "fake-token", orderId: "order-1" })

    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

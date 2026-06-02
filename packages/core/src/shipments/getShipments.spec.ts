import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { getShipments } from "./getShipments.js"

const {
  mockRetrieve,
  mockDeliveryLeadTimesList,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockRetrieve = vi.fn()
  const mockDeliveryLeadTimesList = vi.fn()
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockRetrieve,
    mockDeliveryLeadTimesList,
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
    delivery_lead_times: { list: mockDeliveryLeadTimesList },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

const MOCK_SHIPMENTS = [
  { id: "ship_1", status: "upcoming" },
  { id: "ship_2", status: "picking" },
]

const MOCK_DELIVERY_LEAD_TIMES = [
  { id: "dlt_1", shipping_method: { id: "sm_1" } },
  { id: "dlt_2", shipping_method: { id: "sm_2" } },
]

function mockDeliveryLeadTimesPage(items: unknown[], pageCount = 1) {
  return Object.assign([...items], { meta: { pageCount } })
}

describe("getShipments", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
    mockRetrieve.mockResolvedValue({ id: "order-1", shipments: MOCK_SHIPMENTS })
    mockDeliveryLeadTimesList.mockResolvedValue(
      mockDeliveryLeadTimesPage(MOCK_DELIVERY_LEAD_TIMES, 1)
    )
  })

  test("returns shipments from the retrieved order", async () => {
    const result = await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(result.shipments).toEqual(MOCK_SHIPMENTS)
  })

  test("returns empty shipments array when order has none", async () => {
    mockRetrieve.mockResolvedValue({ id: "order-1" })

    const result = await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(result.shipments).toEqual([])
  })

  test("returns delivery lead times", async () => {
    const result = await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(result.deliveryLeadTimes).toEqual(MOCK_DELIVERY_LEAD_TIMES)
  })

  test("paginates through all delivery lead time pages", async () => {
    const page1 = [{ id: "dlt_1" }]
    const page2 = [{ id: "dlt_2" }]
    mockDeliveryLeadTimesList
      .mockResolvedValueOnce(mockDeliveryLeadTimesPage(page1, 2))
      .mockResolvedValueOnce(mockDeliveryLeadTimesPage(page2, 2))

    const result = await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(mockDeliveryLeadTimesList).toHaveBeenCalledTimes(2)
    expect(result.deliveryLeadTimes).toEqual([...page1, ...page2])
  })

  test("calls orders.retrieve with the correct orderId and shipment includes", async () => {
    await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(mockRetrieve).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({
        include: expect.arrayContaining([
          "shipments.available_shipping_methods",
          "shipments.stock_line_items.line_item",
          "shipments.shipping_method",
          "shipments.stock_transfers.line_item",
          "shipments.stock_location",
          "shipments.parcels.parcel_line_items",
        ]),
        fields: { orders: ["shipments"] },
      })
    )
  })

  test("calls delivery_lead_times.list with shipping_method and stock_location includes", async () => {
    await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(mockDeliveryLeadTimesList).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.arrayContaining(["shipping_method", "stock_location"]),
      })
    )
  })

  test("forwards request interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }

    await getShipments({ accessToken: "fake-token", orderId: "order-1", interceptors })

    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("forwards response interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }

    await getShipments({ accessToken: "fake-token", orderId: "order-1", interceptors })

    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("does not register any interceptors when none are provided", async () => {
    await getShipments({ accessToken: "fake-token", orderId: "order-1" })

    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

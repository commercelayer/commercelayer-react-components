/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useShipments } from "./useShipments"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const MOCK_SHIPMENTS = [
  { id: "ship_1", status: "upcoming" },
  { id: "ship_2", status: "picking" },
]

const MOCK_DELIVERY_LEAD_TIMES = [{ id: "dlt_1", shipping_method: { id: "sm_1" } }]

const MOCK_RESULT = { shipments: MOCK_SHIPMENTS, deliveryLeadTimes: MOCK_DELIVERY_LEAD_TIMES }

const mockGetShipments = vi.fn().mockResolvedValue(MOCK_RESULT)
const mockSetShippingMethod = vi.fn().mockResolvedValue(undefined)

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getShipments: (...args: unknown[]) => mockGetShipments(...args),
    setShippingMethod: (...args: unknown[]) => mockSetShippingMethod(...args),
  }
})

describe("useShipments", () => {
  const accessToken = "test-token"
  const orderId = "order-1"

  beforeEach(() => {
    mockGetShipments.mockClear()
    mockSetShippingMethod.mockClear()
    mockGetShipments.mockResolvedValue(MOCK_RESULT)
  })

  it("returns empty arrays and no loading when orderId is null", () => {
    const { result } = renderHook(() => useShipments({ accessToken, orderId: null }), {
      wrapper: swrWrapper,
    })

    expect(result.current.shipments).toEqual([])
    expect(result.current.deliveryLeadTimes).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockGetShipments).not.toHaveBeenCalled()
  })

  it("returns empty arrays and no loading when orderId is undefined", () => {
    const { result } = renderHook(() => useShipments({ accessToken }), {
      wrapper: swrWrapper,
    })

    expect(result.current.shipments).toEqual([])
    expect(result.current.deliveryLeadTimes).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockGetShipments).not.toHaveBeenCalled()
  })

  it("returns empty arrays and no loading when accessToken is undefined", () => {
    const { result } = renderHook(() => useShipments({ orderId }), {
      wrapper: swrWrapper,
    })

    expect(result.current.shipments).toEqual([])
    expect(result.current.deliveryLeadTimes).toEqual([])
    expect(mockGetShipments).not.toHaveBeenCalled()
  })

  it("fetches and returns shipments and delivery lead times when given valid params", async () => {
    const { result } = renderHook(() => useShipments({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => {
      expect(result.current.shipments).toEqual(MOCK_SHIPMENTS)
      expect(result.current.deliveryLeadTimes).toEqual(MOCK_DELIVERY_LEAD_TIMES)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  it("calls getShipments with correct accessToken and orderId", async () => {
    renderHook(() => useShipments({ accessToken, orderId }), { wrapper: swrWrapper })

    await waitFor(() => {
      expect(mockGetShipments).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken, orderId })
      )
    })
  })

  it("setShippingMethod calls core function with correct args and triggers revalidation", async () => {
    const { result } = renderHook(() => useShipments({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => expect(result.current.shipments).toEqual(MOCK_SHIPMENTS))

    await act(async () => {
      await result.current.setShippingMethod("ship_1", "sm_1")
    })

    expect(mockSetShippingMethod).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken, shipmentId: "ship_1", shippingMethodId: "sm_1" })
    )
    expect(mockGetShipments).toHaveBeenCalledTimes(2)
  })

  it("setShippingMethod throws when accessToken is not provided", async () => {
    const { result } = renderHook(() => useShipments({ orderId }), {
      wrapper: swrWrapper,
    })

    await expect(result.current.setShippingMethod("ship_1", "sm_1")).rejects.toThrow(
      "accessToken is required"
    )
  })

  it("reload triggers revalidation", async () => {
    const { result } = renderHook(() => useShipments({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => expect(result.current.shipments).toEqual(MOCK_SHIPMENTS))

    await act(async () => {
      await result.current.reload()
    })

    expect(mockGetShipments).toHaveBeenCalledTimes(2)
  })

  it("exposes error message when getShipments throws", async () => {
    mockGetShipments.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useShipments({ accessToken, orderId }), {
      wrapper: swrWrapper,
    })

    await waitFor(
      () => {
        expect(result.current.error).toBe("Network error")
        expect(result.current.shipments).toEqual([])
        expect(result.current.deliveryLeadTimes).toEqual([])
      },
      { timeout: 5000 }
    )
  })

  it("passes interceptors to getShipments", async () => {
    const interceptors: InterceptorManager = {
      request: { onSuccess: vi.fn((req) => req) },
    }

    renderHook(() => useShipments({ accessToken, orderId, interceptors }), {
      wrapper: swrWrapper,
    })

    await waitFor(() => {
      expect(mockGetShipments).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
    })
  })

  it("passes interceptors to setShippingMethod", async () => {
    const interceptors: InterceptorManager = {
      request: { onSuccess: vi.fn((req) => req) },
    }

    const { result } = renderHook(() => useShipments({ accessToken, orderId, interceptors }), {
      wrapper: swrWrapper,
    })

    await act(async () => {
      await result.current.setShippingMethod("ship_1", "sm_1")
    })

    expect(mockSetShippingMethod).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
  })
})

import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import OrderStorageContext from "#context/OrderStorageContext"
import { HostedCart } from "#components/orders/HostedCart"
import * as organizationUtils from "#utils/organization"
import * as applicationLinkUtils from "#utils/getApplicationLink"
import { render, waitFor } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("iframe-resizer", () => ({
  iframeResizer: vi.fn(),
}))

describe("HostedCart component", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("updates minicart url when persistKey changes", async () => {
    localStorage.setItem("cart-key-1", "order-id-1")
    localStorage.setItem("cart-key-2", "order-id-2")

    vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)

    const getApplicationLinkSpy = vi
      .spyOn(applicationLinkUtils, "getApplicationLink")
      .mockImplementation(
        ({ orderId }) => `https://test-cart.local/cart/${orderId}`,
      )

    const orderContextValue = {
      ...defaultOrderContext,
      createOrder: vi.fn().mockResolvedValue("created-order-id"),
    }

    const commonProps = {
      clearWhenPlaced: true,
      getLocalOrder: vi.fn(),
      setLocalOrder: vi.fn(),
      deleteLocalOrder: vi.fn(),
    }

    const { rerender } = render(
      <CommerceLayerContext.Provider
        value={{
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig",
        }}
      >
        <OrderContext.Provider value={orderContextValue}>
          <OrderStorageContext.Provider
            value={{
              persistKey: "cart-key-1",
              ...commonProps,
            }}
          >
            <HostedCart />
          </OrderStorageContext.Provider>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>,
    )

    await waitFor(() => {
      expect(getApplicationLinkSpy).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "order-id-1" }),
      )
    })

    rerender(
      <CommerceLayerContext.Provider
        value={{
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig",
        }}
      >
        <OrderContext.Provider value={orderContextValue}>
          <OrderStorageContext.Provider
            value={{
              persistKey: "cart-key-2",
              ...commonProps,
            }}
          >
            <HostedCart />
          </OrderStorageContext.Provider>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>,
    )

    await waitFor(() => {
      expect(getApplicationLinkSpy).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "order-id-2" }),
      )
    })
  })
})

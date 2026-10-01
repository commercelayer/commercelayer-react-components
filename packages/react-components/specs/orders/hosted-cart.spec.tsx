import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { CartLink } from "#components/orders/CartLink"
import { HostedCart } from "#components/orders/HostedCart"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import OrderStorageContext from "#context/OrderStorageContext"
import * as applicationLinkUtils from "#utils/getApplicationLink"
import { publish } from "#utils/events"
import * as organizationUtils from "#utils/organization"

const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

vi.mock("@iframe-resizer/parent", () => ({
  default: vi.fn(),
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
      .mockImplementation(({ orderId }) => `https://test-cart.local/cart/${orderId}`)

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
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig",
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
      </CommerceLayerContext.Provider>
    )

    await waitFor(() => {
      expect(getApplicationLinkSpy).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "order-id-1" })
      )
    })

    rerender(
      <CommerceLayerContext.Provider
        value={{
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig",
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
      </CommerceLayerContext.Provider>
    )

    await waitFor(() => {
      expect(getApplicationLinkSpy).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "order-id-2" })
      )
    })
  })

  describe("mini cart opening", () => {
    const renderMiniCart = (
      props: { openAdd?: boolean } = {}
    ): { panel: () => HTMLElement | null | undefined } => {
      localStorage.setItem("mini-cart-key", "order-id-1")
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockImplementation(
        ({ orderId }) => `https://test-cart.local/cart/${orderId}`
      )

      const { container } = render(
        <CommerceLayerContext.Provider value={{ accessToken }}>
          <OrderContext.Provider value={defaultOrderContext}>
            <OrderStorageContext.Provider
              value={{
                persistKey: "mini-cart-key",
                clearWhenPlaced: true,
                getLocalOrder: vi.fn(),
                setLocalOrder: vi.fn(),
                deleteLocalOrder: vi.fn(),
              }}
            >
              <CartLink type="mini" label="Open mini cart" />
              <HostedCart type="mini" {...props} />
            </OrderStorageContext.Provider>
          </OrderContext.Provider>
        </CommerceLayerContext.Provider>
      )

      return {
        panel: () => container.querySelector('iframe[title="Cart"]')?.parentElement,
      }
    }

    // The pairing <CartLink type="mini"> + <HostedCart type="mini"> is what the
    // HostedCart docblock tells people to use, and it used to do nothing at all:
    // the open-cart subscription was gated on `openAdd`, which is about adding
    // items, so a deliberate click never reached a subscriber.
    it("opens on a CartLink click when openAdd is not set", async () => {
      const { panel } = renderMiniCart()

      await waitFor(() => {
        expect(panel()).toBeTruthy()
      })
      expect(panel()?.style.right).toBe("-25rem")

      fireEvent.click(screen.getByText("Open mini cart"))

      await waitFor(() => {
        expect(panel()?.style.right).toBe("0px")
      })
    })

    it("still ignores an add-to-cart open when openAdd is false", async () => {
      const { panel } = renderMiniCart({ openAdd: false })

      await waitFor(() => {
        expect(panel()).toBeTruthy()
      })

      publish("open-cart", { source: "add-to-cart" })

      await new Promise((resolve) => setTimeout(resolve, 500))
      expect(panel()?.style.right).toBe("-25rem")
    })

    it("opens on an add-to-cart event when openAdd is true", async () => {
      const { panel } = renderMiniCart({ openAdd: true })

      await waitFor(() => {
        expect(panel()).toBeTruthy()
      })

      publish("open-cart", { source: "add-to-cart" })

      await waitFor(() => {
        expect(panel()?.style.right).toBe("0px")
      })
    })
  })
})

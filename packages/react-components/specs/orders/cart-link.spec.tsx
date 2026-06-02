import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { CartLink } from "#components/orders/CartLink"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import * as applicationLinkUtils from "#utils/getApplicationLink"
import * as organizationUtils from "#utils/organization"

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

const CART_URL = "https://test-org.commercelayer.app/cart/order-id-1?accessToken=fake"

const mockOrder = { id: "order-id-1" }

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: FAKE_TOKEN }}>
      <OrderContext.Provider
        value={{ ...defaultOrderContext, order: mockOrder as any, createOrder: vi.fn() }}
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("CartLink", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(CART_URL)
    vi.spyOn(window, "open").mockImplementation(vi.fn())
  })

  describe("rendering", () => {
    it("renders an anchor with the given label", () => {
      render(
        <Wrapper>
          <CartLink label="View cart" />
        </Wrapper>
      )
      expect(screen.getByRole("link", { name: /view cart/i })).toBeDefined()
    })

    it("sets href from getApplicationLink", () => {
      render(
        <Wrapper>
          <CartLink label="Cart" />
        </Wrapper>
      )
      expect(screen.getByRole("link").getAttribute("href")).toBe(CART_URL)
    })

    it("has rel=noreferrer by default to prevent Referer header leakage", () => {
      render(
        <Wrapper>
          <CartLink label="Cart" />
        </Wrapper>
      )
      expect(screen.getByRole("link").getAttribute("rel")).toBe("noreferrer")
    })

    it("throws when rendered outside <CommerceLayer>", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
      expect(() =>
        render(
          <OrderContext.Provider value={{ ...defaultOrderContext, createOrder: vi.fn() }}>
            <CartLink label="Cart" />
          </OrderContext.Provider>
        )
      ).toThrow("Cannot use `CartLink` outside of `CommerceLayer`")
      consoleSpy.mockRestore()
    })
  })

  describe("handleClick", () => {
    it("navigates to config.links.cart when org config provides it", async () => {
      const configCartUrl = "https://org-cart.example.com/order-id-1"
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue({
        links: { cart: configCartUrl },
      } as any)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CartLink label="Cart" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(configCartUrl, "_self")
      })
    })

    it("falls back to getApplicationLink url when config has no cart link", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CartLink label="Cart" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(CART_URL, "_self")
      })
    })
  })
})

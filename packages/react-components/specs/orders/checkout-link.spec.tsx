import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { CheckoutLink } from "#components/orders/CheckoutLink"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import * as applicationLinkUtils from "#utils/getApplicationLink"
import * as organizationUtils from "#utils/organization"

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

const HOSTED_CHECKOUT_URL =
  "https://test-org.commercelayer.app/checkout/order-id-1?accessToken=fake"

const mockOrder = {
  id: "order-id-1",
  checkout_url: "https://custom-checkout.example.com/order-id-1",
}

function makeOrderCtx(order: typeof mockOrder | null = mockOrder) {
  return { ...defaultOrderContext, order: order as any }
}

function Wrapper({
  children,
  orderCtx = makeOrderCtx(),
}: {
  children: React.ReactNode
  orderCtx?: ReturnType<typeof makeOrderCtx>
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: FAKE_TOKEN }}>
      <OrderContext.Provider value={orderCtx}>{children}</OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("CheckoutLink", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(window, "open").mockImplementation(vi.fn())
  })

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  describe("rendering", () => {
    it("renders an anchor with the given label", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      render(
        <Wrapper>
          <CheckoutLink label="Go to checkout" />
        </Wrapper>
      )
      expect(screen.getByRole("link", { name: /go to checkout/i })).toBeDefined()
    })

    it("builds href via getApplicationLink when hostedCheckout=true (default)", () => {
      const spy = vi
        .spyOn(applicationLinkUtils, "getApplicationLink")
        .mockReturnValue(HOSTED_CHECKOUT_URL)

      render(
        <Wrapper>
          <CheckoutLink label="Checkout" />
        </Wrapper>
      )

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "order-id-1",
          applicationType: "checkout",
        })
      )
      expect(screen.getByRole("link").getAttribute("href")).toBe(HOSTED_CHECKOUT_URL)
    })

    it("uses order.checkout_url when hostedCheckout=false", () => {
      render(
        <Wrapper>
          <CheckoutLink label="Checkout" hostedCheckout={false} />
        </Wrapper>
      )
      expect(screen.getByRole("link").getAttribute("href")).toBe(mockOrder.checkout_url)
    })

    it("falls back to empty string when hostedCheckout=false and checkout_url is absent", () => {
      render(
        <Wrapper orderCtx={makeOrderCtx({ id: "order-id-1", checkout_url: undefined } as any)}>
          <CheckoutLink label="Checkout" hostedCheckout={false} />
        </Wrapper>
      )
      expect(screen.getByText("Checkout").getAttribute("href")).toBe("")
    })

    it("forwards className to the anchor element", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      render(
        <Wrapper>
          <CheckoutLink label="Checkout" className="my-class" />
        </Wrapper>
      )
      expect(screen.getByRole("link").getAttribute("class")).toBe("my-class")
    })

    it("forwards target to the anchor element", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      render(
        <Wrapper>
          <CheckoutLink label="Checkout" target="_blank" />
        </Wrapper>
      )
      expect(screen.getByRole("link").getAttribute("target")).toBe("_blank")
    })

    it("has rel=noreferrer by default to prevent Referer header leakage", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      render(
        <Wrapper>
          <CheckoutLink label="Checkout" />
        </Wrapper>
      )
      expect(screen.getByRole("link").getAttribute("rel")).toBe("noreferrer")
    })

    it("throws when rendered outside <CommerceLayer>", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
      expect(() => render(<CheckoutLink label="Checkout" />)).toThrow(
        "Cannot use `CheckoutLink` outside of `CommerceLayer`"
      )
      consoleSpy.mockRestore()
    })
  })

  // ---------------------------------------------------------------------------
  // handleClick — navigation
  // ---------------------------------------------------------------------------

  describe("handleClick", () => {
    it("navigates to config.links.checkout when org config provides it", async () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue({
        links: { checkout: "https://org-checkout.example.com/order-id-1" },
      } as any)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CheckoutLink label="Checkout" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(
          "https://org-checkout.example.com/order-id-1",
          "_self"
        )
      })
    })

    it("falls back to the resolved href when config.links.checkout is absent", async () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CheckoutLink label="Checkout" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(HOSTED_CHECKOUT_URL, "_self")
      })
    })

    it("skips getOrganizationConfig and opens href directly when order.id is absent", async () => {
      const getOrgConfigSpy = vi.spyOn(organizationUtils, "getOrganizationConfig")
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper orderCtx={makeOrderCtx(null)}>
          <CheckoutLink label="Checkout" hostedCheckout={false} />
        </Wrapper>
      )
      fireEvent.click(screen.getByText("Checkout"))

      await waitFor(() => {
        expect(getOrgConfigSpy).not.toHaveBeenCalled()
        expect(windowOpenSpy).toHaveBeenCalledWith(expect.any(String), "_self")
      })
    })

    it("opens in a new tab when target=_blank", async () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CheckoutLink label="Checkout" target="_blank" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(expect.any(String), "_blank")
      })
    })

    it("opens in _top when target=_top", async () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CheckoutLink label="Checkout" target="_top" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(expect.any(String), "_top")
      })
    })

    it("defaults to _self when no target is provided", async () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(vi.fn())

      render(
        <Wrapper>
          <CheckoutLink label="Checkout" />
        </Wrapper>
      )
      fireEvent.click(screen.getByRole("link"))

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(expect.any(String), "_self")
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Children render prop
  // ---------------------------------------------------------------------------

  describe("children render prop", () => {
    it("passes href and handleClick to the children function", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      let capturedHref: string | undefined
      let capturedHandleClick: unknown

      render(
        <Wrapper>
          <CheckoutLink>
            {({ href, handleClick }) => {
              capturedHref = href
              capturedHandleClick = handleClick
              return (
                <a href={href} onClick={handleClick} data-testid="custom-link">
                  Custom
                </a>
              )
            }}
          </CheckoutLink>
        </Wrapper>
      )

      expect(capturedHref).toBe(HOSTED_CHECKOUT_URL)
      expect(typeof capturedHandleClick).toBe("function")
      expect(screen.getByTestId("custom-link")).toBeDefined()
    })

    it("exposes orderId and accessToken in the children props", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      let capturedOrderId: string | undefined
      let capturedAccessToken: string | undefined

      render(
        <Wrapper>
          <CheckoutLink>
            {({ orderId, accessToken }) => {
              capturedOrderId = orderId
              capturedAccessToken = accessToken
              return null
            }}
          </CheckoutLink>
        </Wrapper>
      )

      expect(capturedOrderId).toBe("order-id-1")
      expect(capturedAccessToken).toBe(FAKE_TOKEN)
    })

    it("exposes checkoutUrl from the order in the children props", () => {
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(HOSTED_CHECKOUT_URL)
      let capturedCheckoutUrl: string | undefined

      render(
        <Wrapper>
          <CheckoutLink>
            {({ checkoutUrl }) => {
              capturedCheckoutUrl = checkoutUrl
              return null
            }}
          </CheckoutLink>
        </Wrapper>
      )

      expect(capturedCheckoutUrl).toBe(mockOrder.checkout_url)
    })
  })
})

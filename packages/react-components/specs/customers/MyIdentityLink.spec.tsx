import { render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { MyIdentityLink } from "#components/customers/MyIdentityLink"
import CommerceLayerContext from "#context/CommerceLayerContext"
import * as applicationLinkUtils from "#utils/getApplicationLink"
import * as organizationUtils from "#utils/organization"

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

const IDENTITY_URL =
  "https://test-org.commercelayer.app/identity/?accessToken=fake&clientId=client123&scope=market%3A1234&returnUrl=https%3A%2F%2Fshop.example.com"

const DEFAULT_PROPS = {
  label: "Login",
  type: "login" as const,
  clientId: "client123",
  scope: "market:1234",
  returnUrl: "https://shop.example.com",
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: FAKE_TOKEN }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

describe("MyIdentityLink", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("rendering", () => {
    it("renders an anchor with the given label", () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(IDENTITY_URL)

      render(
        <Wrapper>
          <MyIdentityLink {...DEFAULT_PROPS} />
        </Wrapper>
      )

      expect(screen.getByText("Login")).toBeDefined()
    })

    it("has rel=noreferrer by default to prevent Referer header leakage", () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(IDENTITY_URL)

      render(
        <Wrapper>
          <MyIdentityLink {...DEFAULT_PROPS} />
        </Wrapper>
      )

      expect(screen.getByText("Login").getAttribute("rel")).toBe("noreferrer")
    })

    it("throws when rendered outside <CommerceLayer>", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
      expect(() => render(<MyIdentityLink {...DEFAULT_PROPS} />)).toThrow(
        "Cannot use `MyIdentityLink` outside of `CommerceLayer`"
      )
      consoleSpy.mockRestore()
    })
  })

  describe("href resolution", () => {
    it("uses config.links.identity when org config provides it", async () => {
      const configUrl = "https://org-identity.example.com/?token=abc"
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue({
        links: { identity: configUrl },
      } as any)

      render(
        <Wrapper>
          <MyIdentityLink {...DEFAULT_PROPS} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole("link").getAttribute("href")).toBe(configUrl)
      })
    })

    it("falls back to getApplicationLink when config has no identity link", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(IDENTITY_URL)

      render(
        <Wrapper>
          <MyIdentityLink {...DEFAULT_PROPS} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole("link").getAttribute("href")).toBe(IDENTITY_URL)
      })
    })

    it("calls getApplicationLink with modeType=signup for type=signup", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      const spy = vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(IDENTITY_URL)

      render(
        <Wrapper>
          <MyIdentityLink {...DEFAULT_PROPS} type="signup" />
        </Wrapper>
      )

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            applicationType: "identity",
            modeType: "signup",
          })
        )
      })
    })
  })
})

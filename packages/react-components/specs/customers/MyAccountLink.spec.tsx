import { render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { MyAccountLink } from "#components/customers/MyAccountLink"
import CommerceLayerContext from "#context/CommerceLayerContext"
import * as applicationLinkUtils from "#utils/getApplicationLink"
import * as organizationUtils from "#utils/organization"

// Token with owner → disabled=false
const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

// Token without owner → disabled=true
const FAKE_TOKEN_NO_OWNER =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTl9.fake-sig"

const MY_ACCOUNT_URL =
  "https://test-org.commercelayer.app/my-account/?accessToken=fake&returnUrl=https%3A%2F%2Fshop.example.com"

function Wrapper({ children, token = FAKE_TOKEN }: { children: React.ReactNode; token?: string }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: token }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

describe("MyAccountLink", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("rendering", () => {
    it("renders a default label", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(MY_ACCOUNT_URL)

      render(
        <Wrapper>
          <MyAccountLink />
        </Wrapper>
      )

      expect(screen.getByText("Go to my account")).toBeDefined()
    })

    it("renders with a custom label", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(MY_ACCOUNT_URL)

      render(
        <Wrapper>
          <MyAccountLink label="My profile" />
        </Wrapper>
      )

      expect(screen.getByText("My profile")).toBeDefined()
    })

    it("has rel=noreferrer by default to prevent Referer header leakage", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(MY_ACCOUNT_URL)

      render(
        <Wrapper>
          <MyAccountLink />
        </Wrapper>
      )

      expect(screen.getByText("Go to my account").getAttribute("rel")).toBe("noreferrer")
    })

    it("is not aria-disabled when token has owner", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(MY_ACCOUNT_URL)

      render(
        <Wrapper>
          <MyAccountLink />
        </Wrapper>
      )

      expect(screen.getByText("Go to my account").getAttribute("aria-disabled")).toBe("false")
    })

    it("is aria-disabled when token has no owner", () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(MY_ACCOUNT_URL)

      render(
        <Wrapper token={FAKE_TOKEN_NO_OWNER}>
          <MyAccountLink />
        </Wrapper>
      )

      expect(screen.getByText("Go to my account").getAttribute("aria-disabled")).toBe("true")
    })

    it("throws when rendered outside <CommerceLayer>", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
      expect(() => render(<MyAccountLink />)).toThrow(
        "Cannot use `MyAccountLink` outside of `CommerceLayer`"
      )
      consoleSpy.mockRestore()
    })
  })

  describe("href resolution", () => {
    it("uses config.links.my_account when org config provides it", async () => {
      const configUrl = "https://org-my-account.example.com/"
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue({
        links: { my_account: configUrl },
      } as any)

      render(
        <Wrapper>
          <MyAccountLink />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole("link").getAttribute("href")).toBe(configUrl)
      })
    })

    it("falls back to getApplicationLink when config has no my_account link", async () => {
      vi.spyOn(organizationUtils, "getOrganizationConfig").mockResolvedValue(null)
      vi.spyOn(applicationLinkUtils, "getApplicationLink").mockReturnValue(MY_ACCOUNT_URL)

      render(
        <Wrapper>
          <MyAccountLink />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole("link").getAttribute("href")).toBe(MY_ACCOUNT_URL)
      })
    })
  })
})

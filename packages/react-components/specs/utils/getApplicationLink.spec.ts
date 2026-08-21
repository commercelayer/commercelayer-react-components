import { describe, expect, it } from "vitest"
import { getApplicationLink } from "#utils/getApplicationLink"

const base = {
  accessToken: "test-token",
  slug: "myorg",
  domain: "commercelayer.io",
}

describe("getApplicationLink", () => {
  describe("identity application", () => {
    it("generates a basic login link", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "login",
        clientId: "client123",
        scope: "market:1234",
        returnUrl: "https://shop.example.com/",
      })
      const parsed = new URL(url)
      expect(parsed.hostname).toBe("myorg.commercelayer.app")
      expect(parsed.pathname).toBe("/identity/")
      expect(parsed.searchParams.get("accessToken")).toBe("test-token")
      expect(parsed.searchParams.get("clientId")).toBe("client123")
      expect(parsed.searchParams.get("scope")).toBe("market:1234")
      expect(parsed.searchParams.get("returnUrl")).toBe("https://shop.example.com/")
    })

    it("generates a signup link", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "signup",
        clientId: "client123",
        scope: "market:1234",
        returnUrl: "https://shop.example.com/",
      })
      const parsed = new URL(url)
      expect(parsed.pathname).toBe("/identity/signup")
    })

    it("includes resetPasswordUrl when provided", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "login",
        clientId: "client123",
        scope: "market:1234",
        returnUrl: "https://shop.example.com/",
        resetPasswordUrl: "https://shop.example.com/reset",
      })
      const parsed = new URL(url)
      expect(parsed.searchParams.get("resetPasswordUrl")).toBe("https://shop.example.com/reset")
    })

    it("encodes returnUrl containing query string characters to prevent injection", () => {
      // An attacker-crafted shop URL with injected clientId/scope
      const maliciousReturnUrl = "https://shop.example.com/?anything=&clientId=attacker&scope=evil"

      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "login",
        clientId: "legit-client",
        scope: "market:1234",
        returnUrl: maliciousReturnUrl,
      })

      const parsed = new URL(url)
      // The injected parameters must NOT appear as top-level query params
      expect(parsed.searchParams.get("clientId")).toBe("legit-client")
      expect(parsed.searchParams.get("scope")).toBe("market:1234")
      // The full malicious URL must be safely encoded inside returnUrl
      expect(parsed.searchParams.get("returnUrl")).toBe(maliciousReturnUrl)
      // The raw URL string must not contain the literal unencoded injection
      expect(url).not.toContain("clientId=attacker")
      expect(url).not.toContain("scope=evil")
    })

    it("encodes resetPasswordUrl containing special characters", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "login",
        clientId: "client123",
        scope: "market:1234",
        returnUrl: "https://shop.example.com/",
        resetPasswordUrl: "https://shop.example.com/reset?token=abc&other=xyz",
      })
      const parsed = new URL(url)
      expect(parsed.searchParams.get("resetPasswordUrl")).toBe(
        "https://shop.example.com/reset?token=abc&other=xyz"
      )
      // Must not appear as unencoded top-level params
      expect(url).not.toMatch(/[?&]token=abc/)
    })

    it("encodes clientId and scope with special characters", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "login",
        clientId: "client id with spaces & symbols",
        scope: "market:1234 store:5678",
        returnUrl: "https://shop.example.com/",
      })
      const parsed = new URL(url)
      expect(parsed.searchParams.get("clientId")).toBe("client id with spaces & symbols")
      expect(parsed.searchParams.get("scope")).toBe("market:1234 store:5678")
    })
  })

  describe("my-account application", () => {
    it("generates a my-account link with orderId", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "my-account",
        orderId: "order123",
      })
      const parsed = new URL(url)
      expect(parsed.pathname).toBe("/my-account/order123")
      expect(parsed.searchParams.get("accessToken")).toBe("test-token")
    })

    it("includes returnUrl when provided", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "my-account",
        orderId: "order123",
        returnUrl: "https://shop.example.com/",
      })
      const parsed = new URL(url)
      expect(parsed.searchParams.get("returnUrl")).toBe("https://shop.example.com/")
    })

    it("encodes returnUrl containing query string characters", () => {
      const maliciousReturnUrl = "https://shop.example.com/?injected=true&accessToken=stolen"

      const url = getApplicationLink({
        ...base,
        applicationType: "my-account",
        orderId: "order123",
        returnUrl: maliciousReturnUrl,
      })

      const parsed = new URL(url)
      expect(parsed.searchParams.get("returnUrl")).toBe(maliciousReturnUrl)
      expect(parsed.searchParams.get("injected")).toBeNull()
      expect(url).not.toContain("accessToken=stolen")
    })

    it("does not include returnUrl params for non-identity, non-my-account applications", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "checkout",
        orderId: "order123",
        returnUrl: "https://shop.example.com/",
      })
      const parsed = new URL(url)
      expect(parsed.searchParams.get("returnUrl")).toBeNull()
    })
  })

  describe("staging environment", () => {
    it("uses stg. prefix for non-production domains", () => {
      const url = getApplicationLink({
        accessToken: "test-token",
        slug: "myorg",
        domain: "commercelayer.co",
        applicationType: "my-account",
        orderId: "order123",
      })
      expect(url).toContain("myorg.stg.commercelayer.app")
    })
  })

  describe("custom domain", () => {
    it("uses custom domain without application path", () => {
      const url = getApplicationLink({
        ...base,
        applicationType: "identity",
        modeType: "login",
        clientId: "client123",
        scope: "market:1234",
        returnUrl: "https://shop.example.com/",
        customDomain: "identity.myshop.com",
      })
      const parsed = new URL(url)
      expect(parsed.hostname).toBe("identity.myshop.com")
      expect(parsed.pathname).toBe("/")
    })
  })
})

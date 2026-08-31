// `placeOrderPermitted` arms the privacy & terms gate on `privacyUrl && termsUrl`, so an order
// carrying exactly one of them silently requires no acceptance at all — a checkout that looks
// gated but is not. The behaviour is deliberately left alone (requiring acceptance on one URL
// would render a checkbox linking to nothing), so this warning is the only thing standing
// between that config and a shopper placing an order without ticking anything.
import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useHalfConfiguredTermsWarning } from "#utils/hooks/useHalfConfiguredTermsWarning"

describe("useHalfConfiguredTermsWarning", () => {
  let error: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    error = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    error.mockRestore()
  })

  it("warns when only the terms URL is set", () => {
    renderHook(() => useHalfConfiguredTermsWarning(undefined, "https://example.com/terms"))
    expect(error).toHaveBeenCalledOnce()
    expect(error.mock.calls[0]?.[0]).toContain("Only one of the privacy policy and terms")
  })

  it("warns when only the privacy URL is set", () => {
    renderHook(() => useHalfConfiguredTermsWarning("https://example.com/privacy", null))
    expect(error).toHaveBeenCalledOnce()
  })

  it("stays quiet when both are set", () => {
    renderHook(() =>
      useHalfConfiguredTermsWarning("https://example.com/privacy", "https://example.com/terms")
    )
    expect(error).not.toHaveBeenCalled()
  })

  // Neither URL is a deliberate opt-out, not a mistake: the gate is off and the shopper is
  // never shown a checkbox, so there is nothing to warn about.
  it("stays quiet when neither is set", () => {
    renderHook(() => useHalfConfiguredTermsWarning(undefined, undefined))
    expect(error).not.toHaveBeenCalled()
  })

  it("treats an empty string as absent", () => {
    renderHook(() => useHalfConfiguredTermsWarning("", ""))
    expect(error).not.toHaveBeenCalled()
  })

  it("stays quiet in production", () => {
    const previous = process.env.NODE_ENV
    vi.stubEnv("NODE_ENV", "production")
    try {
      renderHook(() => useHalfConfiguredTermsWarning(undefined, "https://example.com/terms"))
      expect(error).not.toHaveBeenCalled()
    } finally {
      vi.stubEnv("NODE_ENV", previous ?? "test")
      vi.unstubAllEnvs()
    }
  })
})

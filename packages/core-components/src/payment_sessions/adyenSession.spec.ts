import type { PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { ADYEN_SETTING_TYPE, isAdyenSession, readAdyenSession } from "./types"

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    payment_setting: { id: "ps-adyen", type: ADYEN_SETTING_TYPE },
    ...overrides,
  } as PaymentSession
}

describe("isAdyenSession", () => {
  it("keys off the setting type, not the session type", () => {
    expect(isAdyenSession(session())).toBe(true)
    expect(
      isAdyenSession(
        session({ payment_setting: { id: "m", type: "payment_setting_manuals" } as never })
      )
    ).toBe(false)
  })

  it("is false for a missing session", () => {
    expect(isAdyenSession(undefined)).toBe(false)
    expect(isAdyenSession(null)).toBe(false)
  })
})

describe("readAdyenSession", () => {
  it("reads Adyen's own field names out of response_data", () => {
    const result = readAdyenSession(
      session({ response_data: { id: "CS123", sessionData: "Ab02b4c0!BQ" } })
    )
    expect(result).toEqual({ id: "CS123", sessionData: "Ab02b4c0!BQ" })
  })

  it("ignores the rest of the gateway response", () => {
    const result = readAdyenSession(
      session({
        response_data: { id: "CS123", sessionData: "blob", expiresAt: "2026-09-03T00:00:00Z" },
      })
    )
    expect(result).toEqual({ id: "CS123", sessionData: "blob" })
  })

  it("returns undefined when either half is missing", () => {
    // A partial Adyen Session is not something to boot a Drop-in from, and it
    // is what a `fields` allowlist that omits `response_data` produces.
    expect(readAdyenSession(session({ response_data: { id: "CS123" } }))).toBeUndefined()
    expect(readAdyenSession(session({ response_data: { sessionData: "blob" } }))).toBeUndefined()
    expect(
      readAdyenSession(session({ response_data: { id: "", sessionData: "blob" } }))
    ).toBeUndefined()
  })

  it("returns undefined when there is no response_data at all", () => {
    expect(readAdyenSession(session())).toBeUndefined()
    expect(readAdyenSession(session({ response_data: null }))).toBeUndefined()
    expect(readAdyenSession(undefined)).toBeUndefined()
  })
})

import type { PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { findCurrentPaymentSession } from "./findCurrentPaymentSession"

const MANUAL = "setting-manual"
const GIFT_CARD = "setting-gift-card"

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    payment_setting: { id: MANUAL, type: "payment_setting_manuals" },
    ...overrides,
  } as PaymentSession
}

describe("findCurrentPaymentSession", () => {
  it("returns undefined when the order has no sessions", () => {
    expect(findCurrentPaymentSession({ paymentSessions: [] })).toBeUndefined()
    expect(findCurrentPaymentSession({ paymentSessions: null })).toBeUndefined()
  })

  // Unlike a reusable session, one that already took money is still the
  // shopper's selection — it just must not be adopted for a new payment.
  it.each(["unpaid", "authorized", "paid", "partially_paid"])(
    "treats a session in status %s as the selection",
    (status) => {
      const current = session({ status })
      expect(findCurrentPaymentSession({ paymentSessions: [current] })).toBe(current)
    }
  )

  // Showing a burnt session as the selection would tell the shopper a payment
  // is in place when none is.
  it.each(["declined", "failed", "canceled", "expired"])(
    "ignores a session whose authorization is %s",
    (status) => {
      const burnt = session({ payment_authorization: { status } as never })
      expect(findCurrentPaymentSession({ paymentSessions: [burnt] })).toBeUndefined()
    }
  )

  it("keeps a session whose authorization is still in flight", () => {
    const inFlight = session({ payment_authorization: { status: "processing" } as never })
    expect(findCurrentPaymentSession({ paymentSessions: [inFlight] })).toBe(inFlight)
  })

  // Switching setting leaves the previous session behind, so "newest wins" is
  // what keeps a radio group from showing two selections at once.
  it("returns the most recent session when several are live", () => {
    const older = session({
      id: "older",
      created_at: "2026-08-18T10:00:00Z",
      payment_setting: { id: GIFT_CARD } as never,
    })
    const newer = session({ id: "newer", created_at: "2026-08-18T11:00:00Z" })
    expect(findCurrentPaymentSession({ paymentSessions: [older, newer] })?.id).toBe("newer")
    expect(findCurrentPaymentSession({ paymentSessions: [newer, older] })?.id).toBe("newer")
  })

  it("skips burnt sessions when picking the most recent", () => {
    const burntNewer = session({
      id: "burnt",
      created_at: "2026-08-18T12:00:00Z",
      payment_authorization: { status: "failed" } as never,
    })
    const liveOlder = session({ id: "live", created_at: "2026-08-18T10:00:00Z" })
    expect(findCurrentPaymentSession({ paymentSessions: [burntNewer, liveOlder] })?.id).toBe("live")
  })

  it("falls back to array order when created_at is absent", () => {
    const first = session({ id: "first" })
    const second = session({ id: "second" })
    expect(findCurrentPaymentSession({ paymentSessions: [first, second] })?.id).toBe("second")
  })

  it("narrows to one setting when asked", () => {
    const manual = session({ id: "manual", created_at: "2026-08-18T10:00:00Z" })
    const giftCard = session({
      id: "gift",
      created_at: "2026-08-18T11:00:00Z",
      payment_setting: { id: GIFT_CARD } as never,
    })
    expect(
      findCurrentPaymentSession({
        paymentSessions: [manual, giftCard],
        paymentSettingId: MANUAL,
      })?.id
    ).toBe("manual")
  })
})

import type { PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { findReusablePaymentSession } from "./findReusablePaymentSession"

const NOW = new Date("2026-08-18T12:00:00Z")
const SETTING_ID = "setting-manual"

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    created_at: "",
    updated_at: "",
    payment_setting: { id: SETTING_ID, type: "payment_setting_manuals" },
    ...overrides,
  } as PaymentSession
}

describe("findReusablePaymentSession", () => {
  it("adopts an unpaid session belonging to the selected setting", () => {
    const reusable = session()
    expect(
      findReusablePaymentSession({
        paymentSessions: [reusable],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBe(reusable)
  })

  it("returns undefined when there are no sessions at all", () => {
    expect(
      findReusablePaymentSession({ paymentSessions: [], paymentSettingId: SETTING_ID, now: NOW })
    ).toBeUndefined()
    expect(
      findReusablePaymentSession({ paymentSessions: null, paymentSettingId: SETTING_ID, now: NOW })
    ).toBeUndefined()
  })

  it("ignores a session belonging to a different setting", () => {
    const other = session({ payment_setting: { id: "setting-gift-card" } as never })
    expect(
      findReusablePaymentSession({
        paymentSessions: [other],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBeUndefined()
  })

  // A session that already took money must never be adopted: `amount_cents` is
  // immutable, and re-selecting it would misreport what the shopper still owes.
  it.each(["authorized", "paid", "partially_paid", "voided", "refunded", "partially_refunded"])(
    "ignores a session in status %s",
    (status) => {
      expect(
        findReusablePaymentSession({
          paymentSessions: [session({ status })],
          paymentSettingId: SETTING_ID,
          now: NOW,
        })
      ).toBeUndefined()
    }
  )

  it("ignores an expired session", () => {
    const expired = session({ expires_at: "2026-08-18T11:59:59Z" })
    expect(
      findReusablePaymentSession({
        paymentSessions: [expired],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBeUndefined()
  })

  it("adopts a session whose expiry is still in the future", () => {
    const live = session({ expires_at: "2026-08-18T12:00:01Z" })
    expect(
      findReusablePaymentSession({
        paymentSessions: [live],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBe(live)
  })

  // The decisive case: a failed authorization leaves the session `unpaid`,
  // because only a *succeeded* authorization advances it. Status alone cannot
  // tell a fresh session from a burnt one.
  it.each(["declined", "failed", "canceled", "expired"])(
    "ignores an unpaid session whose authorization is %s",
    (status) => {
      const burnt = session({ payment_authorization: { status } as never })
      expect(
        findReusablePaymentSession({
          paymentSessions: [burnt],
          paymentSettingId: SETTING_ID,
          now: NOW,
        })
      ).toBeUndefined()
    }
  )

  // In flight, not burnt — adopting it is what stops a remount creating a second.
  it.each(["pending", "processing", "requires_action"])(
    "adopts an unpaid session whose authorization is still %s",
    (status) => {
      const inFlight = session({ payment_authorization: { status } as never })
      expect(
        findReusablePaymentSession({
          paymentSessions: [inFlight],
          paymentSettingId: SETTING_ID,
          now: NOW,
        })
      ).toBe(inFlight)
    }
  )

  it("searches the array rather than reading the first entry", () => {
    const giftCard = session({ id: "gift", payment_setting: { id: "setting-gift-card" } as never })
    const burnt = session({ id: "burnt", payment_authorization: { status: "failed" } as never })
    const fresh = session({ id: "fresh" })
    expect(
      findReusablePaymentSession({
        paymentSessions: [giftCard, burnt, fresh],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBe(fresh)
  })

  it("does not decide on statuses it has never heard of", () => {
    const unknown = session({ status: "some_future_state" })
    expect(
      findReusablePaymentSession({
        paymentSessions: [unknown],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBeUndefined()
  })
})

// Applying a gift card moves the remainder, and `amount_cents` is immutable —
// so the session created before it is wrong, not merely stale. The deletion in
// `invalidateCurrentPaymentSession` is best effort, which is why this check
// exists here too.
describe("findReusablePaymentSession amount check", () => {
  it("ignores a session sized for a different remainder", () => {
    expect(
      findReusablePaymentSession({
        paymentSessions: [session({ amount_cents: 7100 })],
        paymentSettingId: SETTING_ID,
        amountCents: 5100,
        now: NOW,
      })
    ).toBeUndefined()
  })

  it("adopts a session sized for the current remainder", () => {
    const reusable = session({ amount_cents: 5100 })
    expect(
      findReusablePaymentSession({
        paymentSessions: [reusable],
        paymentSettingId: SETTING_ID,
        amountCents: 5100,
        now: NOW,
      })
    ).toBe(reusable)
  })

  it("still adopts when either amount is unknown", () => {
    const noSessionAmount = session()
    expect(
      findReusablePaymentSession({
        paymentSessions: [noSessionAmount],
        paymentSettingId: SETTING_ID,
        amountCents: 5100,
        now: NOW,
      })
    ).toBe(noSessionAmount)

    const withAmount = session({ amount_cents: 7100 })
    expect(
      findReusablePaymentSession({
        paymentSessions: [withAmount],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBe(withAmount)
  })
})

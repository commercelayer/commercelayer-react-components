import type { PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { findReusablePaymentSession } from "./findReusablePaymentSession"

const NOW = new Date("2026-08-18T12:00:00Z")
const SETTING_ID = "setting-manual"

// Real timestamps, because the selection is defined by recency: a fixture with
// an empty `created_at` makes `Date.parse` return NaN, every comparison false,
// and the ordering an accident of array position.
function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    created_at: "2026-08-18T11:00:00Z",
    updated_at: "2026-08-18T11:00:00Z",
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

  it("is not shadowed by a gift card or a burnt session", () => {
    // Neither is the selection — one is additive, the other is failed — so the
    // newest live session for this setting is still adoptable.
    const giftCard = session({
      id: "gift",
      created_at: "2026-08-18T11:30:00Z",
      gift_card_code: "ABC123",
      payment_setting: { id: "setting-gift-card", type: "payment_setting_gift_cards" } as never,
    })
    const burnt = session({
      id: "burnt",
      created_at: "2026-08-18T11:40:00Z",
      payment_authorization: { status: "failed" } as never,
    })
    const fresh = session({ id: "fresh", created_at: "2026-08-18T11:20:00Z" })
    expect(
      findReusablePaymentSession({
        paymentSessions: [giftCard, burnt, fresh],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBe(fresh)
  })

  /**
   * The regression this rule exists for.
   *
   * A shopper picks Adyen, changes to bank transfer, then changes back. The
   * first Adyen session is still unpaid, unexpired and the right size, so it
   * used to be adopted — and adopting changes no timestamp, so the newest
   * session stayed the bank transfer one, the radio never moved, and clicking
   * again did nothing again. Found on a real order carrying two unpaid sessions
   * nine seconds apart.
   */
  it("does not adopt a session that a later selection has superseded", () => {
    const adyen = session({
      id: "adyen",
      created_at: "2026-08-18T11:57:54Z",
      payment_setting: { id: "setting-adyen", type: "payment_setting_adyens" } as never,
    })
    const manual = session({ id: "manual", created_at: "2026-08-18T11:58:03Z" })

    expect(
      findReusablePaymentSession({
        paymentSessions: [adyen, manual],
        paymentSettingId: "setting-adyen",
        now: NOW,
      })
    ).toBeUndefined()

    // And the one that *is* the selection stays adoptable, so a remount does
    // not pile up a third session.
    expect(
      findReusablePaymentSession({
        paymentSessions: [adyen, manual],
        paymentSettingId: SETTING_ID,
        now: NOW,
      })
    ).toBe(manual)
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

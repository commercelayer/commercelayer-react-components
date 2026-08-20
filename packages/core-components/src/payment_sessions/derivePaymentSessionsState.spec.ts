import type { Order, PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { derivePaymentSessionsState } from "./derivePaymentSessionsState"

const MANUAL = { id: "ps-manual", type: "payment_setting_manuals" }
const GIFT_CARD = { id: "ps-gift", type: "payment_setting_gift_cards" }
const TOTAL = 7100

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    payment_setting: MANUAL,
    ...overrides,
  } as PaymentSession
}

function giftCard(id: string, amountCents: number, overrides: Partial<PaymentSession> = {}) {
  return session({
    id,
    amount_cents: amountCents,
    payment_setting: GIFT_CARD as never,
    ...overrides,
  })
}

function order(sessions: PaymentSession[], settings = [MANUAL, GIFT_CARD]): Order {
  return {
    id: "order-1",
    type: "orders",
    total_amount_with_taxes_cents: TOTAL,
    payment_sessions: sessions,
    available_payment_settings: settings,
  } as Order
}

describe("derivePaymentSessionsState", () => {
  it("reports nothing paid for an order with no sessions", () => {
    const state = derivePaymentSessionsState(order([]))
    expect(state).toMatchObject({
      giftCardSessions: [],
      giftCardAmountCents: 0,
      remainingAmountCents: TOTAL,
      isCovered: false,
      canAddGiftCard: true,
      giftCardSettingId: "ps-gift",
    })
    expect(state.currentPaymentSession).toBeUndefined()
  })

  it("handles a missing order", () => {
    const state = derivePaymentSessionsState(undefined)
    expect(state.remainingAmountCents).toBe(0)
    expect(state.isCovered).toBe(true)
  })

  // The point of this derivation: the server's own remainder does not move
  // until a session is authorized, and gift cards are authorized at place time.
  it("counts an applied gift card before it is authorized", () => {
    const state = derivePaymentSessionsState(order([giftCard("gift-a", 2000)]))
    expect(state.giftCardAmountCents).toBe(2000)
    expect(state.remainingAmountCents).toBe(5100)
    expect(state.isCovered).toBe(false)
  })

  it("sums several gift cards", () => {
    const state = derivePaymentSessionsState(
      order([giftCard("gift-a", 2000), giftCard("gift-b", 1500)])
    )
    expect(state.giftCardSessions.map((s) => s.id)).toEqual(["gift-a", "gift-b"])
    expect(state.remainingAmountCents).toBe(3600)
  })

  it("reports full coverage when gift cards reach the total", () => {
    const state = derivePaymentSessionsState(order([giftCard("gift-a", TOTAL)]))
    expect(state.remainingAmountCents).toBe(0)
    expect(state.isCovered).toBe(true)
    expect(state.canAddGiftCard).toBe(false)
  })

  it("never reports a negative remainder", () => {
    const state = derivePaymentSessionsState(order([giftCard("gift-a", TOTAL + 5000)]))
    expect(state.remainingAmountCents).toBe(0)
  })

  // A burnt or refunded card took no money; showing it would tell the shopper a
  // payment is in place when none is.
  it.each(["declined", "failed", "canceled", "expired"])(
    "drops a gift card whose authorization is %s",
    (status) => {
      const state = derivePaymentSessionsState(
        order([giftCard("gift-a", 2000, { payment_authorization: { status } as never })])
      )
      expect(state.giftCardSessions).toEqual([])
      expect(state.remainingAmountCents).toBe(TOTAL)
    }
  )

  it("drops a refunded gift card", () => {
    const state = derivePaymentSessionsState(
      order([giftCard("gift-a", 2000, { payment_refunds: [{ id: "refund-1" }] as never })])
    )
    expect(state.giftCardSessions).toEqual([])
  })

  it("keeps a gift card whose authorization is still in flight", () => {
    const state = derivePaymentSessionsState(
      order([giftCard("gift-a", 2000, { payment_authorization: { status: "pending" } as never })])
    )
    expect(state.giftCardSessions.map((s) => s.id)).toEqual(["gift-a"])
  })

  describe("the session paying the difference", () => {
    it("is the current selection, and is not a gift card", () => {
      const state = derivePaymentSessionsState(
        order([giftCard("gift-a", 2000), session({ id: "method", amount_cents: 5100 })])
      )
      expect(state.currentPaymentSession?.id).toBe("method")
    })

    // An unauthorized method session is an intent, not a payment: counting it
    // would hide the fact that nothing has been taken.
    it("does not reduce the remainder until it is authorized", () => {
      const state = derivePaymentSessionsState(order([session({ amount_cents: 7100 })]))
      expect(state.remainingAmountCents).toBe(TOTAL)
    })

    it("reduces the remainder once authorized", () => {
      const state = derivePaymentSessionsState(
        order([
          session({
            amount_cents: 5100,
            payment_authorization: { status: "succeeded" } as never,
          }),
          giftCard("gift-a", 2000, { payment_authorization: { status: "succeeded" } as never }),
        ])
      )
      expect(state.remainingAmountCents).toBe(0)
      expect(state.isCovered).toBe(true)
    })
  })

  describe("canAddGiftCard", () => {
    // Settling a partially-paid order is a flow this iteration does not
    // implement, so once money is taken or in flight nothing more is accepted.
    it("is false once any session has been authorized", () => {
      const state = derivePaymentSessionsState(
        order([giftCard("gift-a", 1000, { payment_authorization: { status: "pending" } as never })])
      )
      expect(state.remainingAmountCents).toBe(6100)
      expect(state.canAddGiftCard).toBe(false)
    })

    it("is true while everything is still unauthorized and something is owed", () => {
      const state = derivePaymentSessionsState(order([giftCard("gift-a", 1000)]))
      expect(state.canAddGiftCard).toBe(true)
    })

    it("is unaffected by a failed authorization", () => {
      const state = derivePaymentSessionsState(
        order([giftCard("gift-a", 1000, { payment_authorization: { status: "failed" } as never })])
      )
      expect(state.canAddGiftCard).toBe(true)
    })
  })

  it("reports no gift card setting when the order has none available", () => {
    const state = derivePaymentSessionsState(order([], [MANUAL]))
    expect(state.giftCardSettingId).toBeUndefined()
  })
})

import type { Order, PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { giftCardRemoval } from "./giftCardRemoval"

function giftCard(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "gc-1",
    type: "payment_sessions",
    status: "unpaid",
    amount_cents: 2000,
    payment_setting: { id: "ps-gift", type: "payment_setting_gift_cards" },
    ...overrides,
  } as PaymentSession
}

function order(status = "pending"): Order {
  return { id: "order-1", type: "orders", status } as Order
}

const SETTLED = { payment_authorization: { status: "succeeded" } } as Partial<PaymentSession>

describe("giftCardRemoval", () => {
  it("lets an unauthorized card be discarded", () => {
    // Nothing was taken, so deleting the session touches no balance.
    expect(giftCardRemoval({ paymentSession: giftCard(), order: order() })).toBe("discard")
  })

  it("lets a captured card be refunded while the order is still pending", () => {
    expect(
      giftCardRemoval({
        paymentSession: giftCard({ ...SETTLED, status: "paid" }),
        order: order(),
      })
    ).toBe("refund")
  })

  it("offers nothing once the order has been placed", () => {
    // A storefront token's refund grant names `pending` exactly. This is the
    // painful case — a timed-out place with the cards already charged — and it
    // has to read as "cannot" rather than as a control that fails.
    expect(
      giftCardRemoval({
        paymentSession: giftCard({ ...SETTLED, status: "paid" }),
        order: order("placed"),
      })
    ).toBeUndefined()
  })

  it.each(["pending", "processing"])("offers nothing while the charge is %s", (status) => {
    // Neither route is open: the API refuses to delete a session with
    // transactions attached, and a refund has no capture to point at yet.
    expect(
      giftCardRemoval({
        paymentSession: giftCard({ payment_authorization: { status } as never }),
        order: order(),
      })
    ).toBeUndefined()
  })

  it("offers nothing for an authorized card that has not been captured", () => {
    // Transient for gift cards, since the setting forces auto-capture — but
    // requiring the captured state is what makes the refund reliable.
    expect(
      giftCardRemoval({
        paymentSession: giftCard({ ...SETTLED, status: "authorized" }),
        order: order(),
      })
    ).toBeUndefined()
  })

  it("discards a card whose authorization failed", () => {
    // It took no money, so the session is inert and deletable.
    expect(
      giftCardRemoval({
        paymentSession: giftCard({ payment_authorization: { status: "declined" } as never }),
        order: order(),
      })
    ).toBe("discard")
  })

  it("offers nothing in a readonly subtree", () => {
    expect(
      giftCardRemoval({ paymentSession: giftCard(), order: order(), readonly: true })
    ).toBeUndefined()
  })

  it("offers nothing without an order", () => {
    expect(
      giftCardRemoval({ paymentSession: giftCard({ ...SETTLED, status: "paid" }) })
    ).toBeUndefined()
  })
})

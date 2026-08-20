import type { Order, PaymentSession } from "@commercelayer/sdk"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { placeOrderWithPaymentSessions } from "./placeOrderWithPaymentSessions"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

const ORDER_ID = "order-1"
const ACCESS_TOKEN = "token"
const MANUAL = { id: "ps-manual", type: "payment_setting_manuals" }
const GIFT_CARD = { id: "ps-gift", type: "payment_setting_gift_cards" }

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    amount_cents: 7100,
    payment_setting: MANUAL,
    ...overrides,
  } as PaymentSession
}

function giftCard(id: string, overrides: Partial<PaymentSession> = {}): PaymentSession {
  return session({ id, payment_setting: GIFT_CARD as never, amount_cents: 1000, ...overrides })
}

function order(sessions: PaymentSession[], status: Order["status"] = "pending"): Order {
  return {
    id: ORDER_ID,
    type: "orders",
    status,
    total_amount_with_taxes_cents: 7100,
    payment_sessions: sessions,
  } as Order
}

/** A 422 from the `_placeable` trigger, as the API shapes it. */
function refusal(detail = "The payment doesn't cover the order.") {
  return {
    errors: [
      {
        code: "VALIDATION_ERROR",
        detail,
        source: { pointer: "/data/attributes/payment_action" },
        meta: { error: "payment_action" },
      },
    ],
  }
}

interface SdkStub {
  _placeable: ReturnType<typeof vi.fn>
  _place: ReturnType<typeof vi.fn>
  createAuthorization: ReturnType<typeof vi.fn>
}

function stubSdk(): SdkStub {
  const stub: SdkStub = {
    _placeable: vi.fn().mockResolvedValue(order([], "pending")),
    _place: vi.fn().mockResolvedValue(order([], "placed")),
    createAuthorization: vi.fn().mockResolvedValue({ id: "auth-1" }),
  }
  getSdkMock.mockReturnValue({
    orders: { _placeable: stub._placeable, _place: stub._place, relationship: vi.fn() },
    payment_authorizations: { create: stub.createAuthorization },
    payment_sessions: { relationship: vi.fn((id: string) => ({ id, type: "payment_sessions" })) },
  })
  return stub
}

/** Keeps the retry loop synchronous. The delay is asserted separately. */
const NO_WAIT = { attempts: 5, intervalMs: 0 }

/** Session ids the authorizations were created for, in order. */
function authorizedIds(sdk: SdkStub): string[] {
  return sdk.createAuthorization.mock.calls.map((call) => call[0].payment_session.id)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("placeOrderWithPaymentSessions", () => {
  it("authorizes, checks placeability, then places", async () => {
    const sdk = stubSdk()

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      order: order([session()]),
      ...NO_WAIT,
    })

    expect(authorizedIds(sdk)).toEqual(["session-1"])
    expect(sdk._placeable).toHaveBeenCalledWith(ORDER_ID)
    expect(sdk._place).toHaveBeenCalledWith(ORDER_ID)
    expect(result).toMatchObject({ placed: true, errors: [], timedOut: false })
  })

  // auto_place places the order inside the authorization job, so it can be
  // placed before we ever look.
  it("skips _place when the order was already placed by auto_place", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockResolvedValue(order([], "placed"))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      order: order([session()]),
      ...NO_WAIT,
    })

    expect(sdk._place).not.toHaveBeenCalled()
    expect(result).toMatchObject({ placed: true, timedOut: false })
  })

  it("retries a placeability refusal and succeeds once the authorization lands", async () => {
    const sdk = stubSdk()
    sdk._placeable
      .mockRejectedValueOnce(refusal())
      .mockRejectedValueOnce(refusal())
      .mockResolvedValue(order([], "pending"))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      order: order([session()]),
      ...NO_WAIT,
    })

    expect(sdk._placeable).toHaveBeenCalledTimes(3)
    expect(result).toMatchObject({ placed: true, errors: [], timedOut: false })
  })

  it("reports the last refusal once the attempts run out", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockRejectedValue(refusal("Still not covered."))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      order: order([session()]),
      attempts: 3,
      intervalMs: 0,
    })

    expect(sdk._placeable).toHaveBeenCalledTimes(3)
    expect(sdk._place).not.toHaveBeenCalled()
    expect(result.placed).toBe(false)
    expect(result.timedOut).toBe(true)
    expect(result.errors).toEqual([
      {
        code: "VALIDATION_ERROR",
        message: "Still not covered.",
        field: "payment_action",
        meta: { error: "payment_action" },
      },
    ])
  })

  it("waits between attempts", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockRejectedValue(refusal())
    const started = Date.now()

    await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      order: order([session()]),
      attempts: 3,
      intervalMs: 20,
    })

    // Two gaps between three attempts, and no trailing wait after the last.
    expect(Date.now() - started).toBeGreaterThanOrEqual(40)
  })

  it("rethrows an error that is not a placeability refusal", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockRejectedValue(new Error("Unauthorized"))

    await expect(
      placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        order: order([session()]),
        ...NO_WAIT,
      })
    ).rejects.toThrow("Unauthorized")
    expect(sdk._placeable).toHaveBeenCalledTimes(1)
  })

  describe("gift cards", () => {
    // Each authorization shrinks what the next session may take, and a gift
    // card charged after a failed method payment leaves the shopper's balance
    // spent on an order that never got placed.
    it("authorizes every gift card before the session paying the difference", async () => {
      const sdk = stubSdk()

      await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        order: order([
          session({ id: "method", amount_cents: 5100 }),
          giftCard("gift-a", { created_at: "2026-08-20T10:00:00Z" }),
          giftCard("gift-b", { created_at: "2026-08-20T11:00:00Z" }),
        ]),
        ...NO_WAIT,
      })

      expect(authorizedIds(sdk)).toEqual(["gift-a", "gift-b", "method"])
    })

    // Gift cards can cover the order outright, and then there is no other
    // session at all.
    it("places an order covered entirely by gift cards", async () => {
      const sdk = stubSdk()

      const result = await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        order: order([giftCard("gift-a", { amount_cents: 7100 })]),
        ...NO_WAIT,
      })

      expect(authorizedIds(sdk)).toEqual(["gift-a"])
      expect(result.placed).toBe(true)
    })

    // Carrying on would charge more cards for an order that is not going to be
    // placed. Nothing is rolled back: this iteration implements no refund.
    it("stops at the first authorization failure and reports it", async () => {
      const sdk = stubSdk()
      sdk.createAuthorization.mockResolvedValueOnce({ id: "auth-a" }).mockRejectedValueOnce({
        errors: [{ code: "VALIDATION_ERROR", detail: "Gift card is empty." }],
      })

      const result = await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        order: order([
          session({ id: "method" }),
          giftCard("gift-a", { created_at: "2026-08-20T10:00:00Z" }),
          giftCard("gift-b", { created_at: "2026-08-20T11:00:00Z" }),
        ]),
        ...NO_WAIT,
      })

      expect(authorizedIds(sdk)).toEqual(["gift-a", "gift-b"])
      expect(sdk._placeable).not.toHaveBeenCalled()
      expect(result).toMatchObject({ placed: false, timedOut: false })
      expect(result.errors[0]?.message).toBe("Gift card is empty.")
    })

    it("skips gift cards that are already authorized", async () => {
      const sdk = stubSdk()

      await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        order: order([
          giftCard("gift-done", { payment_authorization: { status: "succeeded" } as never }),
          giftCard("gift-todo"),
        ]),
        ...NO_WAIT,
      })

      expect(authorizedIds(sdk)).toEqual(["gift-todo"])
    })
  })

  describe("authorization of the session paying the difference", () => {
    // Creating a second authorization over one still in flight risks taking the
    // money twice.
    it.each(["pending", "processing", "requires_action", "succeeded"])(
      "does not create a second one when the existing authorization is %s",
      async (status) => {
        const sdk = stubSdk()

        await placeOrderWithPaymentSessions({
          accessToken: ACCESS_TOKEN,
          order: order([session({ payment_authorization: { status } as never })]),
          ...NO_WAIT,
        })

        expect(sdk.createAuthorization).not.toHaveBeenCalled()
      }
    )

    // A burnt session is not the selection any more — the radio reads as
    // unchecked and the shopper picks again, which creates a fresh session. So
    // nothing is authorized here, and nothing is charged twice.
    it.each(["declined", "failed", "canceled", "expired"])(
      "authorizes nothing when the only session's authorization is %s",
      async (status) => {
        const sdk = stubSdk()

        await placeOrderWithPaymentSessions({
          accessToken: ACCESS_TOKEN,
          order: order([session({ payment_authorization: { status } as never })]),
          ...NO_WAIT,
        })

        expect(sdk.createAuthorization).not.toHaveBeenCalled()
      }
    )

    it("authorizes nothing for an order with no sessions", async () => {
      const sdk = stubSdk()

      const result = await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        order: order([]),
        ...NO_WAIT,
      })

      expect(sdk.createAuthorization).not.toHaveBeenCalled()
      expect(result.placed).toBe(true)
    })
  })
})

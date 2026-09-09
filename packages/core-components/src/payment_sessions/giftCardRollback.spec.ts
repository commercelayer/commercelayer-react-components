import type { Order, PaymentSession } from "@commercelayer/sdk"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authorizeGiftCardSessions } from "./authorizeGiftCardSessions"
import { refundGiftCardSessions } from "./refundGiftCardSessions"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

const ACCESS_TOKEN = "token"
const GIFT_CARD = { id: "ps-gift", type: "payment_setting_gift_cards" }
const ADYEN = { id: "ps-adyen", type: "payment_setting_adyens" }

function giftCard(id: string, overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id,
    type: "payment_sessions",
    status: "unpaid",
    amount_cents: 2000,
    payment_setting: GIFT_CARD,
    ...overrides,
  } as PaymentSession
}

function order(sessions: PaymentSession[]): Order {
  return {
    id: "order-1",
    type: "orders",
    total_amount_with_taxes_cents: 7100,
    payment_sessions: sessions,
    available_payment_settings: [GIFT_CARD, ADYEN],
  } as Order
}

/** A 422 shaped the way the SDK surfaces one. */
function apiError(detail: string) {
  return {
    errors: [
      { code: "VALIDATION_ERROR", detail, source: { pointer: "/data/attributes/payment_action" } },
    ],
  }
}

function stubSdk(overrides: Record<string, unknown> = {}) {
  const create = vi.fn().mockResolvedValue({ id: "auth-1" })
  const refundCreate = vi.fn().mockResolvedValue({ id: "refund-1" })
  const retrieve = vi.fn()
  getSdkMock.mockReturnValue({
    payment_authorizations: { create },
    payment_refunds: { create: refundCreate },
    payment_sessions: { relationship: (id: string) => ({ id, type: "payment_sessions" }) },
    payment_captures: { relationship: (id: string) => ({ id, type: "payment_captures" }) },
    orders: { retrieve },
    ...overrides,
  })
  return { create, refundCreate, retrieve }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("authorizeGiftCardSessions", () => {
  it("authorizes every applied card and reports which ones it charged", async () => {
    const { create } = stubSdk()

    const result = await authorizeGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gc-1"), giftCard("gc-2")]),
    })

    expect(create).toHaveBeenCalledTimes(2)
    expect(result.authorizedSessionIds).toEqual(["gc-1", "gc-2"])
    expect(result.errors).toEqual([])
  })

  it("leaves the session paying the difference alone", async () => {
    // The gateway takes that one, and it takes it before this runs.
    const { create } = stubSdk()
    const method = {
      id: "adyen-1",
      type: "payment_sessions",
      status: "unpaid",
      payment_setting: ADYEN,
    } as PaymentSession

    const result = await authorizeGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gc-1"), method]),
    })

    expect(create).toHaveBeenCalledTimes(1)
    expect(result.authorizedSessionIds).toEqual(["gc-1"])
  })

  it("skips a card that already carries a live authorization", async () => {
    // Creating a second authorization over the first is how the money gets
    // taken twice — the case a stale order would produce.
    const { create } = stubSdk()

    const result = await authorizeGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      order: order([
        giftCard("gc-1", { payment_authorization: { status: "pending" } as never }),
        giftCard("gc-2"),
      ]),
    })

    expect(create).toHaveBeenCalledTimes(1)
    expect(result.authorizedSessionIds).toEqual(["gc-2"])
  })

  /**
   * Which card is charged first decides how much is stranded when a later one
   * fails, because nothing is rolled back. A card fails when its balance has
   * gone elsewhere, which has nothing to do with its size — so charging the
   * small ones first makes the amount left behind the smallest it can be.
   */
  it("charges the smallest card first, so a later failure strands less", async () => {
    const { create } = stubSdk()
    await authorizeGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      order: order([
        giftCard("ps-big", { amount_cents: 5000 }),
        giftCard("ps-small", { amount_cents: 500 }),
        giftCard("ps-mid", { amount_cents: 1500 }),
      ]),
    })

    expect(create.mock.calls.map(([body]) => body.payment_session.id)).toEqual([
      "ps-small",
      "ps-mid",
      "ps-big",
    ])
  })

  it("charges a card of unknown size last", async () => {
    // An order fetched without `amount_cents` in its `fields` must not push an
    // unknown to the front, where it could strand more than any known one.
    const { create } = stubSdk()
    await authorizeGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      order: order([
        giftCard("ps-unknown", { amount_cents: null as never }),
        giftCard("ps-small", { amount_cents: 500 }),
      ]),
    })

    expect(create.mock.calls.map(([body]) => body.payment_session.id)).toEqual([
      "ps-small",
      "ps-unknown",
    ])
  })

  it("stops at the first refusal rather than charging more cards", async () => {
    const { create } = stubSdk()
    create.mockResolvedValueOnce({ id: "auth-1" })
    create.mockRejectedValueOnce(apiError("Gift card balance is insufficient."))

    const result = await authorizeGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gc-1"), giftCard("gc-2"), giftCard("gc-3")]),
    })

    expect(create).toHaveBeenCalledTimes(2)
    expect(result.authorizedSessionIds).toEqual(["gc-1"])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.message).toBe("Gift card balance is insufficient.")
  })

  it("rethrows an error it cannot read as a refusal", async () => {
    const { create } = stubSdk()
    create.mockRejectedValueOnce(new Error("socket hang up"))

    await expect(
      authorizeGiftCardSessions({ accessToken: ACCESS_TOKEN, order: order([giftCard("gc-1")]) })
    ).rejects.toThrow("socket hang up")
  })
})

describe("refundGiftCardSessions", () => {
  const capture = (id: string) => ({ id, status: "succeeded", refund_balance_cents: 2000 }) as never

  /** A card still holding the money, with a capture to refund against. */
  const charged = (captureId = "cap-1") =>
    order([giftCard("gc-1", { status: "paid", payment_captures: [capture(captureId)] })])

  /** The same card once the refund job has settled — the server's own signal. */
  const returned = () =>
    order([
      giftCard("gc-1", {
        status: "refunded",
        payment_captures: [capture("cap-1")],
        payment_refunds: [{ id: "refund-1", status: "succeeded" } as never],
      }),
    ])

  it("does nothing when asked for nothing", async () => {
    const { retrieve } = stubSdk()
    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: [],
    })
    expect(retrieve).not.toHaveBeenCalled()
    expect(result).toEqual({ refundedSessionIds: [], errors: [], timedOut: false })
  })

  it("refunds against the capture the authorization produced", async () => {
    const { retrieve, refundCreate } = stubSdk()
    retrieve.mockResolvedValueOnce(charged()).mockResolvedValue(returned())

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      intervalMs: 0,
    })

    expect(refundCreate).toHaveBeenCalledWith({
      payment_session: { id: "gc-1", type: "payment_sessions" },
      payment_capture: { id: "cap-1", type: "payment_captures" },
    })
    expect(result).toEqual({ refundedSessionIds: ["gc-1"], errors: [], timedOut: false })
  })

  it("waits for the refund to settle, not just to be created", async () => {
    // The regression this budget exists for. A refund starts `pending` and
    // another job closes it, so reporting success on the create told the shopper
    // their card was off the order while it was still charged — and the row
    // stayed on screen, because the row goes on the session's own status.
    const { retrieve, refundCreate } = stubSdk()
    retrieve
      .mockResolvedValueOnce(charged())
      .mockResolvedValueOnce(charged())
      .mockResolvedValue(returned())

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      intervalMs: 0,
    })

    // Created once, then waited on rather than created again.
    expect(refundCreate).toHaveBeenCalledTimes(1)
    expect(retrieve.mock.calls.length).toBeGreaterThanOrEqual(3)
    expect(result.refundedSessionIds).toEqual(["gc-1"])
    expect(result.timedOut).toBe(false)
  })

  it("does not create a second refund while the first is still pending", async () => {
    const { retrieve, refundCreate } = stubSdk()
    // Charged, with an unsettled refund already attached.
    retrieve.mockResolvedValue(
      order([
        giftCard("gc-1", {
          status: "paid",
          payment_captures: [capture("cap-1")],
          payment_refunds: [{ id: "refund-1", status: "pending" } as never],
        }),
      ])
    )

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      attempts: 3,
      intervalMs: 0,
    })

    expect(refundCreate).not.toHaveBeenCalled()
    expect(result.timedOut).toBe(true)
  })

  it("waits for the capture the background job has not created yet", async () => {
    const { retrieve, refundCreate } = stubSdk()
    retrieve
      .mockResolvedValueOnce(order([giftCard("gc-1", { payment_captures: [] })]))
      .mockResolvedValueOnce(charged())
      .mockResolvedValue(returned())

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      intervalMs: 0,
    })

    expect(refundCreate).toHaveBeenCalledTimes(1)
    expect(result.timedOut).toBe(false)
  })

  it("ignores a capture that has not succeeded yet", async () => {
    const { retrieve, refundCreate } = stubSdk()
    retrieve.mockResolvedValue(
      order([giftCard("gc-1", { payment_captures: [{ id: "cap-1", status: "pending" } as never] })])
    )

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      attempts: 2,
      intervalMs: 0,
    })

    expect(refundCreate).not.toHaveBeenCalled()
    expect(result.timedOut).toBe(true)
  })

  it("treats a session whose money is already back as done", async () => {
    const { retrieve, refundCreate } = stubSdk()
    retrieve.mockResolvedValue(returned())

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      intervalMs: 0,
    })

    expect(refundCreate).not.toHaveBeenCalled()
    expect(result).toEqual({ refundedSessionIds: ["gc-1"], errors: [], timedOut: false })
  })

  it("carries on to the next card when one refund is refused", async () => {
    // Unlike authorizing, refunds do not change what the next one may take, so
    // giving up on the second would leave the third charged for no reason.
    const { retrieve, refundCreate } = stubSdk()
    const bothCharged = order([
      giftCard("gc-1", { status: "paid", payment_captures: [capture("cap-1")] }),
      giftCard("gc-2", { status: "paid", payment_captures: [capture("cap-2")] }),
    ])
    const secondReturned = order([
      giftCard("gc-1", { status: "paid", payment_captures: [capture("cap-1")] }),
      giftCard("gc-2", {
        status: "refunded",
        payment_captures: [capture("cap-2")],
        payment_refunds: [{ id: "refund-2", status: "succeeded" } as never],
      }),
    ])
    retrieve.mockResolvedValueOnce(bothCharged).mockResolvedValue(secondReturned)
    refundCreate.mockRejectedValueOnce(apiError("Refund amount exceeds the capture."))

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1", "gc-2"],
      intervalMs: 0,
    })

    expect(refundCreate).toHaveBeenCalledTimes(2)
    expect(result.refundedSessionIds).toEqual(["gc-2"])
    expect(result.errors).toHaveLength(1)
    expect(result.timedOut).toBe(false)
  })

  it("reports a timeout instead of claiming a completed rollback", async () => {
    const { retrieve } = stubSdk()
    retrieve.mockResolvedValue(order([giftCard("gc-1", { payment_captures: [] })]))

    const result = await refundGiftCardSessions({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSessionIds: ["gc-1"],
      attempts: 3,
      intervalMs: 0,
    })

    expect(retrieve).toHaveBeenCalledTimes(3)
    expect(result.timedOut).toBe(true)
    expect(result.refundedSessionIds).toEqual([])
  })
})

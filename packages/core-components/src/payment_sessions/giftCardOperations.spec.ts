import type { Order, PaymentSession } from "@commercelayer/sdk"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { applyGiftCard } from "./applyGiftCard"
import { removeGiftCard } from "./removeGiftCard"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

const ACCESS_TOKEN = "token"
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

interface SdkStub {
  create: ReturnType<typeof vi.fn>
  del: ReturnType<typeof vi.fn>
}

function stubSdk(): SdkStub {
  const stub: SdkStub = {
    create: vi.fn().mockResolvedValue({ id: "gift-new" }),
    del: vi.fn().mockResolvedValue(undefined),
  }
  getSdkMock.mockReturnValue({
    payment_sessions: { create: stub.create, delete: stub.del },
    payment_settings: { relationship: vi.fn((id: string) => ({ id, type: "payment_settings" })) },
    orders: { relationship: vi.fn((id: string) => ({ id, type: "orders" })) },
  })
  return stub
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("applyGiftCard", () => {
  // The server sizes the first card against its own balance, which is what we
  // want — it knows the balance and we do not.
  it("omits amount_cents for the first gift card", async () => {
    const sdk = stubSdk()

    await applyGiftCard({ accessToken: ACCESS_TOKEN, order: order([]), giftCardCode: "ABC" })

    expect(sdk.create).toHaveBeenCalledOnce()
    const payload = sdk.create.mock.calls[0]?.[0]
    expect(payload.gift_card_code).toBe("ABC")
    expect(payload).not.toHaveProperty("amount_cents")
  })

  // The decisive case. The server's remainder has not moved — the first card is
  // not authorized yet — so left to itself it would size this one for the whole
  // order. On a 7100 order with 2000 already applied, that would be 7100 again:
  // 9100 of credit for a 7100 order, with nothing server-side to stop it.
  it("sends the real remainder from the second gift card onwards", async () => {
    const sdk = stubSdk()

    await applyGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gift-a", 2000)]),
      giftCardCode: "DEF",
    })

    expect(sdk.create.mock.calls[0]?.[0].amount_cents).toBe(5100)
  })

  it("accounts for every applied card when computing the remainder", async () => {
    const sdk = stubSdk()

    await applyGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gift-a", 2000), giftCard("gift-b", 1500)]),
      giftCardCode: "GHI",
    })

    expect(sdk.create.mock.calls[0]?.[0].amount_cents).toBe(3600)
  })

  it("refuses when the order has no gift card setting", async () => {
    stubSdk()

    await expect(
      applyGiftCard({
        accessToken: ACCESS_TOKEN,
        order: order([], [MANUAL]),
        giftCardCode: "ABC",
      })
    ).rejects.toThrow(/no gift card payment setting/i)
  })

  // `amount_cents` is immutable, so a session created against a larger
  // remainder is not stale but wrong: left alone it would still read as the
  // selection and authorize more than is owed.
  it("deletes the session paying the difference", async () => {
    const sdk = stubSdk()

    await applyGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([session({ id: "method", amount_cents: 7100 })]),
      giftCardCode: "ABC",
    })

    expect(sdk.del).toHaveBeenCalledWith("method")
  })

  it("leaves an authorized method session alone", async () => {
    const sdk = stubSdk()

    await applyGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([
        session({ id: "method", payment_authorization: { status: "succeeded" } as never }),
      ]),
      giftCardCode: "ABC",
    })

    expect(sdk.del).not.toHaveBeenCalled()
  })

  // The shopper asked for the gift card and can see whether it landed; turning
  // a cleanup failure into a visible error would report the wrong thing.
  it("still succeeds when the cleanup delete fails", async () => {
    const sdk = stubSdk()
    sdk.del.mockRejectedValue(new Error("Forbidden"))

    await expect(
      applyGiftCard({
        accessToken: ACCESS_TOKEN,
        order: order([session({ id: "method" })]),
        giftCardCode: "ABC",
      })
    ).resolves.toMatchObject({ id: "gift-new" })
  })
})

describe("removeGiftCard", () => {
  it("deletes the gift card session", async () => {
    const sdk = stubSdk()

    await removeGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gift-a", 2000)]),
      paymentSessionId: "gift-a",
    })

    expect(sdk.del).toHaveBeenCalledWith("gift-a")
  })

  // Removing raises the remainder, so the method session's fixed amount is now
  // too small — the same reason applying one invalidates it.
  it("also deletes the session paying the difference", async () => {
    const sdk = stubSdk()

    await removeGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([giftCard("gift-a", 2000), session({ id: "method", amount_cents: 5100 })]),
      paymentSessionId: "gift-a",
    })

    expect(sdk.del.mock.calls.map((call) => call[0])).toEqual(["gift-a", "method"])
  })

  // Authorizing a gift card debits the balance immediately, and only a refund
  // could return it — which this iteration does not implement. The API would
  // refuse the delete anyway, with an unhandled 500.
  it("refuses to remove a gift card that has been charged", async () => {
    const sdk = stubSdk()

    await expect(
      removeGiftCard({
        accessToken: ACCESS_TOKEN,
        order: order([
          giftCard("gift-a", 2000, { payment_authorization: { status: "succeeded" } as never }),
        ]),
        paymentSessionId: "gift-a",
      })
    ).rejects.toThrow(/already been charged/i)
    expect(sdk.del).not.toHaveBeenCalled()
  })

  it("allows removing one whose authorization failed", async () => {
    const sdk = stubSdk()

    await removeGiftCard({
      accessToken: ACCESS_TOKEN,
      order: order([
        giftCard("gift-a", 2000, { payment_authorization: { status: "failed" } as never }),
      ]),
      paymentSessionId: "gift-a",
    })

    expect(sdk.del).toHaveBeenCalledWith("gift-a")
  })
})

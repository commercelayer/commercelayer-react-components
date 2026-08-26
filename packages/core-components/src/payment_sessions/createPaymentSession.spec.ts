import { beforeEach, describe, expect, it, vi } from "vitest"
import { createPaymentSession } from "./createPaymentSession"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

const ACCESS_TOKEN = "token"

function stubSdk(): ReturnType<typeof vi.fn> {
  const create = vi.fn().mockResolvedValue({ id: "session-new" })
  getSdkMock.mockReturnValue({
    payment_sessions: { create },
    payment_settings: { relationship: vi.fn((id: string) => ({ id, type: "payment_settings" })) },
    orders: { relationship: vi.fn((id: string) => ({ id, type: "orders" })) },
  })
  return create
}

describe("createPaymentSession", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // The server sizes an omitted amount to the full total until the gift cards
  // are authorized at place time, so the remainder has to be sent.
  it("sends the remainder as amount_cents", async () => {
    const create = stubSdk()

    await createPaymentSession({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSettingId: "ps-manual",
      amountCents: 5100,
    })

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ amount_cents: 5100 }))
  })

  it("omits amount_cents when the remainder is unknown", async () => {
    const create = stubSdk()

    await createPaymentSession({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSettingId: "ps-manual",
    })

    expect(create).toHaveBeenCalledWith(
      expect.not.objectContaining({ amount_cents: expect.any(Number) })
    )
  })

  // `amount_cents` must be greater than zero, so a covered order would get a
  // 422 rather than a session — leave the sizing to the server instead.
  it.each([0, -100])("omits amount_cents when the remainder is %i", async (amountCents) => {
    const create = stubSdk()

    await createPaymentSession({
      accessToken: ACCESS_TOKEN,
      orderId: "order-1",
      paymentSettingId: "ps-manual",
      amountCents,
    })

    expect(create).toHaveBeenCalledWith(
      expect.not.objectContaining({ amount_cents: expect.any(Number) })
    )
  })
})

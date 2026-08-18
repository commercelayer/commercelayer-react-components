import type { Order, PaymentSession } from "@commercelayer/sdk"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { placeOrderWithPaymentSessions } from "./placeOrderWithPaymentSessions"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

const ORDER_ID = "order-1"
const ACCESS_TOKEN = "token"

function order(status: Order["status"]): Order {
  return { id: ORDER_ID, type: "orders", status } as Order
}

/** A 422 from the `_placeable` trigger, as the API shapes it. */
function placeabilityRefusal(detail = "The payment doesn't cover the order.") {
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

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "unpaid",
    ...overrides,
  } as PaymentSession
}

interface SdkStub {
  _placeable: ReturnType<typeof vi.fn>
  _place: ReturnType<typeof vi.fn>
  createAuthorization: ReturnType<typeof vi.fn>
}

function stubSdk(): SdkStub {
  const stub: SdkStub = {
    _placeable: vi.fn(),
    _place: vi.fn().mockResolvedValue(order("placed")),
    createAuthorization: vi.fn().mockResolvedValue({ id: "auth-1" }),
  }
  getSdkMock.mockReturnValue({
    orders: { _placeable: stub._placeable, _place: stub._place, relationship: vi.fn() },
    payment_authorizations: { create: stub.createAuthorization },
    payment_sessions: { relationship: vi.fn((id: string) => ({ id, type: "payment_sessions" })) },
  })
  return stub
}

// intervalMs: 0 keeps the retry loop synchronous. The delay is the thing under
// test only in "waits between attempts", where it is asserted separately.
const NO_WAIT = { attempts: 5, intervalMs: 0 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("placeOrderWithPaymentSessions", () => {
  it("authorizes, checks placeability, then places", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockResolvedValue(order("pending"))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      orderId: ORDER_ID,
      paymentSession: session(),
      ...NO_WAIT,
    })

    expect(sdk.createAuthorization).toHaveBeenCalledWith({
      payment_session: { id: "session-1", type: "payment_sessions" },
    })
    expect(sdk._placeable).toHaveBeenCalledWith(ORDER_ID)
    expect(sdk._place).toHaveBeenCalledWith(ORDER_ID)
    expect(result).toMatchObject({ placed: true, errors: [], timedOut: false })
  })

  // auto_place on the Payment Setting places the order inside the
  // authorization job, so it can be placed before we ever look.
  it("skips _place when the order was already placed by auto_place", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockResolvedValue(order("placed"))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      orderId: ORDER_ID,
      paymentSession: session(),
      ...NO_WAIT,
    })

    expect(sdk._place).not.toHaveBeenCalled()
    expect(result).toMatchObject({ placed: true, timedOut: false })
  })

  // The whole point of the loop: authorizing is asynchronous, so an early
  // refusal is not a real failure.
  it("retries a placeability refusal and succeeds once the authorization lands", async () => {
    const sdk = stubSdk()
    sdk._placeable
      .mockRejectedValueOnce(placeabilityRefusal())
      .mockRejectedValueOnce(placeabilityRefusal())
      .mockResolvedValue(order("pending"))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      orderId: ORDER_ID,
      paymentSession: session(),
      ...NO_WAIT,
    })

    expect(sdk._placeable).toHaveBeenCalledTimes(3)
    expect(result).toMatchObject({ placed: true, errors: [], timedOut: false })
  })

  it("reports the last refusal once the attempts run out", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockRejectedValue(placeabilityRefusal("Still not covered."))

    const result = await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      orderId: ORDER_ID,
      paymentSession: session(),
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
    sdk._placeable.mockRejectedValue(placeabilityRefusal())
    const started = Date.now()

    await placeOrderWithPaymentSessions({
      accessToken: ACCESS_TOKEN,
      orderId: ORDER_ID,
      paymentSession: session(),
      attempts: 3,
      intervalMs: 20,
    })

    // Two gaps between three attempts, and no trailing wait after the last one.
    expect(Date.now() - started).toBeGreaterThanOrEqual(40)
  })

  // Waiting cannot fix a 401 or a network failure, so burning five attempts on
  // it only delays the report.
  it("rethrows an error that is not a placeability refusal", async () => {
    const sdk = stubSdk()
    sdk._placeable.mockRejectedValue(new Error("Unauthorized"))

    await expect(
      placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        orderId: ORDER_ID,
        paymentSession: session(),
        ...NO_WAIT,
      })
    ).rejects.toThrow("Unauthorized")
    expect(sdk._placeable).toHaveBeenCalledTimes(1)
  })

  describe("authorization", () => {
    it("creates one when the session has none", async () => {
      const sdk = stubSdk()
      sdk._placeable.mockResolvedValue(order("pending"))

      await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        orderId: ORDER_ID,
        paymentSession: session(),
        ...NO_WAIT,
      })

      expect(sdk.createAuthorization).toHaveBeenCalledOnce()
    })

    // Creating a second authorization over one still in flight risks taking
    // the money twice.
    it.each(["pending", "processing", "requires_action", "succeeded"])(
      "does not create a second one when the existing authorization is %s",
      async (status) => {
        const sdk = stubSdk()
        sdk._placeable.mockResolvedValue(order("pending"))

        await placeOrderWithPaymentSessions({
          accessToken: ACCESS_TOKEN,
          orderId: ORDER_ID,
          paymentSession: session({ payment_authorization: { status } as never }),
          ...NO_WAIT,
        })

        expect(sdk.createAuthorization).not.toHaveBeenCalled()
      }
    )

    it.each(["declined", "failed", "canceled", "expired"])(
      "creates a new one when the existing authorization is %s",
      async (status) => {
        const sdk = stubSdk()
        sdk._placeable.mockResolvedValue(order("pending"))

        await placeOrderWithPaymentSessions({
          accessToken: ACCESS_TOKEN,
          orderId: ORDER_ID,
          paymentSession: session({ payment_authorization: { status } as never }),
          ...NO_WAIT,
        })

        expect(sdk.createAuthorization).toHaveBeenCalledOnce()
      }
    )

    it("skips authorization entirely for an order with no session", async () => {
      const sdk = stubSdk()
      sdk._placeable.mockResolvedValue(order("pending"))

      const result = await placeOrderWithPaymentSessions({
        accessToken: ACCESS_TOKEN,
        orderId: ORDER_ID,
        ...NO_WAIT,
      })

      expect(sdk.createAuthorization).not.toHaveBeenCalled()
      expect(result.placed).toBe(true)
    })
  })
})

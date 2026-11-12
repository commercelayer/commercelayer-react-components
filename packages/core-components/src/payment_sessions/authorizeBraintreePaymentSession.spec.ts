import type { PaymentSetting } from "@commercelayer/sdk"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authorizeBraintreePaymentSession } from "./authorizeBraintreePaymentSession"
import { readBraintreeClientToken, readBraintreeGooglePayMerchantId } from "./types"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

const ACCESS_TOKEN = "token"

/** A refusal the way the SDK throws one: the API's words live in `errors`. */
function apiError(code: string, detail = "refused"): Error & { errors: unknown[] } {
  return Object.assign(new Error(""), { errors: [{ code, detail }] })
}

function stubSdk({
  update = vi.fn().mockResolvedValue({ id: "session-bt" }),
  create = vi.fn().mockResolvedValue({ id: "auth-1", status: "pending" }),
  statuses = ["succeeded"],
}: {
  update?: ReturnType<typeof vi.fn>
  create?: ReturnType<typeof vi.fn>
  statuses?: Array<string | Error>
} = {}) {
  const retrieve = vi.fn()
  for (const status of statuses) {
    if (status instanceof Error) retrieve.mockRejectedValueOnce(status)
    else retrieve.mockResolvedValueOnce({ id: "auth-1", status })
  }
  // Anything polled past the scripted statuses is still pending.
  retrieve.mockResolvedValue({ id: "auth-1", status: "pending" })
  getSdkMock.mockReturnValue({
    payment_sessions: {
      update,
      relationship: vi.fn((id: string) => ({ id, type: "payment_sessions" })),
    },
    payment_authorizations: { create, retrieve },
  })
  return { update, create, retrieve }
}

function authorize(
  overrides: Partial<Parameters<typeof authorizeBraintreePaymentSession>[0]> = {}
) {
  return authorizeBraintreePaymentSession({
    accessToken: ACCESS_TOKEN,
    paymentSessionId: "session-bt",
    nonce: "nonce-after-3ds",
    intervalMs: 0,
    ...overrides,
  })
}

describe("authorizeBraintreePaymentSession", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // `client_data.payment_method_id` is the one place the API reads the nonce
  // from, and the authorization is what makes it relay it to Braintree.
  it("stores the nonce on the session before authorizing it", async () => {
    const { update, create } = stubSdk()

    await authorize()

    expect(update).toHaveBeenCalledWith({
      id: "session-bt",
      client_data: { payment_method_id: "nonce-after-3ds" },
    })
    expect(create).toHaveBeenCalledWith({
      payment_session: { id: "session-bt", type: "payment_sessions" },
    })
    expect(update.mock.invocationCallOrder[0]).toBeLessThan(create.mock.invocationCallOrder[0] ?? 0)
  })

  // The API relays `client_data.device_data` to Braintree's fraud checks.
  it("stores the device data beside the nonce", async () => {
    const { update } = stubSdk()

    await authorize({ deviceData: '{"correlation_id":"abc"}' })

    expect(update).toHaveBeenCalledWith({
      id: "session-bt",
      client_data: {
        payment_method_id: "nonce-after-3ds",
        device_data: '{"correlation_id":"abc"}',
      },
    })
  })

  it("leaves device data out when there is none", async () => {
    const { update } = stubSdk()

    await authorize({ deviceData: "" })

    expect(update).toHaveBeenCalledWith({
      id: "session-bt",
      client_data: { payment_method_id: "nonce-after-3ds" },
    })
  })

  it("waits out the pending authorization until Braintree answers", async () => {
    const { retrieve } = stubSdk({ statuses: ["pending", "pending", "succeeded"] })

    await expect(authorize()).resolves.toEqual({ status: "authorized" })
    expect(retrieve).toHaveBeenCalledTimes(3)
  })

  // With `auto_capture` Commerce Layer charges instead of authorizing, and
  // Braintree's SUBMITTED_FOR_SETTLEMENT lands as `processing`.
  it("treats a payment submitted for settlement as taken", async () => {
    stubSdk({ statuses: ["processing"] })

    await expect(authorize()).resolves.toEqual({ status: "authorized" })
  })

  it.each(["declined", "failed", "canceled", "expired"])(
    "reports a %s authorization as a refusal",
    async (status) => {
      stubSdk({ statuses: [status] })

      await expect(authorize()).resolves.toEqual({ status: "refused", code: status })
    }
  )

  // An unreadable poll is not an answer about the payment.
  it("keeps polling through a failed read", async () => {
    stubSdk({ statuses: [new Error("network"), "succeeded"] })

    await expect(authorize()).resolves.toEqual({ status: "authorized" })
  })

  // Commerce Layer leaves an authorization pending for good when its gateway
  // call raised — so running out is unknown, never a refusal.
  it("reports an authorization still pending at the end as unknown", async () => {
    const { retrieve } = stubSdk({ statuses: [] })

    await expect(authorize({ attempts: 3 })).resolves.toEqual({
      status: "unknown",
      code: "authorization_pending",
    })
    expect(retrieve).toHaveBeenCalledTimes(3)
  })

  // Storing a nonce charges nothing, so a failure there is safe to roll back.
  it("refuses when the nonce cannot be stored, without authorizing", async () => {
    const { create } = stubSdk({
      update: vi.fn().mockRejectedValue(apiError("FORBIDDEN")),
    })

    await expect(authorize()).resolves.toEqual({ status: "refused", code: "FORBIDDEN" })
    expect(create).not.toHaveBeenCalled()
  })

  it("refuses when the API will not create the authorization", async () => {
    const { retrieve } = stubSdk({
      create: vi.fn().mockRejectedValue(apiError("VALIDATION_ERROR")),
    })

    await expect(authorize()).resolves.toEqual({ status: "refused", code: "VALIDATION_ERROR" })
    expect(retrieve).not.toHaveBeenCalled()
  })

  // No error body means the request may have arrived, and the job runs whether
  // or not its answer reached us.
  it("reports a transport failure on the authorization as unknown", async () => {
    stubSdk({ create: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")) })

    await expect(authorize()).resolves.toEqual({ status: "unknown", code: "network_error" })
  })
})

describe("readBraintreeClientToken", () => {
  it("reads Braintree's camelCase clientToken out of response_data", () => {
    expect(
      readBraintreeClientToken({ response_data: { clientToken: "eyJ2ZXJzaW9uIjoy" } } as never)
    ).toBe("eyJ2ZXJzaW9uIjoy")
  })

  it.each([
    ["no session", undefined],
    ["no response_data", {}],
    ["an empty token", { response_data: { clientToken: "" } }],
    ["the snake_case spelling", { response_data: { client_token: "abc" } }],
  ])("returns undefined for %s", (_label, session) => {
    expect(readBraintreeClientToken(session as never)).toBeUndefined()
  })
})

describe("readBraintreeGooglePayMerchantId", () => {
  it("reads the Google Pay merchant ID the setting carries, which the SDK type leaves out", () => {
    const setting = { type: "payment_setting_braintrees", google_pay_merchant_id: "BCR2DN4T" }
    expect(readBraintreeGooglePayMerchantId(setting as unknown as PaymentSetting)).toBe("BCR2DN4T")
  })

  // Optional on the setting: most merchants don't offer Google Pay, and a
  // sandbox merchant needs none.
  it("reads nothing from a setting without one", () => {
    expect(
      readBraintreeGooglePayMerchantId({ type: "payment_setting_braintrees" } as PaymentSetting)
    ).toBeUndefined()
    expect(
      readBraintreeGooglePayMerchantId({ google_pay_merchant_id: "" } as unknown as PaymentSetting)
    ).toBeUndefined()
    expect(readBraintreeGooglePayMerchantId(null)).toBeUndefined()
  })
})

import type { PaymentSession } from "@commercelayer/sdk"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { recordCheckoutComPayment } from "./recordCheckoutComPayment"
import {
  CHECKOUT_COM_SETTING_TYPE,
  isCheckoutComSession,
  readCheckoutComPaymentSession,
} from "./types"

const { getSdkMock } = vi.hoisted(() => ({ getSdkMock: vi.fn() }))
vi.mock("#sdk", () => ({ getSdk: getSdkMock }))

function session(overrides: Partial<PaymentSession> = {}): PaymentSession {
  return {
    id: "session-cko",
    type: "payment_sessions",
    status: "unpaid",
    payment_setting: { id: "ps-cko", type: CHECKOUT_COM_SETTING_TYPE },
    ...overrides,
  } as PaymentSession
}

const CKO_SESSION = {
  id: "ps_2Un0Ag",
  payment_session_secret: "pss_secret",
  payment_session_token: "token",
  _links: { self: { href: "https://api.sandbox.checkout.com/payment-sessions/ps_2Un0Ag" } },
}

describe("isCheckoutComSession", () => {
  it("keys off the setting type", () => {
    expect(isCheckoutComSession(session())).toBe(true)
    expect(
      isCheckoutComSession(
        session({ payment_setting: { id: "s", type: "payment_setting_stripes" } as never })
      )
    ).toBe(false)
    expect(isCheckoutComSession(undefined)).toBe(false)
  })
})

describe("readCheckoutComPaymentSession", () => {
  // The web components read the whole response, not just the two fields
  // checked here, so nothing may be dropped on the way.
  it("returns Checkout.com's payment session whole", () => {
    expect(readCheckoutComPaymentSession(session({ response_data: CKO_SESSION }))).toEqual(
      CKO_SESSION
    )
  })

  it("is undefined without an id or a secret", () => {
    expect(
      readCheckoutComPaymentSession(
        session({ response_data: { ...CKO_SESSION, payment_session_secret: "" } })
      )
    ).toBeUndefined()
    expect(
      readCheckoutComPaymentSession(session({ response_data: { ...CKO_SESSION, id: undefined } }))
    ).toBeUndefined()
  })

  it("is undefined when response_data is missing", () => {
    expect(readCheckoutComPaymentSession(session())).toBeUndefined()
    expect(readCheckoutComPaymentSession(undefined)).toBeUndefined()
  })
})

describe("recordCheckoutComPayment", () => {
  const update = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    update.mockResolvedValue({ id: "session-cko" })
    getSdkMock.mockReturnValue({ payment_sessions: { update } })
  })

  // The API reads the payment to authorize from `client_data.payment_method`.
  // The return URLs the session was created with stay on it.
  it("adds the payment id to the session's client_data", async () => {
    await recordCheckoutComPayment({
      accessToken: "token",
      paymentSessionId: "session-cko",
      clientData: { success_url: "https://shop/s", failure_url: "https://shop/f" },
      paymentId: "pay_abc",
    })

    expect(update).toHaveBeenCalledWith({
      id: "session-cko",
      client_data: {
        success_url: "https://shop/s",
        failure_url: "https://shop/f",
        payment_method: "pay_abc",
      },
    })
  })

  it("writes the payment id alone when the session's client_data is unknown", async () => {
    await recordCheckoutComPayment({
      accessToken: "token",
      paymentSessionId: "session-cko",
      paymentId: "pay_abc",
    })

    expect(update).toHaveBeenCalledWith({
      id: "session-cko",
      client_data: { payment_method: "pay_abc" },
    })
  })

  it("lets the SDK's error through", async () => {
    update.mockRejectedValueOnce(new Error("network"))
    await expect(
      recordCheckoutComPayment({
        accessToken: "token",
        paymentSessionId: "session-cko",
        paymentId: "pay_abc",
      })
    ).rejects.toThrow("network")
  })
})

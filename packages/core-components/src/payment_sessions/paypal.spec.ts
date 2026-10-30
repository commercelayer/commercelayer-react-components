import type { PaymentSession, PaymentSetting } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { isPayPalSession, readPayPalClientId, readPayPalOrderId } from "./types"

describe("readPayPalClientId", () => {
  it("reads the client id the setting carries, which the SDK type leaves out", () => {
    const setting = { type: "payment_setting_paypals", client_id: "AbC-123" }
    expect(readPayPalClientId(setting as unknown as PaymentSetting)).toBe("AbC-123")
  })

  // A setting without one cannot load PayPal's SDK, so it must not be offered.
  it("reads nothing from a setting without one", () => {
    expect(
      readPayPalClientId({ type: "payment_setting_paypals" } as PaymentSetting)
    ).toBeUndefined()
    expect(readPayPalClientId({ client_id: "" } as unknown as PaymentSetting)).toBeUndefined()
    expect(readPayPalClientId(null)).toBeUndefined()
  })
})

describe("readPayPalOrderId", () => {
  it("reads the PayPal order from the session's token", () => {
    expect(readPayPalOrderId({ token: "5O190127TN364715T" } as PaymentSession)).toBe(
      "5O190127TN364715T"
    )
  })

  it("reads nothing from a session without one", () => {
    expect(readPayPalOrderId({ token: "" } as PaymentSession)).toBeUndefined()
    expect(readPayPalOrderId({} as PaymentSession)).toBeUndefined()
    expect(readPayPalOrderId(undefined)).toBeUndefined()
  })
})

describe("isPayPalSession", () => {
  it("tells a PayPal setting's session from the others", () => {
    const paypal = { payment_setting: { type: "payment_setting_paypals" } } as PaymentSession
    const braintree = { payment_setting: { type: "payment_setting_braintrees" } } as PaymentSession
    expect(isPayPalSession(paypal)).toBe(true)
    expect(isPayPalSession(braintree)).toBe(false)
  })
})

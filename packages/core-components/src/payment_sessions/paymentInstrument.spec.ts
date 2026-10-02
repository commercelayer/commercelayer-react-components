import type { PaymentSession } from "@commercelayer/sdk"
import { describe, expect, it } from "vitest"
import { readPaymentInstrument } from "./types"

function session(paymentInstrument?: unknown): PaymentSession {
  return {
    id: "session-1",
    type: "payment_sessions",
    status: "authorized",
    payment_instrument: paymentInstrument,
  } as unknown as PaymentSession
}

describe("readPaymentInstrument", () => {
  it("reads a card instrument as the API sends it", () => {
    const instrument = {
      card_type: "visa",
      payment_id: "pm_1ULltUDtxYOB6MQVpTbaSy8A",
      issuer_type: "card",
      card_expiry_year: 2028,
      card_fingerprint: "FnbDgA9WDd203xvY",
      card_last_digits: "4242",
      card_expiry_month: 1,
    }
    expect(readPaymentInstrument(session(instrument))).toEqual(instrument)
  })

  it("reads an empty object as nothing known yet", () => {
    // The column defaults to `{}` until the payment is authorized.
    expect(readPaymentInstrument(session({}))).toBeUndefined()
  })

  it("is undefined when the attribute is missing or not an object", () => {
    expect(readPaymentInstrument(session())).toBeUndefined()
    expect(readPaymentInstrument(session(null))).toBeUndefined()
    expect(readPaymentInstrument(session("visa"))).toBeUndefined()
    expect(readPaymentInstrument(session([]))).toBeUndefined()
  })

  it("is undefined for a missing session", () => {
    expect(readPaymentInstrument(undefined)).toBeUndefined()
    expect(readPaymentInstrument(null)).toBeUndefined()
  })
})

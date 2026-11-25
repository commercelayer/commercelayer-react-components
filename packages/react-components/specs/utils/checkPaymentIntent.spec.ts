// Coming back from a Stripe redirect, the intent can be unpaid without Stripe having recorded
// any payment error: the cart changed while the shopper was on the gateway's page, Commerce
// Layer updated the intent's amount, and Stripe dropped it back to `requires_confirmation`,
// voiding the authorization the shopper gave there. The verdict was "invalid" with an empty
// message, so the shopper landed back on the payment step with nothing telling them why.
import { checkPaymentIntent } from "#utils/stripe/retrievePaymentIntent"

const retrievePaymentIntent = vi.fn()
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(async () => ({ retrievePaymentIntent })),
}))

const params = { publicApiKey: "pk_test", paymentIntentClientSecret: "pi_1_secret_a" }

describe("checkPaymentIntent", () => {
  it.each(["succeeded", "requires_capture"])("accepts an intent in %s", async (status) => {
    retrievePaymentIntent.mockResolvedValue({ paymentIntent: { status } })
    expect(await checkPaymentIntent(params)).toEqual({ status: "valid", message: "" })
  })

  it("keeps Stripe's own error message when there is one", async () => {
    retrievePaymentIntent.mockResolvedValue({
      paymentIntent: {
        status: "requires_payment_method",
        last_payment_error: { message: "Your card was declined." },
      },
    })
    expect(await checkPaymentIntent(params)).toEqual({
      status: "invalid",
      message: "Your card was declined.",
    })
  })

  it.each(["requires_confirmation", "requires_action", "requires_payment_method", "canceled"])(
    "explains an unpaid intent in %s that carries no Stripe error",
    async (status) => {
      retrievePaymentIntent.mockResolvedValue({ paymentIntent: { status } })
      const result = await checkPaymentIntent(params)
      expect(result.status).toBe("invalid")
      expect(result.message).not.toBe("")
    }
  )
})

import { loadStripe, type PaymentIntentResult } from "@stripe/stripe-js"

interface StripePaymentIntentParams {
  publicApiKey: string
  paymentIntentClientSecret: string
}

type PaymentIntentResultPromise = Promise<PaymentIntentResult | undefined | null>

async function retrievePaymentIntent({
  publicApiKey,
  paymentIntentClientSecret,
}: StripePaymentIntentParams): PaymentIntentResultPromise {
  const stripe = await loadStripe(publicApiKey)
  try {
    const paymentIntent = await stripe?.retrievePaymentIntent(paymentIntentClientSecret)
    return paymentIntent
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    return null
  }
}

interface PaymentIntentValidationProps {
  paymentIntent: PaymentIntentResult["paymentIntent"]
}

type PaymentVerificationState = "valid" | "invalid" | "processing"

const UNPAID_INTENT_MESSAGE = "The payment was not completed. Please try again."

function paymentIntentValidation({
  paymentIntent,
}: PaymentIntentValidationProps): PaymentVerificationState {
  const status = paymentIntent?.status
  switch (status) {
    case "succeeded":
    case "requires_capture":
      return "valid"
    case "processing":
      return "processing"
    case "requires_payment_method":
      return "invalid"
    default:
      return "invalid"
  }
}

type PaymentProcessingFeedback =
  | {
      status: Exclude<PaymentVerificationState, "invalid">
      message?: string
    }
  | {
      status: "invalid"
      message: string
    }

export async function checkPaymentIntent({
  publicApiKey,
  paymentIntentClientSecret,
}: StripePaymentIntentParams): Promise<PaymentProcessingFeedback> {
  const paymentIntentResult = await retrievePaymentIntent({
    publicApiKey,
    paymentIntentClientSecret,
  })
  if (!paymentIntentResult) {
    return { status: "invalid", message: "Payment intent not found" }
  }
  const paymentIntent = paymentIntentResult.paymentIntent
  const error = paymentIntent?.last_payment_error
  const status = paymentIntentValidation({ paymentIntent })
  if (status !== "invalid") return { status, message: "" }
  // An intent can be unpaid with no error recorded on it: when the order's amount changes
  // while the shopper is on the gateway's page, the intent is updated and Stripe sends it
  // back to `requires_confirmation`, voiding the authorization given there. An empty
  // message would leave the shopper on the payment step with no reason shown.
  return { status, message: error?.message ?? UNPAID_INTENT_MESSAGE }
}

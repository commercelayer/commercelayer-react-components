import { loadStripe, type PaymentIntentResult } from '@stripe/stripe-js'

interface StripePaymentIntentParams {
  publicApiKey: string
  paymentIntentClientSecret: string
}

type PaymentIntentResultPromise = Promise<
  PaymentIntentResult | undefined | null
>

export async function retrievePaymentIntent({
  publicApiKey,
  paymentIntentClientSecret
}: StripePaymentIntentParams): PaymentIntentResultPromise {
  const stripe = await loadStripe(publicApiKey)
  try {
    const paymentIntent = await stripe?.retrievePaymentIntent(
      paymentIntentClientSecret
    )
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return null
  }
}

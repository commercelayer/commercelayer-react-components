/**
 * Shared vocabulary for "is this payment authorized?".
 *
 * These lists used to be duplicated between `<PlaceOrderButton>` and
 * `<AdyenPayment>`, and they drifted: the auto-place effect accepted
 * `Pending`/`Received` while the fallback inside `handleClick` only accepted
 * `Authorised`, so an async method (Klarna, iDEAL) came back authorized and the
 * order was never placed. Keep the codes here so the two sides cannot disagree
 * again.
 */

/**
 * Adyen result codes that mean the shopper is done and the money is committed —
 * either authorized outright or accepted for an asynchronous authorization.
 * @see https://docs.adyen.com/online-payments/payment-result-codes
 */
export const ADYEN_AUTHORIZED_RESULT_CODES = ["Authorised", "Pending", "Received"]

/** Adyen result codes that mean the payment will not happen. */
export const ADYEN_REFUSED_RESULT_CODES = ["Cancelled", "Refused", "Error"]

export function isAdyenAuthorizedResultCode(resultCode?: string | null): boolean {
  return resultCode != null && ADYEN_AUTHORIZED_RESULT_CODES.includes(resultCode)
}

/**
 * True when the gateway has explicitly told us the payment failed. Used as a
 * veto, never as the permission to place: gateways that report nothing here
 * (PayPal, Stripe, wire transfers) must stay placeable.
 */
export function isRefusedPaymentResponse(paymentSource?: unknown): boolean {
  const paymentResponse = (
    paymentSource as { payment_response?: { resultCode?: string; status?: string } } | null
  )?.payment_response
  if (paymentResponse == null) return false
  const resultCode = paymentResponse.resultCode
  if (resultCode != null && ADYEN_REFUSED_RESULT_CODES.includes(resultCode)) return true
  return paymentResponse.status?.toLowerCase?.() === "declined"
}

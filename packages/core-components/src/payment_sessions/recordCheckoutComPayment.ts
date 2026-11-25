import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RecordCheckoutComPaymentParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  paymentSessionId: string
  /**
   * The session's `client_data` as it stands. Sent back with the payment id
   * added, so the return URLs the session was created with stay on it.
   */
  clientData?: Record<string, unknown> | null
  /** The Checkout.com payment id, `pay_…`, of a payment Checkout.com approved. */
  paymentId: string
}

/**
 * Tell the API which Checkout.com payment pays this session.
 *
 * Checkout.com's web components submit the payment to Checkout.com themselves,
 * so by the time the shopper is done the money has moved and the API knows
 * nothing about it. Writing the payment id into `client_data.payment_method` is
 * what links the two: the Payment Authorization created afterwards reads that
 * payment from Checkout.com instead of submitting a new one, and takes its
 * status from it — `Authorized` or `Captured` succeed, `Declined` fails,
 * `Pending` waits for the webhook.
 *
 * Only the write: authorizing is left to `placeOrderWithPaymentSessions`, which
 * creates the authorization for every session that needs one, in the order the
 * gift cards require.
 *
 * Throws what the SDK throws. The payment it records has already been taken,
 * so a caller cannot treat a failure here as a refusal.
 */
export async function recordCheckoutComPayment({
  accessToken,
  interceptors,
  paymentSessionId,
  clientData,
  paymentId,
}: RecordCheckoutComPaymentParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.payment_sessions.update({
    id: paymentSessionId,
    client_data: { ...(clientData ?? {}), payment_method: paymentId },
  })
}

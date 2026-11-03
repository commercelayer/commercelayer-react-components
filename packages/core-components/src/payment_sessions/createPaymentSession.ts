import type { PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface CreatePaymentSessionParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  orderId: string
  /** Id of the selected Payment Setting, from `order.available_payment_settings`. */
  paymentSettingId: string
  /**
   * What this session has to pay, from `derivePaymentSessionsState`. Omit it
   * only when the remainder is genuinely unknown — see below for why leaving it
   * to the server is not the safe default it looks like.
   */
  amountCents?: number
  /**
   * Data the gateway needs at session creation, from the setting's entry in the
   * create-attribute table.
   *
   * Only ever sent on the `POST`, never patched afterwards: for Adyen the
   * gateway session is built from it here, and `PATCH { _refresh: true }` is a
   * no-op (`Payment::Session::Adyen` inherits the base's empty `refresh`), so a
   * session created without the right `client_data` cannot be corrected — only
   * replaced. Note the API forwards exactly one key of it to Adyen `/sessions`,
   * `return_url`; everything else is dropped there.
   */
  clientData?: Record<string, unknown>
  /**
   * Ask Commerce Layer to store the payment instrument during this charge and
   * turn it into a `payment_wallet` for the order's customer — which it then
   * does on its own, from the gateway's confirmation. Nothing is written from
   * the client.
   *
   * Creatable only, like everything that shapes the gateway session: Stripe's
   * PaymentIntent gets `setup_future_usage` and a Stripe Customer at creation,
   * Adyen's session gets `storePaymentMethodMode`, `shopperReference` and
   * `recurringProcessingModel`. Changing one's mind means a new session.
   *
   * Sent only when true. A setting whose gateway cannot store instruments
   * answers with a 422 on `vaulting` rather than ignoring it.
   */
  vaulting?: boolean
}

/**
 * Create a Payment Session for an order against the selected Payment Setting.
 *
 * **Why `amount_cents` is sent.** The server sizes an omitted amount to
 * `order.session_amount_cents`, and that number does not drop until a session
 * is *authorized*. Gift cards are authorized at place time, so while the
 * shopper is still choosing, the server sees the full total: on a $71 order
 * with a $20 gift card applied, an omitted amount produces a $71 session, and
 * at place time $91 is taken for a $71 order. The order is placed but lands on
 * `payment_status: "partially_authorized"` — `total - taken` is *negative*, not
 * zero — which reads to a consuming checkout as payment not completed.
 *
 * This mirrors what `applyGiftCard` does from the second card onwards, and for
 * the same reason. The number is safe to send because `cap_amount_cents` clamps
 * it *down* to what the server would have allowed and never up, so the server
 * stays the authority on the maximum; and the value is a sum of amounts the
 * server itself computed for the gift card sessions, not a reimplementation of
 * its pricing.
 *
 * The relationship is set through the polymorphic `payment_settings` resource
 * rather than the per-provider one, which is what the API expects for any
 * setting type.
 */
export async function createPaymentSession({
  accessToken,
  interceptors,
  orderId,
  paymentSettingId,
  amountCents,
  clientData,
  vaulting,
}: CreatePaymentSessionParams): Promise<PaymentSession> {
  const sdk = getSdk({ accessToken, interceptors })
  return await sdk.payment_sessions.create({
    payment_setting: sdk.payment_settings.relationship(paymentSettingId),
    order: sdk.orders.relationship(orderId),
    ...(clientData != null ? { client_data: clientData } : {}),
    ...(vaulting === true ? { vaulting: true } : {}),
    // A zero or negative amount is rejected by the API (`greater_than: 0`), and
    // there is nothing left to pay anyway — fall back to the server's own
    // sizing rather than sending a value that cannot be valid.
    ...(amountCents != null && amountCents > 0 ? { amount_cents: amountCents } : {}),
  })
}

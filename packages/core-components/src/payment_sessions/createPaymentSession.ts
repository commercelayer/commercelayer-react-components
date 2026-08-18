import type { PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface CreatePaymentSessionParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  orderId: string
  /** Id of the selected Payment Setting, from `order.available_payment_settings`. */
  paymentSettingId: string
}

/**
 * Create a Payment Session for an order against the selected Payment Setting.
 *
 * `amount_cents` is deliberately **not** sent. Omitting it makes the server
 * size the session to the order's remaining amount, which is the only party
 * that knows what that is. Sending a value is worse than redundant: the server
 * silently caps it to the remaining amount, so an explicit amount can quietly
 * produce a session that differs from the one requested.
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
}: CreatePaymentSessionParams): Promise<PaymentSession> {
  const sdk = getSdk({ accessToken, interceptors })
  return await sdk.payment_sessions.create({
    payment_setting: sdk.payment_settings.relationship(paymentSettingId),
    order: sdk.orders.relationship(orderId),
  })
}

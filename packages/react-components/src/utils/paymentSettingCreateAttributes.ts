import { ADYEN_SETTING_TYPE, buildAdyenReturnUrl } from "@commercelayer/core-components"
import type { PaymentSetting } from "@commercelayer/sdk"
import { isGuestToken } from "#utils/isGuestToken"

/**
 * Extra attributes a Payment Setting needs on the `POST` that creates its
 * Payment Session.
 *
 * Sent at creation and never patched afterwards, because for a gateway like
 * Adyen the gateway-side session is built from them right there — and
 * `PATCH { _refresh: true }` is a no-op for it, so a session created without
 * them cannot be corrected, only replaced.
 */
export interface PaymentSettingCreateAttributes {
  clientData?: Record<string, unknown>
  internalVersion?: string
}

interface BuilderParams {
  setting: PaymentSetting
  accessToken?: string
}

type Builder = (params: BuilderParams) => PaymentSettingCreateAttributes

/**
 * Per-setting-type creation attributes, as a table.
 *
 * A table rather than a branch inside `<PaymentSetting>`: that component
 * already carries one condition for gift cards and one for unimplemented types,
 * and a third would start a pattern where every new gateway adds an `if` to a
 * generic component. Keeping the knowledge here means `<PaymentSetting>` stays
 * the thing that creates sessions without knowing what any of them are for.
 *
 * It cannot live in the gateway component either. The selection *is* the
 * session — the order carries no `payment_setting` relationship — so deferring
 * creation to a child would leave nothing for `findCurrentPaymentSession` to
 * read: the radio would not light up and a reload would lose the choice.
 */
const BUILDERS: Record<string, Builder> = {
  [ADYEN_SETTING_TYPE]: ({ accessToken }) => ({
    // The only `client_data` key the API forwards to Adyen `/sessions`. Built
    // from the current location rather than configured, because this runs when
    // the radio is clicked, inside a component no gateway prop can reach.
    ...(typeof window !== "undefined"
      ? { clientData: { return_url: buildAdyenReturnUrl(window.location.href) } }
      : {}),
    // Makes the API inject `shopperReference`, `storePaymentMethodMode:
    // askForConsent` and `recurringProcessingModel: CardOnFile`, which is what
    // renders the Drop-in's own save-card checkbox and its saved cards.
    //
    // Gated on the **token**, not on `order.customer`. Commerce Layer puts a
    // customer on nearly every order that has an email and falls back to that
    // email for `shopper_reference` — so gating on the order would store a card
    // against a guest's address and show it, last four digits and expiry, to
    // the next visitor who typed the same one. `<PlaceOrderButtonPaymentSource>`
    // gates `_save_payment_source_to_customer_wallet` the same way.
    ...(isAuthenticatedCustomer(accessToken) ? { internalVersion: "Tokenization" } : {}),
  }),
}

/**
 * Attributes to add to `createPaymentSession` for this setting. Empty for every
 * setting with nothing to collect.
 */
export function paymentSettingCreateAttributes(
  params: BuilderParams
): PaymentSettingCreateAttributes {
  return BUILDERS[params.setting.type]?.(params) ?? {}
}

/**
 * Why this setting cannot be offered, or `undefined` when it can.
 *
 * The string is a development-only warning, not copy: a setting that fails here
 * is skipped exactly like an unimplemented one, because a radio button that
 * does nothing when clicked is worse for the shopper than no radio button.
 */
export function paymentSettingUnusableReason(setting: PaymentSetting): string | undefined {
  // `available_payment_settings` returns the market's settings with no
  // `.enabled` filter — unlike `available_payment_methods` on the older model —
  // so a gateway an organization has switched off still arrives here.
  if (setting.disabled_at != null) return "the setting is disabled"

  // `public_key` is optional and, unlike `api_key` or `merchant_account`, not
  // validated for presence, so a setting that charges perfectly well
  // server-side can carry none. Without it there is no Client Key and the
  // Drop-in cannot boot.
  if (setting.type === ADYEN_SETTING_TYPE) {
    const key = (setting as { public_key?: string | null }).public_key
    if (typeof key !== "string" || key === "") return "the setting has no public_key"
  }

  return undefined
}

/**
 * Whether the access token belongs to a signed-in customer.
 *
 * A malformed token is treated as a guest: the only thing riding on this is
 * whether a card may be saved, and defaulting to "no" is the safe answer.
 */
function isAuthenticatedCustomer(accessToken?: string): boolean {
  if (accessToken == null) return false
  try {
    return !isGuestToken(accessToken)
  } catch {
    return false
  }
}

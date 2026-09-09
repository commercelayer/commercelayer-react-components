import {
  ADYEN_SETTING_TYPE,
  buildGatewayReturnUrl,
  STRIPE_SETTING_TYPE,
} from "@commercelayer/core-components"
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
  /**
   * Where the gateway should send the shopper back to, when the application has
   * an opinion. Falls back to the current location.
   */
  returnUrl?: string
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
  [ADYEN_SETTING_TYPE]: ({ accessToken, returnUrl }) => ({
    // The only `client_data` key the API forwards to Adyen `/sessions`.
    //
    // Derived from the current location when the application says nothing,
    // which is right for a checkout whose URL is reloadable as it stands. It is
    // not right for one whose credentials live in the query string: from
    // gateway version 72 Adyen refuses a `returnUrl` over 1024 characters, and
    // an access token alone can exceed that. Such an application passes
    // `returnUrl` and re-authenticates the return itself.
    ...adyenReturnUrl(returnUrl),
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
 * Adyen's own cap on `returnUrl`, from gateway version 72 onwards.
 *
 * Over the cap, Adyen refuses the session with `Field 'returnUrl' may not
 * exceed 1024 characters`, which Commerce Layer relays alongside `token - can't
 * be blank` — the token is assigned before the gateway call and not persisted
 * when it fails, so the second error is collateral and the pair points at
 * nothing an application recognises. A storefront whose credentials live in the
 * query string blows past it on the JWT alone.
 *
 * Older versions do not validate it, and `payment_setting_adyens` defaults to
 * the newest version it supports — so an existing setting can work for months
 * and a newly created one fail immediately.
 */
export const ADYEN_RETURN_URL_MAX_LENGTH = 1024

/**
 * The `client_data.return_url` for an Adyen session, and a warning if it cannot
 * be used.
 *
 * The check lives here rather than in the builder because this is where the
 * value is about to be handed to Adyen — so it also covers a `returnUrl` the
 * application supplied, which a check inside the builder would never see.
 */
function adyenReturnUrl(returnUrl?: string): PaymentSettingCreateAttributes {
  const url =
    returnUrl ??
    (typeof window !== "undefined" ? buildGatewayReturnUrl(window.location.href) : undefined)
  if (url == null) return {}

  if (url.length > ADYEN_RETURN_URL_MAX_LENGTH && process.env.NODE_ENV !== "production") {
    console.warn(
      `[commercelayer] the Adyen return URL is ${url.length} characters, over Adyen's limit of ` +
        `${ADYEN_RETURN_URL_MAX_LENGTH}. Creating the Payment Session will fail. Pass \`returnUrl\` ` +
        "to <PaymentSetting> with a URL this application can reload — commonly the same one " +
        "without its access token, re-authenticating the return from storage."
    )
  }
  return { clientData: { return_url: url } }
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

  // `public_key` is optional and, unlike `api_key`, not validated for presence,
  // so a setting that charges perfectly well server-side can carry none.
  // Without it the browser has no publishable credential and neither Adyen's
  // Drop-in nor Stripe's Elements can boot.
  if (setting.type === ADYEN_SETTING_TYPE || setting.type === STRIPE_SETTING_TYPE) {
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

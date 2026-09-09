/**
 * Query parameters Adyen adds when it sends the shopper back from a 3DS page.
 *
 * They have to come off before the URL is used as the *next* `returnUrl`: a
 * second redirect would otherwise carry the first attempt's `redirectResult`,
 * and that value is single-use.
 */
const ADYEN_RETURN_PARAMS = ["redirectResult", "sessionId", "resultCode"] as const

/**
 * Adyen's own cap on `returnUrl`, from gateway version 72 onwards.
 *
 * Worth a constant and a warning rather than a silent overrun. A URL over the
 * cap is refused by Adyen with `Field 'returnUrl' may not exceed 1024
 * characters`, which Commerce Layer relays alongside `token - can't be blank` —
 * the token is assigned before the gateway call and not persisted when it
 * fails, so the second error is collateral and the pair points at nothing an
 * application recognises. A storefront whose credentials live in the query
 * string blows past it on the JWT alone.
 *
 * Older versions do not validate it, and `payment_setting_adyens` defaults to
 * the newest version it supports — so an existing setting can work for months
 * and a newly created one fail immediately.
 */
export const ADYEN_RETURN_URL_MAX_LENGTH = 1024

/**
 * Build the `returnUrl` an Adyen Session is created with.
 *
 * Derived from where the shopper is rather than configured, because the Payment
 * Session — and with it the Adyen Session — is created when the radio is
 * clicked, by `<PaymentSetting>`, which knows nothing about gateways. A prop
 * would have to sit on that generic component to be read in time.
 *
 * Two things are deliberately stripped, and both are bugs if they survive:
 *
 * - **Adyen's own return parameters.** Reusing a URL that still carries
 *   `redirectResult` bakes a spent, single-use value into the new session.
 * - **The fragment.** Adyen appends its parameters as a query string, so a
 *   `returnUrl` ending in `#payment` would come back as
 *   `…#payment?redirectResult=…` — a fragment, not a query, and nothing can
 *   read it. Checkouts that keep the step in the hash are common enough that
 *   this is not a hypothetical.
 *
 * Any other query the application had is preserved: it is how a storefront
 * identifies the page it wants back.
 *
 * @param href the current location, as `window.location.href`
 */
export function buildAdyenReturnUrl(href: string): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    // Not parseable, so nothing can be cleaned off it. Better to hand Adyen
    // what we were given than to invent a URL the shopper never came from.
    return href
  }

  for (const param of ADYEN_RETURN_PARAMS) url.searchParams.delete(param)
  url.hash = ""

  const returnUrl = url.toString()
  if (returnUrl.length > ADYEN_RETURN_URL_MAX_LENGTH && process.env.NODE_ENV !== "production") {
    console.warn(
      `[commercelayer] the Adyen returnUrl derived from this page is ${returnUrl.length} characters, ` +
        `over Adyen's limit of ${ADYEN_RETURN_URL_MAX_LENGTH}. Creating the Payment Session will fail. ` +
        "Pass `returnUrl` to <PaymentSetting> with a URL this application can reload — commonly the " +
        "same one without its access token, re-authenticating the return from storage."
    )
  }
  return returnUrl
}

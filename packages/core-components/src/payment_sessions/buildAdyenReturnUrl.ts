/**
 * Query parameters Adyen adds when it sends the shopper back from a 3DS page.
 *
 * They have to come off before the URL is used as the *next* `returnUrl`: a
 * second redirect would otherwise carry the first attempt's `redirectResult`,
 * and that value is single-use.
 */
const ADYEN_RETURN_PARAMS = ["redirectResult", "sessionId", "resultCode"] as const

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

  return url.toString()
}

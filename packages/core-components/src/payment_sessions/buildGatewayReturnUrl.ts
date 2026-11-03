/**
 * Query parameters a gateway adds when it sends the shopper back.
 *
 * They have to come off before the URL is used as the *next* `returnUrl`: a
 * second redirect would otherwise carry the first attempt's value, and every
 * one of these is single-use — Adyen refuses a repeated `redirectResult`, and a
 * stale `payment_intent_client_secret` would have Stripe report the outcome of
 * an attempt that is over.
 *
 * Both gateways' parameters are removed whichever one is being built for. They
 * cannot collide — a return carries one gateway's — and a checkout that
 * switched setting between attempts would otherwise hand the new gateway the
 * old one's leftovers.
 */
const GATEWAY_RETURN_PARAMS = [
  "redirectResult",
  "sessionId",
  "resultCode",
  "payment_intent",
  "payment_intent_client_secret",
  "redirect_status",
] as const

/**
 * Build the URL a gateway should send the shopper back to.
 *
 * Derived from where the shopper is rather than configured, because for Adyen
 * the Payment Session — and with it the gateway session — is created when the
 * radio is clicked, by `<PaymentSetting>`, which knows nothing about gateways.
 * An application with an opinion passes `returnUrl` to that component instead;
 * this is the fallback.
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
export function buildGatewayReturnUrl(href: string): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    // Not parseable, so nothing can be cleaned off it. Better to hand Adyen
    // what we were given than to invent a URL the shopper never came from.
    return href
  }

  for (const param of GATEWAY_RETURN_PARAMS) url.searchParams.delete(param)
  url.hash = ""

  return url.toString()
}

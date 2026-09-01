import { useEffect } from "react"

const MESSAGE =
  "[PlaceOrderButton] Only one of the privacy policy and terms of service URLs is set, so acceptance is NOT required and the button will enable without the shopper ticking anything. The gate gets armed by both URLs together, because <PrivacyAndTermsCheckbox> links to both. Set the missing one on the order (privacy_url / terms_url) or in the organization config, or clear the other one to opt out deliberately."

/**
 * Warns, in development only, when privacy & terms are half-configured.
 *
 * `placeOrderPermitted` arms the gate on `privacyUrl && termsUrl`, so exactly
 * one URL silently means "no acceptance required" — a checkout that looks
 * gated but is not. Requiring acceptance on one URL instead would be worse:
 * the checkbox renders a link for each, and one of them would point nowhere.
 * So the behaviour is left alone and the ambiguity is made visible instead.
 *
 * @param privacyUrl - Resolved privacy policy URL, if any.
 * @param termsUrl - Resolved terms of service URL, if any.
 */
export function useHalfConfiguredTermsWarning(
  privacyUrl: string | null | undefined,
  termsUrl: string | null | undefined
): void {
  useEffect(() => {
    const hasPrivacy = Boolean(privacyUrl)
    const hasTerms = Boolean(termsUrl)
    if (hasPrivacy === hasTerms) return
    if (process.env.NODE_ENV === "production") return
    console.error(MESSAGE)
  }, [privacyUrl, termsUrl])
}

export default useHalfConfiguredTermsWarning

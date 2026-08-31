import { useEffect } from "react"
import { getCheckboxCount } from "#utils/termsAcceptanceStore"

const MESSAGE =
  "[PlaceOrderButton] This order requires accepting the privacy policy and terms of service, but no <PrivacyAndTermsCheckbox> is mounted, so the shopper has no way to accept and the button stays disabled. Render <PrivacyAndTermsCheckbox>, or build your own control with the useTermsAndConditions() hook."

/**
 * Warns, in development only, when acceptance is required but nothing on the
 * page can collect it — the one state in which the gate leaves a dead button
 * with no explanation.
 *
 * The check lives in an effect on purpose. Child effects run before parent
 * effects, so by the time this runs every `<PrivacyAndTermsCheckbox>` in the
 * tree has already registered itself: a checkbox that mounts in the same commit
 * can never trigger a false alarm, and no timer is needed to find that out.
 *
 * @param termsBlocking - True when acceptance is the only remaining blocker.
 * @param orderId - Order the acceptance is keyed on.
 */
export function useMissingTermsCheckboxWarning(
  termsBlocking: boolean | undefined,
  orderId: string | undefined
): void {
  useEffect(() => {
    if (!termsBlocking) return
    if (getCheckboxCount(orderId) > 0) return
    if (process.env.NODE_ENV === "production") return
    console.error(MESSAGE)
  }, [termsBlocking, orderId])
}

export default useMissingTermsCheckboxWarning

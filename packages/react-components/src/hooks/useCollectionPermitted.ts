import { useContext } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { useTermsAndConditions } from "#hooks/useTermsAndConditions"
import { useOrganizationConfig } from "#utils/organization"

/**
 * Whether a payment may be collected for this order yet.
 *
 * The privacy-and-terms gate, and the only place it is decided. It is a legal
 * requirement of the checkout rather than a property of the payment model, so
 * the library owns it — but it now has to be asked in two places, and that is
 * why it is a hook rather than an expression.
 *
 * `<PlaceOrderButton>` asks because for a card it *is* the pay button. A
 * gateway component with a **Gateway-Owned Button** asks because for PayPal the
 * gate cannot sit in front of our click — there is no our click — so it sits
 * inside the method's own, through PayPal's `onInit` and `onClick`.
 *
 * Copying the expression into both is the shape of a bug this repository has
 * already shipped: `canAddGiftCard` asked half of what `isLiveGiftCard` asked,
 * the two drifted, and a shopper could never re-apply a refunded gift card. One
 * owner that is neither caller is the fix that came out of it.
 *
 * **Returns `true` when the order and the organization carry no terms and
 * privacy URLs.** There is nothing to accept then, and the checkout must not be
 * blocked on a consent it never asked for.
 */
export function useCollectionPermitted(): boolean {
  const { order } = useContext(OrderContext)
  const { accessToken } = useContext(CommerceLayerContext)
  const organizationConfig = useOrganizationConfig({ accessToken })
  const { accepted } = useTermsAndConditions()

  const privacyUrl = order?.privacy_url ?? organizationConfig?.urls?.privacy
  const termsUrl = order?.terms_url ?? organizationConfig?.urls?.terms

  return privacyUrl && termsUrl ? accepted : true
}

export default useCollectionPermitted

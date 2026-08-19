import { type JSX, useContext, useEffect, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { PLACE_ORDER_RECHECK_EVENT } from "#hooks/usePlaceOrder"
import { useTermsAndConditions } from "#hooks/useTermsAndConditions"
import { useOrganizationConfig } from "#utils/organization"
import { registerCheckbox } from "#utils/termsAcceptanceStore"
import BaseInput, { type BaseInputProps } from "../utils/BaseInput"

export function PrivacyAndTermsCheckbox(props: Partial<BaseInputProps>): JSX.Element {
  const { accessToken } = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const [forceDisabled, setForceDisabled] = useState(true)
  const { accepted, setAccepted } = useTermsAndConditions()
  const fieldName = "privacy-terms"
  const organizationConfig = useOrganizationConfig({ accessToken })

  const privacyUrl = order?.privacy_url ?? organizationConfig?.urls?.privacy
  const termsUrl = order?.terms_url ?? organizationConfig?.urls?.terms

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setAccepted((e.target as HTMLInputElement)?.checked)
    // Announce the change through a DOM event too. The acceptance store above
    // is subscribed to by the `payment_source` branch only, so a
    // `payment_sessions` place-order button would never hear the checkbox and
    // would stay disabled for good. The event is additive.
    window.dispatchEvent(new CustomEvent(PLACE_ORDER_RECHECK_EVENT))
  }

  useEffect(() => {
    setForceDisabled(!(privacyUrl && termsUrl))
  }, [privacyUrl, termsUrl])

  // Announce this checkbox to the store so `placeOrderPermitted` can tell
  // "the shopper has not accepted yet" apart from "nobody is asking".
  useEffect(() => registerCheckbox(order?.id), [order?.id])

  return (
    <BaseInput
      type="checkbox"
      name={fieldName}
      disabled={forceDisabled}
      onChange={handleChange}
      checked={accepted}
      {...props}
    />
  )
}

export default PrivacyAndTermsCheckbox

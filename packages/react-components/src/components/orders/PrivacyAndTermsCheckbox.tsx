import { type JSX, useContext, useEffect, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import { PLACE_ORDER_RECHECK_EVENT } from "#hooks/usePlaceOrder"
import { useOrganizationConfig } from "#utils/organization"
import BaseInput, { type BaseInputProps } from "../utils/BaseInput"

export function PrivacyAndTermsCheckbox(props: Partial<BaseInputProps>): JSX.Element {
  const { accessToken } = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const placeOrderCtx = useContext(PlaceOrderContext)
  const isStandalone = placeOrderCtx._isProvided !== true
  const [forceDisabled, setForceDisabled] = useState(true)
  const [checked, setChecked] = useState(false)
  const fieldName = "privacy-terms"
  const organizationConfig = useOrganizationConfig({ accessToken })

  const privacyUrl = order?.privacy_url ?? organizationConfig?.urls?.privacy
  const termsUrl = order?.terms_url ?? organizationConfig?.urls?.terms

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const v = (e.target as HTMLInputElement)?.checked
    setChecked(v)
    localStorage.setItem(fieldName, v.toString())
    if (!isStandalone && placeOrderCtx.placeOrderPermitted) {
      placeOrderCtx.placeOrderPermitted()
    } else if (isStandalone) {
      window.dispatchEvent(new CustomEvent(PLACE_ORDER_RECHECK_EVENT))
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: If we add checked to the dependencies, it creates an wrong behavior to disable the place order button.
  useEffect(() => {
    if (privacyUrl && termsUrl) setForceDisabled(false)
    if (!checked) localStorage.setItem(fieldName, checked.toString())
    return () => {
      setForceDisabled(true)
      localStorage.removeItem(fieldName)
    }
  }, [privacyUrl, termsUrl])
  return (
    <BaseInput
      type="checkbox"
      name={fieldName}
      disabled={forceDisabled}
      onChange={handleChange}
      checked={checked}
      {...props}
    />
  )
}

export default PrivacyAndTermsCheckbox

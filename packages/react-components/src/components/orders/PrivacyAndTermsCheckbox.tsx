import { type JSX, useContext, useEffect, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import { useOrganizationConfig } from "#utils/organization"
import BaseInput, { type BaseInputProps } from "../utils/BaseInput"

export function PrivacyAndTermsCheckbox(
  props: Partial<BaseInputProps>,
): JSX.Element {
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const { placeOrderPermitted } = useContext(PlaceOrderContext)
  const [forceDisabled, setForceDisabled] = useState(true)
  const [checked, setChecked] = useState(false)
  const fieldName = "privacy-terms"
  const organizationConfig = useOrganizationConfig({ accessToken, endpoint })

  const privacyUrl = order?.privacy_url ?? organizationConfig?.urls?.privacy
  const termsUrl = order?.terms_url ?? organizationConfig?.urls?.terms

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const v = (e.target as HTMLInputElement)?.checked
    setChecked(v)
    localStorage.setItem(fieldName, v.toString())
    if (placeOrderPermitted) placeOrderPermitted()
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

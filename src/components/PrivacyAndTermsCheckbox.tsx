import components from '#config/components'
import OrderContext from '#context/OrderContext'
import PlaceOrderContext from '#context/PlaceOrderContext'
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import BaseInput, { BaseInputProps } from './utils/BaseInput'

const propTypes = components.PrivacyAndTermsCheckbox.propTypes
const displayName = components.PrivacyAndTermsCheckbox.displayName

const PrivacyAndTermsCheckbox: FunctionComponent<Partial<BaseInputProps>> = (
  props
) => {
  const { order } = useContext(OrderContext)
  const { placeOrderPermitted } = useContext(PlaceOrderContext)
  const [forceDisabled, setForceDisabled] = useState(true)
  const fieldName = 'privacy-terms'
  const handleChange: any = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = e.target?.checked
    localStorage.setItem(fieldName, `${v}`)
    placeOrderPermitted && placeOrderPermitted()
  }
  useEffect(() => {
    if (order?.privacyUrl && order?.termsUrl) setForceDisabled(false)
    return () => {
      setForceDisabled(true)
      localStorage.removeItem(fieldName)
    }
  }, [order?.privacyUrl, order?.termsUrl])
  return (
    <BaseInput
      type="checkbox"
      name={fieldName}
      disabled={forceDisabled}
      onChange={handleChange}
      {...props}
    />
  )
}

PrivacyAndTermsCheckbox.propTypes = propTypes
PrivacyAndTermsCheckbox.displayName = displayName

export default PrivacyAndTermsCheckbox

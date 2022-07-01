import components from '#config/components'
import OrderContext from '#context/OrderContext'
import PlaceOrderContext from '#context/PlaceOrderContext'
import { useContext, useEffect, useState } from 'react'
import BaseInput, { BaseInputProps } from '../utils/BaseInput'

const propTypes = components.PrivacyAndTermsCheckbox.propTypes
const displayName = components.PrivacyAndTermsCheckbox.displayName

export function PrivacyAndTermsCheckbox(props: Partial<BaseInputProps>) {
  const { order } = useContext(OrderContext)
  const { placeOrderPermitted } = useContext(PlaceOrderContext)
  const [forceDisabled, setForceDisabled] = useState(true)
  const [checked, setChecked] = useState(false)
  const fieldName = 'privacy-terms'
  const handleChange: any = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = e.target?.checked
    setChecked(v)
    localStorage.setItem(fieldName, `${v}`)
    placeOrderPermitted && placeOrderPermitted()
  }
  useEffect(() => {
    if (order?.privacy_url && order?.terms_url) setForceDisabled(false)
    if (!checked) localStorage.setItem(fieldName, `${checked}`)
    return () => {
      setForceDisabled(true)
      localStorage.removeItem(fieldName)
    }
  }, [order?.privacy_url, order?.terms_url])
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

PrivacyAndTermsCheckbox.propTypes = propTypes
PrivacyAndTermsCheckbox.displayName = displayName

export default PrivacyAndTermsCheckbox

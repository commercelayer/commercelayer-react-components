import OrderContext from '#context/OrderContext'
import PlaceOrderContext from '#context/PlaceOrderContext'
import { useContext, useEffect, useState, type JSX } from 'react';
import BaseInput, { type BaseInputProps } from '../utils/BaseInput'

export function PrivacyAndTermsCheckbox(
  props: Partial<BaseInputProps>
): JSX.Element {
  const { order } = useContext(OrderContext)
  const { placeOrderPermitted } = useContext(PlaceOrderContext)
  const [forceDisabled, setForceDisabled] = useState(true)
  const [checked, setChecked] = useState(false)
  const fieldName = 'privacy-terms'
  const handleChange: any = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = e.target?.checked
    setChecked(v)
    localStorage.setItem(fieldName, v.toString())
    if (placeOrderPermitted) placeOrderPermitted()
  }
  useEffect(() => {
    if (order?.privacy_url && order?.terms_url) setForceDisabled(false)
    if (!checked) localStorage.setItem(fieldName, checked.toString())
    return () => {
      setForceDisabled(true)
      localStorage.removeItem(fieldName)
    }
  }, [order?.privacy_url, order?.terms_url])
  return (
    <BaseInput
      type='checkbox'
      name={fieldName}
      disabled={forceDisabled}
      onChange={handleChange}
      checked={checked}
      {...props}
    />
  )
}

export default PrivacyAndTermsCheckbox

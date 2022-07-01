import { useContext, useEffect, useState } from 'react'
import BaseInput from '../utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps } from '#typings'
import useRapidForm from 'rapid-form'
import CustomerContext from '#context/CustomerContext'
import isEmpty from 'lodash/isEmpty'
import { BaseError, CodeErrorType } from '#typings/errors'

const propTypes = components.CustomerInput.propTypes
const displayName = components.CustomerInput.displayName

type Props = {
  name?: 'customer_email' | string
  type?: 'email' | string
  saveOnBlur?: boolean
  onBlur?: (email: string) => void
  errorClassName?: string
} & Omit<BaseInputComponentProps, 'name' | 'type' | 'onBlur'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function CustomerInput(props: Props) {
  const {
    name = 'customer_email',
    placeholder = '',
    required = true,
    saveOnBlur = false,
    type = 'email',
    value,
    onBlur,
    className,
    errorClassName,
    ...p
  } = props
  const { validation, values, errors } = useRapidForm({ fieldEvent: 'blur' })
  const { saveCustomerUser, setCustomerErrors, setCustomerEmail } =
    useContext(CustomerContext)
  const [hasError, setHasError] = useState(false)
  const handleOnBlur = async () => {
    if (saveOnBlur && isEmpty(errors) && !isEmpty(values)) {
      saveCustomerUser && (await saveCustomerUser(values[name].value))
      onBlur && onBlur(values[name].value)
    }
  }
  useEffect(() => {
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const code = errors[fieldName]?.['code']
        const message = errors[fieldName]?.['message']
        formErrors.push({
          code: code as CodeErrorType,
          message: message || '',
          resource: 'orders',
          field: fieldName,
        })
      }
      if (!isEmpty(formErrors)) {
        setHasError(true)
        setCustomerErrors && setCustomerErrors(formErrors)
      }
    } else if (!isEmpty(values)) {
      setCustomerErrors && setCustomerErrors([])
      setCustomerEmail && setCustomerEmail(values[name].value)
      setHasError(false)
    }
    return () => {
      setHasError(false)
    }
  }, [errors])
  const classNameComputed = `${className ? className : ''} ${
    hasError && errorClassName ? errorClassName : ''
  }`
  return (
    <BaseInput
      name={name}
      type={type}
      ref={validation}
      required={required}
      placeholder={placeholder}
      defaultValue={value}
      onBlur={handleOnBlur}
      className={classNameComputed}
      {...p}
    />
  )
}

CustomerInput.propTypes = propTypes
CustomerInput.displayName = displayName

export default CustomerInput

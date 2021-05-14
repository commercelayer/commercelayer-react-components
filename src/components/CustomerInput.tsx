import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import BaseInput from './utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps } from '#typings'
import useRapidForm from 'rapid-form'
import CustomerContext from '#context/CustomerContext'
import isEmpty from 'lodash/isEmpty'
import { BaseError, CodeErrorType } from '#typings/errors'

const propTypes = components.CustomerInput.propTypes
const displayName = components.CustomerInput.displayName

type CustomerInputProps = {
  name?: 'customer_email' | string
  type?: 'email' | string
  saveOnBlur?: boolean
  onBlur?: () => void
  errorClassName?: string
} & Omit<BaseInputComponentProps, 'name' | 'type' | 'onBlur'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const CustomerInput: FunctionComponent<CustomerInputProps> = (props) => {
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
  const { validation, values, errors } = useRapidForm()
  const { saveCustomerUser, setCustomerErrors, setCustomerEmail } = useContext(
    CustomerContext
  )
  const [hasError, setHasError] = useState(false)
  const handleOnBlur = async () => {
    if (saveOnBlur && isEmpty(errors) && !isEmpty(values)) {
      await saveCustomerUser(values[name].value)
      onBlur && onBlur()
    }
  }
  useEffect(() => {
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const { code, message } = errors[fieldName]
        formErrors.push({
          code: code as CodeErrorType,
          message,
          resource: 'order',
          field: fieldName,
        })
      }
      if (!isEmpty(formErrors)) {
        setHasError(true)
        setCustomerErrors(formErrors)
      }
    } else if (!isEmpty(values)) {
      setCustomerErrors([])
      setCustomerEmail(values[name].value)
      setHasError(false)
    }
    return () => {
      setHasError(false)
    }
  }, [errors])
  const classNameComputed = `${className} ${hasError ? errorClassName : ''}`
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

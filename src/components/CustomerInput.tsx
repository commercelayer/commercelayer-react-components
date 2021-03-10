import React, { FunctionComponent, useContext, useEffect } from 'react'
import BaseInput from './utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps } from '#typings'
import useRapidForm from 'rapid-form'
import CustomerContext from '#context/CustomerContext'
import { isEmpty } from 'lodash'
import { BaseError, CodeErrorType } from '#typings/errors'

const propTypes = components.CustomerInput.propTypes
const displayName = components.CustomerInput.displayName

type CustomerInputProps = {
  name?: 'customer_email' | string
  type?: 'email' | string
  saveOnBlur?: boolean
  onBlur?: () => void
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
    ...p
  } = props
  const { validation, values, errors } = useRapidForm()
  const { saveCustomerUser, setCustomerErrors, setCustomerEmail } = useContext(
    CustomerContext
  )
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
      !isEmpty(formErrors) && setCustomerErrors(formErrors)
    } else if (!isEmpty(values)) {
      setCustomerErrors([])
      setCustomerEmail(values[name].value)
    }
  }, [errors])
  return (
    <BaseInput
      name={name}
      type={type}
      ref={validation}
      required={required}
      placeholder={placeholder}
      defaultValue={value}
      onBlur={handleOnBlur}
      {...p}
    />
  )
}

CustomerInput.propTypes = propTypes
CustomerInput.displayName = displayName

export default CustomerInput

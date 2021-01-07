import React, { FunctionComponent, useContext, useEffect } from 'react'
import BaseInput from './utils/BaseInput'
import components from '@config/components'
import { BaseInputComponentProps } from '@typings'
import useRapidForm from 'rapid-form'
import CustomerContext from '@context/CustomerContext'
import _ from 'lodash'
import { BaseError, CodeErrorType } from '@typings/errors'

const propTypes = components.CustomerInput.propTypes
const displayName = components.CustomerInput.displayName

type CustomerInputProps = {
  name?: 'customer_email' | string
  type?: 'email' | string
} & Omit<BaseInputComponentProps, 'name' | 'type'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const CustomerInput: FunctionComponent<CustomerInputProps> = (props) => {
  const {
    placeholder = '',
    required = true,
    value,
    name = 'customer_email',
    type = 'email',
    ...p
  } = props
  const { validation, values, errors } = useRapidForm()
  const {
    saveOnBlur,
    saveCustomerUser,
    setCustomerErrors,
    setCustomerEmail,
  } = useContext(CustomerContext)
  const handleOnBlur = () => {
    if (saveOnBlur && _.isEmpty(errors) && !_.isEmpty(values)) {
      saveCustomerUser(values[name].value)
    }
  }
  useEffect(() => {
    if (!_.isEmpty(errors)) {
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
      !_.isEmpty(formErrors) && setCustomerErrors(formErrors)
    } else if (!_.isEmpty(values)) {
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

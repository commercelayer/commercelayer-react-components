/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useContext, useEffect, useState, type JSX } from 'react';
import BaseInput from '#components-utils/BaseInput'
import type { BaseInputComponentProps } from '#typings'
import { useRapidForm } from 'rapid-form'
import CustomerContext from '#context/CustomerContext'
import type { BaseError, CodeErrorType } from '#typings/errors'
import { validateValue } from '#utils/validateFormFields'
import OrderContext from '#context/OrderContext'

type Props = {
  name?: 'customer_email' | string
  type?: 'email' | string
  saveOnBlur?: boolean
  onBlur?: (email: string) => void
  errorClassName?: string
} & Omit<BaseInputComponentProps, 'name' | 'type' | 'onBlur'> &
  Omit<JSX.IntrinsicElements['input'], 'children'> &
  Omit<JSX.IntrinsicElements['textarea'], 'children'>

export function CustomerInput(props: Props): JSX.Element {
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
  const { validation, values, errors, setError } = useRapidForm({
    fieldEvent: 'blur'
  })
  const { saveCustomerUser, setCustomerErrors, setCustomerEmail } =
    useContext(CustomerContext)
  const { setOrderErrors } = useContext(OrderContext)
  const [hasError, setHasError] = useState(false)
  const handleOnBlur = async (
    e:
      | React.FocusEvent<HTMLInputElement, Element>
      | React.FocusEvent<HTMLTextAreaElement, Element>
  ): Promise<void> => {
    const v = e?.target?.value
    const checkValue = validateValue(v, name, type, 'orders')
    const isValid = Object.keys(checkValue).length === 0
    if (saveOnBlur && Object.keys(values).length > 0) {
      if (saveCustomerUser != null) {
        await saveCustomerUser(values[name].value)
        if (onBlur) onBlur(values[name].value)
      }
    }
    if (!isValid) {
      const currentError = {
        ...checkValue,
        name: checkValue?.field
      }
      setError(currentError)
    }
  }
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const code = errors[fieldName]?.code
        const message = errors[fieldName]?.message
        formErrors.push({
          code: code as CodeErrorType,
          message: message || '',
          resource: 'orders',
          field: fieldName
        })
      }
      if (formErrors.length > 0) {
        setHasError(true)
        if (setCustomerErrors) setCustomerErrors(formErrors)
      }
    } else {
      if (setCustomerErrors) setCustomerErrors([])
      if (setOrderErrors) setOrderErrors([])
      setHasError(false)
    }
    if (Object.keys(values).length > 0) {
      if (setCustomerEmail) setCustomerEmail(values[name].value)
    }
    return () => {
      setHasError(false)
    }
  }, [errors])
  const classNameComputed = `${className ?? ''} ${
    hasError && errorClassName ? errorClassName : ''
  }`
  return (
    <BaseInput
      name={name}
      type={type}
      ref={validation as any}
      required={required}
      placeholder={placeholder}
      defaultValue={value}
      onBlur={(e) => {
        handleOnBlur(e)
      }}
      className={classNameComputed}
      {...p}
    />
  )
}

export default CustomerInput

import { useContext, useEffect, useState } from 'react'
import BaseInput from '#components-utils/BaseInput'
import { BaseInputComponentProps } from '#typings'
import { useRapidForm } from 'rapid-form'
import CustomerContext from '#context/CustomerContext'
import { BaseError, CodeErrorType } from '#typings/errors'

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
  const { validation, values, errors } = useRapidForm({ fieldEvent: 'blur' })
  const { saveCustomerUser, setCustomerErrors, setCustomerEmail } =
    useContext(CustomerContext)
  const [hasError, setHasError] = useState(false)
  const handleOnBlur = async (): Promise<void> => {
    if (
      saveOnBlur &&
      Object.keys(errors).length === 0 &&
      Object.keys(values).length > 0
    ) {
      if (saveCustomerUser != null) {
        await saveCustomerUser(values[name].value)
        if (onBlur) onBlur(values[name].value)
      }
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
    } else if (Object.keys(values).length > 0) {
      if (setCustomerErrors) setCustomerErrors([])
      if (setCustomerEmail) setCustomerEmail(values[name].value)
      setHasError(false)
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
      onBlur={() => {
        void handleOnBlur()
      }}
      className={classNameComputed}
      {...p}
    />
  )
}

export default CustomerInput

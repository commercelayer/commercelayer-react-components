import { type JSX, useContext, useState } from "react"
import BaseInput from "#components-utils/BaseInput"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import type { BaseInputComponentProps } from "#typings"
import type { BaseError } from "#typings/errors"
import { validateValue } from "#utils/validateFormFields"

type Props = {
  name?: "customer_email" | string
  type?: "email" | string
  saveOnBlur?: boolean
  onBlur?: (email: string) => void
  errorClassName?: string
} & Omit<BaseInputComponentProps, "name" | "type" | "onBlur"> &
  Omit<JSX.IntrinsicElements["input"], "children"> &
  Omit<JSX.IntrinsicElements["textarea"], "children">

export function CustomerInput(props: Props): JSX.Element {
  const {
    name = "customer_email",
    placeholder = "",
    required = true,
    saveOnBlur = false,
    type = "email",
    value,
    onBlur,
    className,
    errorClassName,
    ...p
  } = props
  const { saveCustomerUser, setCustomerErrors, setCustomerEmail } = useContext(CustomerContext)
  const { setOrderErrors } = useContext(OrderContext)
  const [fieldError, setFieldError] = useState<BaseError | null>(null)

  const handleOnBlur = async (
    event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>
  ): Promise<void> => {
    const customerEmail = event.target.value
    const validationError = validateValue(customerEmail, name, type, "orders")

    setCustomerEmail?.(customerEmail)

    if (Object.keys(validationError).length > 0) {
      const nextError: BaseError = {
        code: "VALIDATION_ERROR",
        message: validationError.message ?? "",
        resource: "orders",
        field: validationError.field ?? name,
      }

      setFieldError(nextError)
      setCustomerErrors?.([nextError])
      setOrderErrors?.([nextError])
      return
    }

    setFieldError(null)
    setCustomerErrors?.([])
    setOrderErrors?.([])

    if (saveOnBlur && saveCustomerUser != null) {
      await saveCustomerUser(customerEmail)
      onBlur?.(customerEmail)
    }
  }

  const classNameComputed =
    `${className ?? ""} ${fieldError != null && errorClassName ? errorClassName : ""}`.trim()

  return (
    <BaseInput
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      defaultValue={value}
      onBlur={(event) => {
        void handleOnBlur(event)
      }}
      className={classNameComputed}
      {...p}
    />
  )
}

export default CustomerInput

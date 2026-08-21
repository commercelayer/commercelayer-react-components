import { useRapidForm, type Value } from "rapid-form"
import {
  type JSX,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import AddressesContext from "#context/AddressContext"
import CustomerAddressFormContext from "#context/CustomerAddressFormContext"
import OrderContext from "#context/OrderContext"
import type { AddressField } from "#reducers/AddressReducer"
import type { AddressCountrySelectName, AddressInputName } from "#typings"
import type { TCustomerAddress } from "#typings/customers"
import type { BaseError, CodeErrorType } from "#typings/errors"
import { isEmptyStates } from "#utils/countryStateCity"

const BILLING_COUNTRY_KEY = "billing_address_country_code" as const

interface Props extends Omit<JSX.IntrinsicElements["form"], "onSubmit"> {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
  countriesWithPredefinedStateOptions?: string[]
}

type FormErrors = Record<
  string,
  {
    code: string
    message: string
    error: boolean
  }
>

type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
type FormValue = Value & {
  required?: boolean
  type?: string
  value?: string | number | readonly string[]
}

function getFormElement(form: HTMLFormElement | null, name: string): FormElement | null {
  const element = form?.elements.namedItem(name)
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element
  }
  return null
}

export function CustomerAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = "on",
    reset = false,
    countriesWithPredefinedStateOptions,
    ...p
  } = props
  const { refValidation, values } = useRapidForm()
  const formValues = values as Record<string, FormValue>
  const [errors, setErrors] = useState<FormErrors>({})
  const { setAddressErrors, setAddress } = useContext(AddressesContext)
  const { order } = useContext(OrderContext)
  const formRef = useRef<HTMLFormElement | null>(null)
  const setFormRef = useCallback(
    (node: HTMLFormElement | null) => {
      formRef.current = node
      refValidation(node)
    },
    [refValidation]
  )

  const clearFieldError = useCallback((name: string) => {
    const input = getFormElement(formRef.current, name)
    input?.setCustomValidity("")
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors }
      delete nextErrors[name]
      return nextErrors
    })
  }, [])

  useEffect(() => {
    if (Object.keys(formValues).length === 0) {
      return
    }

    const nextErrors: FormErrors = {}

    for (const fieldName of Object.keys(formValues)) {
      const input = getFormElement(formRef.current, fieldName)
      if (input == null || input.validity.valid) {
        continue
      }

      if (fieldName === "billing_address_state_code") {
        const countryCode = String(formValues[BILLING_COUNTRY_KEY]?.value ?? "")
        if (
          countryCode !== "" &&
          isEmptyStates({ countryCode, countriesWithPredefinedStateOptions })
        ) {
          continue
        }
      }

      nextErrors[fieldName] = {
        code: "VALIDATION_ERROR",
        message: input.validationMessage,
        error: true,
      }
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      const formErrors: BaseError[] = Object.entries(nextErrors).map(([fieldName, error]) => ({
        code: error.code as CodeErrorType,
        message: error.message,
        resource: "billing_address",
        field: fieldName,
      }))
      setAddressErrors(formErrors, "billing_address")
      return
    }

    setAddressErrors([], "billing_address")
    const addressValues: Record<string, unknown> = {}

    for (const [name, field] of Object.entries(formValues)) {
      if (field == null) {
        continue
      }

      if (name === "billing_address_state_code") {
        const countryCode = String(formValues[BILLING_COUNTRY_KEY]?.value ?? "")
        if (
          countryCode !== "" &&
          !isEmptyStates({ countryCode, countriesWithPredefinedStateOptions }) &&
          !field.value
        ) {
          continue
        }
      }

      if (
        field.value != null &&
        (field.value || field.required === false) &&
        field.type !== "checkbox"
      ) {
        addressValues[name.replace("billing_address_", "")] = field.value
      }
    }

    setAddress({
      values: addressValues as TCustomerAddress,
      resource: "billing_address",
    })
  }, [formValues, countriesWithPredefinedStateOptions, setAddress, setAddressErrors])

  useEffect(() => {
    if (reset && (Object.keys(formValues).length > 0 || Object.keys(errors).length > 0)) {
      formRef.current?.reset()
      setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev))
      setAddressErrors([], "billing_address")
      setAddress({ values: {} as TCustomerAddress, resource: "billing_address" })
    }
  }, [reset, formValues, errors, setAddress, setAddressErrors])

  const setValue = useCallback(
    (
      name: AddressField | AddressInputName | AddressCountrySelectName,
      value: string | number | readonly string[]
    ): void => {
      const input = getFormElement(formRef.current, name)
      if (input != null) {
        input.setCustomValidity("")
        input.value = String(value)
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }

      clearFieldError(name)
      setAddress({
        values: {
          [name.replace("billing_address_", "")]: value,
        } as TCustomerAddress,
        resource: "billing_address",
      })
    },
    [clearFieldError, setAddress]
  )

  const providerValues = {
    values: formValues,
    setValue,
    errorClassName,
    requiresBillingInfo: order?.requires_billing_info ?? false,
    errors,
    resetField: (name: string) => {
      const input = getFormElement(formRef.current, name)
      if (input != null) {
        input.setCustomValidity("")
        input.value = ""
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }
      clearFieldError(name)
    },
  }

  return (
    <CustomerAddressFormContext.Provider value={providerValues}>
      <form ref={setFormRef} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </CustomerAddressFormContext.Provider>
  )
}

export default CustomerAddressForm

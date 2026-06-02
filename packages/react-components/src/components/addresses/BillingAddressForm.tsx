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
import BillingAddressFormContext, {
  type AddressValuesKeys,
} from "#context/BillingAddressFormContext"
import OrderContext from "#context/OrderContext"
import type { CustomFieldMessageError } from "#reducers/AddressReducer"
import type { TCustomerAddress } from "#typings/customers"
import type { BaseError, CodeErrorType } from "#typings/errors"
import { getSaveBillingAddressToAddressBook } from "#utils/localStorage"

type Props = {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
  fieldEvent?: "blur" | "change"
  customFieldMessageError?: CustomFieldMessageError
} & Omit<JSX.IntrinsicElements["form"], "onSubmit">

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
  checked?: boolean
  name?: string
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

export function BillingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = "on",
    reset = false,
    customFieldMessageError,
    fieldEvent: _fieldEvent = "change",
    ...p
  } = props
  const { refValidation, values } = useRapidForm()
  const formValues = values as Record<string, FormValue>
  const [errors, setErrors] = useState<FormErrors>({})
  const { setAddressErrors, setAddress, isBusiness } = useContext(AddressesContext)
  const { saveAddressToCustomerAddressBook, order, include, addResourceToInclude, includeLoaded } =
    useContext(OrderContext)
  const formRef = useRef<HTMLFormElement | null>(null)
  const setFormRef = useCallback(
    (node: HTMLFormElement | null) => {
      formRef.current = node
      refValidation(node)
    },
    [refValidation]
  )

  const resetFieldError = useCallback((name: string) => {
    const input = getFormElement(formRef.current, name)
    input?.setCustomValidity("")
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors }
      delete nextErrors[name]
      return nextErrors
    })
  }, [])

  useEffect(() => {
    if (!include?.includes("billing_address")) {
      addResourceToInclude({ newResource: "billing_address" })
    } else if (!includeLoaded?.billing_address) {
      addResourceToInclude({ newResourceLoaded: { billing_address: true } })
    }
  }, [include, includeLoaded, addResourceToInclude])

  useEffect(() => {
    if (Object.keys(formValues).length === 0) {
      return
    }

    const nativeErrors: FormErrors = {}
    for (const fieldName of Object.keys(formValues)) {
      const input = getFormElement(formRef.current, fieldName)
      if (input != null && !input.validity.valid) {
        nativeErrors[fieldName] = {
          code: "VALIDATION_ERROR",
          message: input.validationMessage,
          error: true,
        }
      }
    }

    let finalErrors: FormErrors = { ...nativeErrors }

    if (customFieldMessageError != null) {
      const updatedErrors: FormErrors = { ...nativeErrors }

      for (const [, field] of Object.entries(formValues)) {
        if (field == null || field.name == null || field.value == null) {
          continue
        }

        const flatValues: Record<string, unknown> = {}
        for (const [key, entry] of Object.entries(formValues)) {
          flatValues[key.replace("billing_address_", "")] = entry?.value
          flatValues[key] = entry?.value
        }

        const customMessage = customFieldMessageError({
          field: field.name,
          value: String(field.value),
          values: flatValues,
        })

        if (customMessage == null) {
          continue
        }

        if (typeof customMessage === "string") {
          updatedErrors[field.name] = {
            ...(updatedErrors[field.name] ?? {
              code: "VALIDATION_ERROR",
              message: customMessage,
              error: true,
            }),
            message: customMessage,
          }
        } else {
          for (const element of customMessage) {
            if (!element.isValid) {
              updatedErrors[element.field] = {
                code: "VALIDATION_ERROR",
                message: element.message ?? "",
                error: true,
              }
            } else {
              delete updatedErrors[element.field]
            }
          }
        }
      }

      finalErrors = updatedErrors
    }

    setErrors(finalErrors)

    if (Object.keys(finalErrors).length > 0) {
      const formErrors: BaseError[] = Object.entries(finalErrors).map(([fieldName, error]) => ({
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

      if (
        field.value != null &&
        (field.value || field.required === false) &&
        field.type !== "checkbox"
      ) {
        addressValues[name.replace("billing_address_", "")] = field.value
      }

      if (field.type === "checkbox") {
        saveAddressToCustomerAddressBook?.({
          type: "billing_address",
          value: field.checked ?? false,
        })
      }
    }

    setAddress({
      values: {
        ...addressValues,
        ...(isBusiness && { business: isBusiness }),
      } as TCustomerAddress,
      resource: "billing_address",
    })
  }, [
    formValues,
    isBusiness,
    customFieldMessageError,
    saveAddressToCustomerAddressBook,
    setAddress,
    setAddressErrors,
  ])

  useEffect(() => {
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(
      '[name="billing_address_save_to_customer_book"]'
    )
    const checkboxChecked = checkbox?.checked || getSaveBillingAddressToAddressBook()

    if (checkboxChecked) {
      checkbox?.setAttribute("checked", "true")
      saveAddressToCustomerAddressBook?.({ type: "billing_address", value: true })
    }
  }, [saveAddressToCustomerAddressBook])

  useEffect(() => {
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(
      '[name="billing_address_save_to_customer_book"]'
    )
    const checkboxChecked = checkbox?.checked || getSaveBillingAddressToAddressBook()

    if (
      reset &&
      (Object.keys(formValues).length > 0 || Object.keys(errors).length > 0 || checkboxChecked)
    ) {
      saveAddressToCustomerAddressBook?.({ type: "billing_address", value: false })
      formRef.current?.reset()
      setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev))
      setAddressErrors([], "billing_address")
      setAddress({ values: {} as TCustomerAddress, resource: "billing_address" })
    }
  }, [reset, formValues, errors, saveAddressToCustomerAddressBook, setAddress, setAddressErrors])

  const setValue = useCallback(
    (name: AddressValuesKeys, value: string | number | readonly string[]): void => {
      const input = getFormElement(formRef.current, name)
      if (input != null) {
        input.setCustomValidity("")
        input.value = String(value)
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }

      resetFieldError(name)
      setAddress({
        values: {
          [name.replace("billing_address_", "")]: value,
          ...(isBusiness && { business: isBusiness }),
        } as TCustomerAddress,
        resource: "billing_address",
      })
    },
    [isBusiness, resetFieldError, setAddress]
  )

  const providerValues = {
    isBusiness,
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
      resetFieldError(name)
    },
  }

  return (
    <BillingAddressFormContext.Provider value={providerValues}>
      <form ref={setFormRef} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressFormContext.Provider>
  )
}

export default BillingAddressForm

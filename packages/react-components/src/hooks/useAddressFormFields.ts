import { useRapidForm } from "rapid-form"
import { useCallback, useEffect, useRef, useState } from "react"
import type { ErrorMode } from "#context/BillingAddressFormContext"
import { useFormWiring } from "#hooks/useFormWiring"
import type {
  AddressResource,
  CustomFieldMessageError,
  setAddress as setAddressAction,
  setAddressErrors as setAddressErrorsAction,
} from "#reducers/AddressReducer"
import type {
  AddResourceToInclude,
  ResourceIncluded,
  SaveAddressToCustomerAddressBook,
} from "#reducers/OrderReducer"
import type { TCustomerAddress } from "#typings/customers"
import type { BaseError, CodeErrorType } from "#typings/errors"
import { type FormErrors, type FormValue, getFormElement } from "#utils/addressFormUtils"

interface UseAddressFormFieldsParams {
  resource: AddressResource
  isBusiness: boolean
  shouldSync: boolean
  customFieldMessageError?: CustomFieldMessageError
  reset: boolean
  saveAddressToCustomerAddressBook?: SaveAddressToCustomerAddressBook
  getSaveToAddressBook: () => boolean
  setAddress: (params: Parameters<typeof setAddressAction>[0]) => void
  setAddressErrors: (
    errors: BaseError[],
    resource: Parameters<typeof setAddressErrorsAction>[0]["resource"]
  ) => void
  include?: ResourceIncluded[]
  addResourceToInclude: (params: AddResourceToInclude) => void
  includeLoaded?: Partial<Record<ResourceIncluded, boolean>>
  errorMode?: ErrorMode
}

export function useAddressFormFields({
  resource,
  isBusiness,
  shouldSync,
  customFieldMessageError,
  reset,
  saveAddressToCustomerAddressBook,
  getSaveToAddressBook,
  setAddress,
  setAddressErrors,
  include,
  addResourceToInclude,
  includeLoaded,
  errorMode = "inline",
}: UseAddressFormFieldsParams) {
  const { refValidation, values } = useRapidForm()
  const formValues = values as Record<string, FormValue>
  const [errors, setErrors] = useState<FormErrors>({})
  const [hasValidated, setHasValidated] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const prefix = `${resource}_`
  const checkboxFieldName = `${resource}_save_to_customer_book`

  const wireForm = useFormWiring(refValidation)
  const setFormRef = useCallback(
    (node: HTMLFormElement | null) => {
      formRef.current = node
      wireForm(node)
    },
    [wireForm]
  )

  const clearFieldError = useCallback((name: string) => {
    const input = getFormElement(formRef.current, name)
    input?.setCustomValidity("")
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  useEffect(() => {
    if (!include?.includes(resource)) {
      addResourceToInclude({ newResource: resource })
    } else if (!includeLoaded?.[resource]) {
      addResourceToInclude({
        newResourceLoaded: { [resource]: true } as Partial<Record<ResourceIncluded, boolean>>,
      })
    }
  }, [include, includeLoaded, addResourceToInclude, resource])

  useEffect(() => {
    if (Object.keys(formValues).length === 0) return

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
        if (field == null || field.name == null || field.value == null) continue

        const flatValues: Record<string, unknown> = {}
        for (const [key, entry] of Object.entries(formValues)) {
          flatValues[key.replace(prefix, "")] = entry?.value
          flatValues[key] = entry?.value
        }

        const customMessage = customFieldMessageError({
          field: field.name,
          value: String(field.value),
          values: flatValues,
        })

        if (customMessage == null) continue

        if (typeof customMessage === "string") {
          updatedErrors[field.name] = {
            ...(updatedErrors[field.name] ?? { code: "VALIDATION_ERROR", error: true }),
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

    // In submit mode, suppress inline error display until the user has
    // explicitly triggered validation (e.g., by clicking Save).
    // After the first validate() call (hasValidated=true), errors update
    // live so the user can see corrections in real time.
    if (errorMode === "inline" || hasValidated) {
      setErrors(finalErrors)
    }

    if (!shouldSync) return

    if (Object.keys(finalErrors).length > 0) {
      setAddressErrors(
        Object.entries(finalErrors).map(([field, err]) => ({
          code: err.code as CodeErrorType,
          message: err.message,
          resource,
          field,
        })),
        resource
      )
      return
    }

    setAddressErrors([], resource)

    const addressValues: Record<string, unknown> = {}
    for (const [name, field] of Object.entries(formValues)) {
      if (field == null) continue
      if (
        field.value != null &&
        (field.value || field.required === false) &&
        field.type !== "checkbox"
      ) {
        addressValues[name.replace(prefix, "")] = field.value
      }
      if (field.type === "checkbox") {
        saveAddressToCustomerAddressBook?.({ type: resource, value: field.checked ?? false })
      }
    }

    // Supplement with non-required fields from the DOM that rapid-form doesn't track.
    // This preserves pre-filled optional fields (phone, line_2, state_code, etc.)
    // when the user edits a required field and the main effect fires.
    if (formRef.current) {
      for (const el of Array.from(formRef.current.elements)) {
        const inputEl = el as HTMLInputElement
        if (!inputEl.name?.startsWith(prefix) || inputEl.type === "checkbox") continue
        const fieldKey = inputEl.name.replace(prefix, "")
        if (fieldKey in addressValues) continue // rapid-form value takes precedence
        if (inputEl.value) {
          addressValues[fieldKey] = inputEl.value
        }
      }
    }

    setAddress({
      values: {
        ...addressValues,
        ...(isBusiness && { business: isBusiness }),
      } as TCustomerAddress,
      resource,
    })
  }, [
    formValues,
    shouldSync,
    isBusiness,
    customFieldMessageError,
    saveAddressToCustomerAddressBook,
    setAddress,
    setAddressErrors,
    resource,
    prefix,
    errorMode,
    hasValidated,
  ])

  useEffect(() => {
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(
      `[name="${checkboxFieldName}"]`
    )
    const checked = checkbox?.checked || getSaveToAddressBook()
    if (checked) {
      checkbox?.setAttribute("checked", "true")
      saveAddressToCustomerAddressBook?.({ type: resource, value: true })
    }
  }, [saveAddressToCustomerAddressBook, checkboxFieldName, getSaveToAddressBook, resource])

  useEffect(() => {
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(
      `[name="${checkboxFieldName}"]`
    )
    const checked = checkbox?.checked || getSaveToAddressBook()
    if (
      reset &&
      (Object.keys(formValues).length > 0 || Object.keys(errors).length > 0 || checked)
    ) {
      saveAddressToCustomerAddressBook?.({ type: resource, value: false })
      formRef.current?.reset()
      setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev))
      setAddressErrors([], resource)
      setAddress({ values: {} as TCustomerAddress, resource })
    }
  }, [
    reset,
    formValues,
    errors,
    saveAddressToCustomerAddressBook,
    setAddress,
    setAddressErrors,
    resource,
    checkboxFieldName,
    getSaveToAddressBook,
  ])

  const setValue = useCallback(
    (name: string, value: string | number | readonly string[]): void => {
      const input = getFormElement(formRef.current, name)
      if (input != null) {
        input.setCustomValidity("")
        input.value = String(value)
        // Dispatch 'input' (not 'change') so rapid-form captures the update.
        // This is required for AddressStateSelector to detect the country code
        // from billingAddress.values when a value is set programmatically.
        input.dispatchEvent(new Event("input", { bubbles: true }))
      }
      clearFieldError(name)
      // Build the complete address from ALL current form inputs so that multiple
      // setValue calls (e.g., pre-filling from an existing address) accumulate
      // values rather than each call replacing the entire address object.
      const allValues: Record<string, unknown> = {}
      if (formRef.current) {
        for (const el of Array.from(formRef.current.elements)) {
          const inputEl = el as HTMLInputElement
          if (!inputEl.name?.startsWith(prefix) || inputEl.type === "checkbox") continue
          if (inputEl.value) {
            allValues[inputEl.name.replace(prefix, "")] = inputEl.value
          }
        }
      }
      // Ensure the value just set is included (covers edge cases where the input
      // might not be found in form.elements, e.g., not yet mounted).
      allValues[name.replace(prefix, "")] = value
      setAddress({
        values: {
          ...allValues,
          ...(isBusiness && { business: isBusiness }),
        } as TCustomerAddress,
        resource,
      })
    },
    [isBusiness, clearFieldError, setAddress, resource, prefix]
  )

  const resetField = useCallback(
    (name: string): void => {
      const input = getFormElement(formRef.current, name)
      if (input != null) {
        input.setCustomValidity("")
        input.value = ""
        input.dispatchEvent(new Event("input", { bubbles: true }))
      }
      clearFieldError(name)
    },
    [clearFieldError]
  )

  // Validates all form fields and returns any errors found.
  // In submit mode, this must be called before saving to surface errors.
  // After the first call, hasValidated becomes true and errors update inline.
  const validate = useCallback((): FormErrors => {
    const form = formRef.current
    if (!form) return {}

    const newErrors: FormErrors = {}
    for (const el of Array.from(form.elements)) {
      const input = el as HTMLInputElement
      if (!input.name?.startsWith(prefix) || input.type === "checkbox") continue
      if (!input.checkValidity()) {
        newErrors[input.name] = {
          code: "VALIDATION_ERROR",
          message: input.validationMessage,
          error: true,
        }
      }
    }

    setHasValidated(true)
    setErrors(newErrors)
    return newErrors
  }, [prefix])

  return { formValues, errors, formRef, setFormRef, setValue, resetField, validate }
}

import { useRapidForm } from "rapid-form"
import { useCallback, useEffect, useRef, useState } from "react"
import type { AddressResource } from "#reducers/AddressReducer"
import type { CustomFieldMessageError } from "#reducers/AddressReducer"
import { setAddress as setAddressAction, setAddressErrors as setAddressErrorsAction } from "#reducers/AddressReducer"
import type { AddResourceToInclude, ResourceIncluded, SaveAddressToCustomerAddressBook } from "#reducers/OrderReducer"
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
  setAddressErrors: (errors: BaseError[], resource: Parameters<typeof setAddressErrorsAction>[0]["resource"]) => void
  include?: ResourceIncluded[]
  addResourceToInclude: (params: AddResourceToInclude) => void
  includeLoaded?: Partial<Record<ResourceIncluded, boolean>>
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
}: UseAddressFormFieldsParams) {
  const { refValidation, values } = useRapidForm()
  const formValues = values as Record<string, FormValue>
  const [errors, setErrors] = useState<FormErrors>({})
  const formRef = useRef<HTMLFormElement | null>(null)
  const prefix = `${resource}_`
  const checkboxFieldName = `${resource}_save_to_customer_book`

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
      addResourceToInclude({ newResourceLoaded: { [resource]: true } as Partial<Record<ResourceIncluded, boolean>> })
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

    setErrors(finalErrors)

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
  ])

  useEffect(() => {
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(`[name="${checkboxFieldName}"]`)
    const checked = checkbox?.checked || getSaveToAddressBook()
    if (checked) {
      checkbox?.setAttribute("checked", "true")
      saveAddressToCustomerAddressBook?.({ type: resource, value: true })
    }
  }, [saveAddressToCustomerAddressBook, checkboxFieldName, getSaveToAddressBook, resource])

  useEffect(() => {
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(`[name="${checkboxFieldName}"]`)
    const checked = checkbox?.checked || getSaveToAddressBook()
    if (reset && (Object.keys(formValues).length > 0 || Object.keys(errors).length > 0 || checked)) {
      saveAddressToCustomerAddressBook?.({ type: resource, value: false })
      formRef.current?.reset()
      setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev))
      setAddressErrors([], resource)
      setAddress({ values: {} as TCustomerAddress, resource })
    }
  }, [reset, formValues, errors, saveAddressToCustomerAddressBook, setAddress, setAddressErrors, resource, checkboxFieldName, getSaveToAddressBook])

  const setValue = useCallback(
    (name: string, value: string | number | readonly string[]): void => {
      const input = getFormElement(formRef.current, name)
      if (input != null) {
        input.setCustomValidity("")
        input.value = String(value)
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }
      clearFieldError(name)
      setAddress({
        values: {
          [name.replace(prefix, "")]: value,
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
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }
      clearFieldError(name)
    },
    [clearFieldError]
  )

  return { formValues, errors, formRef, setFormRef, setValue, resetField }
}

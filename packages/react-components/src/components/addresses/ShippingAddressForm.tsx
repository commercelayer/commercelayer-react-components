import AddressesContext from '#context/AddressContext'
import { useRapidForm } from 'rapid-form'
import { type ReactNode, useContext, useEffect, useRef, type JSX } from 'react';
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import type { BaseError, CodeErrorType } from '#typings/errors'
import OrderContext from '#context/OrderContext'
import { getSaveShippingAddressToAddressBook } from '#utils/localStorage'
import type { AddressValuesKeys } from '#context/BillingAddressFormContext'
import type { CustomFieldMessageError } from '#reducers/AddressReducer'

interface Props extends Omit<JSX.IntrinsicElements['form'], 'onSubmit'> {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
  fieldEvent?: 'blur' | 'change'
  /**
   * Callback to customize the error message for a specific field. Called for each error in the form.
   */
  customFieldMessageError?: CustomFieldMessageError
}

/**
 * Form container for creating or editing an order related shipping address.
 *
 * It accept:
 * - a `reset` prop to define if current form needs to be reset over a defined boolean condition.
 * - a `errorClassName` prop to define children input and select classnames assigned in case of validation error.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<AddressesContainer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<AddressInput>`,
 * `<AddressCountrySelector>`,
 * `<AddressStateSelector>`,
 * `<SaveAddressesButton>`
 * </span>
 */
export function ShippingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = 'on',
    fieldEvent = 'change',
    reset = false,
    customFieldMessageError,
    ...p
  } = props
  const {
    validation,
    values,
    errors,
    reset: resetForm,
    setValue: setValueForm,
    setError: setErrorForm
  } = useRapidForm({ fieldEvent })
  const {
    setAddressErrors,
    setAddress,
    shipToDifferentAddress,
    isBusiness,
    invertAddresses
  } = useContext(AddressesContext)
  const {
    saveAddressToCustomerAddressBook,
    include,
    addResourceToInclude,
    includeLoaded
  } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!include?.includes('shipping_address')) {
      addResourceToInclude({
        newResource: 'shipping_address'
      })
    } else if (!includeLoaded?.shipping_address) {
      addResourceToInclude({
        newResourceLoaded: { shipping_address: true }
      })
    }
    if (customFieldMessageError != null && Object.keys(values).length > 0) {
      for (const name in values) {
        if (Object.prototype.hasOwnProperty.call(values, name)) {
          const field = values[name]
          const fieldName = field.name
          const value = field.value
          const inError = errors[fieldName] != null
          if (
            customFieldMessageError != null &&
            fieldName != null &&
            value != null
          ) {
            values[fieldName.replace('shipping_address_', '')] = value
            const customMessage = customFieldMessageError({
              field: fieldName,
              value,
              values
            })
            if (customMessage != null) {
              if (typeof customMessage === 'string') {
                if (inError) {
                  const errorMsg = errors[fieldName]?.message
                  if (errorMsg != null && errorMsg !== customMessage) {
                    // @ts-expect-error no type
                    errors[fieldName].message = customMessage
                  }
                } else {
                  setErrorForm({
                    name: fieldName,
                    code: 'VALIDATION_ERROR',
                    message: customMessage
                  })
                }
              } else {
                const elements = customMessage
                elements.forEach((element) => {
                  const { field, value, isValid, message } = element
                  const fieldInError = errors[field] != null
                  if (!isValid) {
                    if (fieldInError) {
                      const errorMsg = errors[field]?.message
                      if (errorMsg != null && errorMsg !== message) {
                        // @ts-expect-error no type
                        errors[field].message = message
                        setValueForm(field, value ?? '')
                      }
                    } else {
                      setErrorForm({
                        name: field,
                        code: 'VALIDATION_ERROR',
                        message: message
                      })
                    }
                  } else {
                    if (fieldInError) {
                      delete errors[field]
                      setValueForm(field, value ?? '')
                    }
                  }
                })
              }
            }
          }
        }
      }
    }
    if (errors != null && Object.keys(errors).length > 0) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const code = errors[fieldName]?.code
        const message = errors[fieldName]?.message
        formErrors.push({
          code: code as CodeErrorType,
          message: message ?? '',
          resource: 'shipping_address',
          field: fieldName
        })
      }
      if (shipToDifferentAddress || invertAddresses) {
        setAddressErrors(formErrors, 'shipping_address')
      }
    } else if (
      values &&
      Object.keys(values).length > 0 &&
      (shipToDifferentAddress || invertAddresses)
    ) {
      setAddressErrors([], 'shipping_address')
      for (const name in values) {
        const field = values[name]
        if (
          field?.value ||
          (field?.required === false && field?.type !== 'checkbox')
        ) {
          values[name.replace('shipping_address_', '')] = field.value
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerAddressBook({
            type: 'shipping_address',
            value: field.checked
          })
        }
      }
      setAddress({
        // @ts-expect-error no type
        values: {
          ...values,
          ...(isBusiness && { business: isBusiness })
        },
        resource: 'shipping_address'
      })
    }
    const checkboxChecked =
      ref.current?.querySelector(
        '[name="shipping_address_save_to_customer_book"]'
        // @ts-expect-error no type
      )?.checked || getSaveShippingAddressToAddressBook()
    if (
      reset &&
      ((values != null && Object.keys(values).length > 0) ||
        (errors != null && Object.keys(errors).length > 0) ||
        checkboxChecked)
    ) {
      if (saveAddressToCustomerAddressBook) {
        saveAddressToCustomerAddressBook({
          type: 'shipping_address',
          value: false
        })
      }
      if (ref) {
        ref.current?.reset()
        // @ts-expect-error no type
        resetForm({ target: ref.current })
        setAddressErrors([], 'shipping_address')
        // @ts-expect-error no type
        setAddress({ values: {}, resource: 'shipping_address' })
      }
    }
  }, [
    values,
    errors,
    shipToDifferentAddress,
    reset,
    include,
    includeLoaded,
    isBusiness
  ])
  const setValue = (
    name: AddressValuesKeys,
    value: string | number | readonly string[]
  ): void => {
    setValueForm(name, value as string)
    const field: any = {
      [name.replace('shipping_address_', '')]: value
    }
    setAddress({
      values: {
        ...values,
        ...field,
        ...(isBusiness && { business: isBusiness })
      },
      resource: 'shipping_address'
    })
  }
  const providerValues = {
    values,
    validation,
    setValue,
    errorClassName,
    errors: errors as any,
    resetField: (name: string) => {
      // @ts-expect-error no type
      resetForm({ currentTarget: ref.current }, name)
    }
  } as any
  return (
    <ShippingAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressFormContext.Provider>
  )
}

export default ShippingAddressForm

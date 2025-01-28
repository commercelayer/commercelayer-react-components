import AddressesContext from '#context/AddressContext'
import { useRapidForm } from 'rapid-form'
import { type ReactNode, useContext, useEffect, useRef, type JSX } from 'react';
import BillingAddressFormContext, {
  type AddressValuesKeys,
  type DefaultContextAddress
} from '#context/BillingAddressFormContext'
import type { BaseError, CodeErrorType } from '#typings/errors'
import OrderContext from '#context/OrderContext'
import { getSaveBillingAddressToAddressBook } from '#utils/localStorage'
import type { CustomFieldMessageError } from '#reducers/AddressReducer'

type Props = {
  children: ReactNode
  /**
   * Define if current form needs to be reset over a defined boolean condition
   */
  reset?: boolean
  /**
   * Define children input and select classnames assigned in case of validation error.
   */
  errorClassName?: string
  fieldEvent?: 'blur' | 'change'
  /**
   * Callback to customize the error message for a specific field. Called for each error in the form.
   */
  customFieldMessageError?: CustomFieldMessageError
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

/**
 * Form container for creating or editing an order related billing address or a customer address, depending on the context in use.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<AddressesContainer>` component.
 * Can optionally be a child of the `<OrderContainer>` component, when it needs to be used in the checkout process and store the billing address in the order object.
 * </span>
 * <span title='Children' type='info'>
 * `<AddressInput>`,
 * `<AddressCountrySelector>`,
 * `<AddressStateSelector>`,
 * `<SaveAddressesButton>`
 * </span>
 */
export function BillingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = 'on',
    reset = false,
    customFieldMessageError,
    fieldEvent = 'change',
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
  const { setAddressErrors, setAddress, isBusiness } =
    useContext(AddressesContext)
  const {
    saveAddressToCustomerAddressBook,
    order,
    include,
    addResourceToInclude,
    includeLoaded
  } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement | null>(null)
  useEffect(() => {
    if (!include?.includes('billing_address')) {
      addResourceToInclude({
        newResource: 'billing_address'
      })
    } else if (!includeLoaded?.billing_address) {
      addResourceToInclude({
        newResourceLoaded: { billing_address: true }
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
                        message
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
          resource: 'billing_address',
          field: fieldName
        })
      }
      setAddressErrors(formErrors, 'billing_address')
    } else if (values && Object.keys(values).length > 0) {
      setAddressErrors([], 'billing_address')
      for (const name in values) {
        const field = values[name]
        if (
          field?.value ||
          (field?.required === false && field?.type !== 'checkbox')
        ) {
          values[name.replace('billing_address_', '')] = field.value
          
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          
          delete values[name]
          saveAddressToCustomerAddressBook({
            type: 'billing_address',
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
        resource: 'billing_address'
      })
    }
    const checkboxChecked =
      ref.current?.querySelector(
        '[name="billing_address_save_to_customer_book"]'
        // @ts-expect-error no type no types
      )?.checked || getSaveBillingAddressToAddressBook()
    if (
      reset &&
      ((values != null && Object.keys(values).length > 0) ||
        (errors != null && Object.keys(errors).length > 0) ||
        checkboxChecked)
    ) {
      if (saveAddressToCustomerAddressBook) {
        saveAddressToCustomerAddressBook({
          type: 'billing_address',
          value: false
        })
      }
      if (ref) {
        ref.current?.reset()
        // @ts-expect-error no type
        resetForm({ target: ref.current })
        setAddressErrors([], 'billing_address')
        // @ts-expect-error no type
        setAddress({ values: {}, resource: 'billing_address' })
      }
    }
  }, [errors, values, reset, include, includeLoaded, isBusiness])
  const setValue = (
    name: AddressValuesKeys,
    value: string | number | readonly string[]
  ): void => {
    setValueForm(name, value as string)
    const field: any = {
      [name.replace('billing_address_', '')]: value
    }
    setAddress({
      values: {
        ...values,
        ...field,
        ...(isBusiness && { business: isBusiness })
      },
      resource: 'billing_address'
    })
  }
  const providerValues = {
    isBusiness,
    values: values as DefaultContextAddress['values'],
    validation,
    setValue,
    errorClassName,
    requiresBillingInfo: order?.requires_billing_info || false,
    errors: errors as any,
    resetField: (name: string) => {
      // @ts-expect-error no type
      resetForm({ currentTarget: ref.current }, name)
    }
  }
  return (
    <BillingAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressFormContext.Provider>
  )
}

export default BillingAddressForm

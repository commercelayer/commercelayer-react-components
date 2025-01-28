import AddressesContext from '#context/AddressContext'
import { useRapidForm } from 'rapid-form'
import { type ReactNode, useContext, useEffect, useRef, type JSX } from 'react';
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'
import type { BaseError, CodeErrorType } from '#typings/errors'
import type { AddressField } from '#reducers/AddressReducer'
import type { AddressCountrySelectName, AddressInputName } from '#typings'
import OrderContext from '#context/OrderContext'
import { isEmptyStates } from '#utils/countryStateCity'
import type { TCustomerAddress } from '#reducers/CustomerReducer'

interface Props extends Omit<JSX.IntrinsicElements['form'], 'onSubmit'> {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
  /**
   * Array of countries that have states has select options. Ignore this if you are not overriding the default states list.
   * If you are overriding the default states list, you must pass the countries that have states as select options.
   */
  countriesWithPredefinedStateOptions?: string[]
}

export function CustomerAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = 'on',
    reset = false,
    countriesWithPredefinedStateOptions,
    ...p
  } = props
  const { validation, values, errors, reset: resetForm } = useRapidForm()
  const { setAddressErrors, setAddress } = useContext(AddressesContext)
  const { order } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement | null>(null)
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const code = errors[fieldName]?.code
        const message = errors[fieldName]?.message || ''
        if (fieldName === 'billing_address_state_code') {
          if (values['state_code']) {
            
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message,
              resource: 'billing_address',
              field: fieldName
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message,
            resource: 'billing_address',
            field: fieldName
          })
        }
      }
      setAddressErrors(formErrors, 'billing_address')
    } else if (Object.keys(values).length > 0) {
      setAddressErrors([], 'billing_address')
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('billing_address_', '')] = field.value
          
          delete values[name]
        }
        if (['billing_address_state_code'].includes(name)) {
          const countryCode = (values['billing_address_country_code']?.value ||
            values['country_code']) as string
          if (
            !isEmptyStates({
              countryCode,
              countriesWithPredefinedStateOptions
            }) &&
            !field.value
          ) {
            
            delete values['billing_address_state_code']
          }
        }
      }
      setAddress({
        values: values as TCustomerAddress,
        resource: 'billing_address'
      })
    }
    if (
      reset &&
      (Object.keys(values).length > 0 || Object.keys(errors).length > 0)
    ) {
      if (ref) {
        ref.current?.reset()
        // @ts-expect-error no type
        resetForm({ target: ref.current })
        setAddressErrors([], 'billing_address')
        // @ts-expect-error Check this type
        setAddress({ values: {}, resource: 'billing_address' })
      }
    }
  }, [errors, values, reset])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ): void => {
    const field = {
      [name.replace('billing_address_', '')]: value
    }
    setAddress({
      values: { ...(values as TCustomerAddress), ...field },
      resource: 'billing_address'
    })
  }
  const providerValues = {
    values,
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
    <CustomerAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </CustomerAddressFormContext.Provider>
  )
}

export default CustomerAddressForm

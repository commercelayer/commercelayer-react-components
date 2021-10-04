import AddressesContext from '#context/AddressContext'
import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'
import { isEmpty } from 'lodash'
import { BaseError, CodeErrorType } from '#typings/errors'
import { AddressField } from '#reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '#typings'
import components from '#config/components'
import OrderContext from '#context/OrderContext'
import OrderStorageContext from '#context/OrderStorageContext'
import isEmptyStates from '#utils/isEmptyStates'

const propTypes = components.CustomerAddressForm.propTypes

type CustomerAddressFormProps = {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const CustomerAddressForm: FunctionComponent<CustomerAddressFormProps> = (
  props
) => {
  const {
    children,
    errorClassName,
    autoComplete = 'on',
    reset = false,
    ...p
  } = props
  const { validation, values, errors, reset: resetForm } = useRapidForm()
  const { setAddressErrors, setAddress } = useContext(AddressesContext)
  const { saveAddressToCustomerAddressBook, order } = useContext(OrderContext)
  const { setLocalOrder } = useContext(OrderStorageContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const { code, message } = errors[fieldName]
        if (['customer_address_state_code'].includes(fieldName)) {
          const countryCode =
            values['customer_address_country_code']?.value ||
            values['country_code']
          if (isEmptyStates(countryCode)) {
            const k = formErrors.findIndex(({ field }) => field === fieldName)
            k !== -1 && formErrors.splice(k, 0)
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message,
              resource: 'customerAddress',
              field: fieldName,
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message,
            resource: 'customerAddress',
            field: fieldName,
          })
        }
      }
      setAddressErrors(formErrors, 'customerAddress')
    } else if (!isEmpty(values)) {
      setAddressErrors([], 'customerAddress')
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('customer_address_', '')] = field.value
          delete values[name]
        }
        if (['customer_address_state_code'].includes(name)) {
          const countryCode =
            values['customer_address_country_code']?.value ||
            values['country_code']
          if (!isEmptyStates(countryCode) && !field.value) {
            delete values['customer_address_state_code']
          }
        }
      }
      setAddress({ values, resource: 'customerAddress' })
    }
    if (reset && (!isEmpty(values) || !isEmpty(errors))) {
      saveAddressToCustomerAddressBook &&
        saveAddressToCustomerAddressBook('BillingAddress', false)
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([], 'customerAddress')
        setAddress({ values: {}, resource: 'customerAddress' })
      }
    }
  }, [errors, values, reset])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => {
    const field: any = {
      [name.replace('customer_address_', '')]: value,
    }
    setAddress({ values: { ...values, ...field }, resource: 'customerAddress' })
  }
  const providerValues = {
    values,
    validation,
    setValue,
    errorClassName,
    // @ts-ignore
    requiresBillingInfo: order?.requiresBillingInfo || false,
    errors: errors as any,
    resetField: (name: string) =>
      resetForm({ currentTarget: ref.current } as any, name),
  }
  return (
    <CustomerAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </CustomerAddressFormContext.Provider>
  )
}

CustomerAddressForm.propTypes = propTypes

export default CustomerAddressForm

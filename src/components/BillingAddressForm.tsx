import AddressesContext from '#context/AddressContext'
import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import { isEmpty } from 'lodash'
import { BaseError, CodeErrorType } from '#typings/errors'
import { AddressField } from '#reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '#typings'
import components from '#config/components'
import OrderContext from '#context/OrderContext'
import OrderStorageContext from '#context/OrderStorageContext'

const propTypes = components.BillingAddressForm.propTypes

type BillingAddressFormProps = {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const BillingAddressForm: FunctionComponent<BillingAddressFormProps> = (
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
        if (['billing_address_state_code'].includes(fieldName)) {
          if (isEmpty(values['state_code'])) {
            // const k = formErrors.findIndex(({ field }) => field === fieldName)
            // k !== -1 && formErrors.splice(k, 0)
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message,
              resource: 'billingAddress',
              field: fieldName,
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message,
            resource: 'billingAddress',
            field: fieldName,
          })
        }
      }
      setAddressErrors(formErrors, 'billingAddress')
    } else if (!isEmpty(values)) {
      setAddressErrors([], 'billingAddress')
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('billing_address_', '')] = field.value
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerAddressBook('BillingAddress', field.checked)
          setLocalOrder(
            'saveBillingAddressToCustomerAddressBook',
            field.checked
          )
        }
      }
      setAddress({ values, resource: 'billingAddress' })
    }
    if (reset && (!isEmpty(values) || !isEmpty(errors))) {
      saveAddressToCustomerAddressBook &&
        saveAddressToCustomerAddressBook('BillingAddress', false)
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([], 'billingAddress')
        setAddress({ values: {}, resource: 'billingAddress' })
      }
    }
  }, [errors, values, reset])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => {
    const field: any = {
      [name.replace('billing_address_', '')]: value,
    }
    setAddress({ values: { ...values, ...field }, resource: 'billingAddress' })
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
    <BillingAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressFormContext.Provider>
  )
}

BillingAddressForm.propTypes = propTypes

export default BillingAddressForm

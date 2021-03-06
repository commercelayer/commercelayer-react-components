import AddressesContext from '#context/AddressContext'
import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import { isEmpty } from 'lodash'
import { BaseError, CodeErrorType } from '#typings/errors'
import { AddressField } from '#reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '#typings'
import components from '#config/components'
import OrderContext from '#context/OrderContext'
import OrderStorageContext from '#context/OrderStorageContext'

const propTypes = components.ShippingAddressForm.propTypes

type ShippingAddressFormProps = {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const ShippingAddressForm: FunctionComponent<ShippingAddressFormProps> = (
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
  const { setAddressErrors, setAddress, shipToDifferentAddress } = useContext(
    AddressesContext
  )
  const { saveAddressToCustomerAddressBook } = useContext(OrderContext)
  const { setLocalOrder } = useContext(OrderStorageContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const { code, message } = errors[fieldName]
        formErrors.push({
          code: code as CodeErrorType,
          message,
          resource: 'shippingAddress',
          field: fieldName,
        })
      }
      !isEmpty(formErrors) &&
        shipToDifferentAddress &&
        setAddressErrors(formErrors)
    } else if (!isEmpty(values) && shipToDifferentAddress) {
      setAddressErrors([])
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('shipping_address_', '')] = field.value
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerAddressBook('ShippingAddress', field.checked)
          setLocalOrder(
            'saveShippingAddressToCustomerAddressBook',
            field.checked
          )
        }
      }
      setAddress({ values, resource: 'shippingAddress' })
    }
    if (reset && (!isEmpty(values) || !isEmpty(errors))) {
      saveAddressToCustomerAddressBook &&
        saveAddressToCustomerAddressBook('ShippingAddress', false)
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([])
        setAddress({ values: {}, resource: 'shippingAddress' })
      }
    }
  }, [values, errors, shipToDifferentAddress, reset])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => {
    const field: any = {
      [name.replace('shipping_address_', '')]: value,
    }
    setAddress({ values: { ...values, ...field }, resource: 'shippingAddress' })
  }
  return (
    <ShippingAddressFormContext.Provider
      value={{ validation, setValue, errorClassName, errors: errors as any }}
    >
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressFormContext.Provider>
  )
}

ShippingAddressForm.propTypes = propTypes

export default ShippingAddressForm

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
import _ from 'lodash'
import { BaseError, CodeErrorType } from '#typings/errors'
import { AddressField } from '#reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '#typings'
import components from '#config/components'
import OrderContext from '#context/OrderContext'

const propTypes = components.ShippingAddressForm.propTypes

type ShippingAddressFormProps = {
  children: ReactNode
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const ShippingAddressForm: FunctionComponent<ShippingAddressFormProps> = (
  props
) => {
  const { children, autoComplete = 'on', ...p } = props
  const { validation, values, errors } = useRapidForm()
  const { setAddressErrors, setAddress, shipToDifferentAddress } = useContext(
    AddressesContext
  )
  const { saveAddressToCustomerBook } = useContext(OrderContext)
  const ref = useRef(null)
  useEffect(() => {
    if (!_.isEmpty(errors)) {
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
      !_.isEmpty(formErrors) &&
        shipToDifferentAddress &&
        setAddressErrors(formErrors)
    } else if (!_.isEmpty(values) && shipToDifferentAddress) {
      setAddressErrors([])
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('shipping_address_', '')] = field.value
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerBook('ShippingAddress', field.checked)
        }
      }
      setAddress({ values, resource: 'shippingAddress' })
    }
    if (!shipToDifferentAddress) {
      saveAddressToCustomerBook &&
        saveAddressToCustomerBook('ShippingAddress', false)
      if (ref) {
        // @ts-ignore
        ref.current?.reset()
        setAddressErrors([])
        setAddress({ values: {}, resource: 'shippingAddress' })
      }
    }
  }, [values, errors, shipToDifferentAddress])
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
    <ShippingAddressFormContext.Provider value={{ validation, setValue }}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressFormContext.Provider>
  )
}

ShippingAddressForm.propTypes = propTypes

export default ShippingAddressForm

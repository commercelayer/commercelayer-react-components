import AddressesContext from '@context/AddressContext'
import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
} from 'react'
import ShippingAddressContext from '@context/ShippingAddressContext'
import _ from 'lodash'
import { BaseError, CodeErrorType } from '@typings/errors'
import { AddressField } from '@reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '@typings'
import components from '@config/components'

const propTypes = components.ShippingAddress.propTypes

type ShippingAddressProps = {
  children: ReactNode
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const ShippingAddress: FunctionComponent<ShippingAddressProps> = (props) => {
  const { children, autoComplete = 'on', ...p } = props
  const { validation, values, errors } = useRapidForm()
  const { setAddressErrors, setAddress, shipToDifferentAddress } = useContext(
    AddressesContext
  )
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
      !_.isEmpty(formErrors) && setAddressErrors(formErrors)
    } else if (!_.isEmpty(values) && shipToDifferentAddress) {
      setAddressErrors([])
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('shipping_address_', '')] = field.value
          delete values[name]
        }
      }
      setAddress({ values, resource: 'shippingAddress' })
    }
  }, [values, errors])
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
    <ShippingAddressContext.Provider value={{ validation, setValue }}>
      <form autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressContext.Provider>
  )
}

ShippingAddress.propTypes = propTypes

export default ShippingAddress

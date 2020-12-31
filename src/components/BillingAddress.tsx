import AddressesContext from '@context/AddressContext'
import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
} from 'react'
import BillingAddressContext from '@context/BillingAddressContext'
import _ from 'lodash'
import { BaseError, CodeErrorType } from '@typings/errors'
import { AddressField } from '@reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '@typings'

type BillingAddressProps = {
  children: ReactNode
  autoComplete?: 'on' | 'off'
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const BillingAddress: FunctionComponent<BillingAddressProps> = (props) => {
  const { children, autoComplete = 'on', ...p } = props
  const { validation, values, errors } = useRapidForm()
  const { setAddressErrors, setAddress } = useContext(AddressesContext)
  useEffect(() => {
    if (!_.isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const { code, message } = errors[fieldName]
        formErrors.push({
          code: code as CodeErrorType,
          message,
          resource: 'billingAddress',
          field: fieldName,
        })
      }
      !_.isEmpty(formErrors) && setAddressErrors(formErrors)
    } else if (!_.isEmpty(values)) {
      setAddressErrors([])
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('billing_address_', '')] = field.value
          delete values[name]
        }
      }
      setAddress({ values, resource: 'billingAddress' })
    }
  }, [errors, values])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => {
    const field: any = {
      [name.replace('billing_address_', '')]: value,
    }
    setAddress({ values: { ...values, ...field }, resource: 'billingAddress' })
  }
  return (
    <BillingAddressContext.Provider value={{ validation, setValue }}>
      <form autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressContext.Provider>
  )
}

export default BillingAddress

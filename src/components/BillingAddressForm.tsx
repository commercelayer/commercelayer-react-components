import AddressesContext from '@context/AddressContext'
import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
} from 'react'
import BillingAddressFormContext from '@context/BillingAddressFormContext'
import _ from 'lodash'
import { BaseError, CodeErrorType } from '@typings/errors'
import { AddressField } from '@reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from '@typings'
import components from '@config/components'
import OrderContext from '@context/OrderContext'

const propTypes = components.BillingAddressForm.propTypes

type BillingAddressFormProps = {
  children: ReactNode
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const BillingAddressForm: FunctionComponent<BillingAddressFormProps> = (
  props
) => {
  const { children, autoComplete = 'on', ...p } = props
  const { validation, values, errors } = useRapidForm()
  const { setAddressErrors, setAddress } = useContext(AddressesContext)
  const { saveAddressToCustomerBook } = useContext(OrderContext)
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
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerBook('BillingAddress', field.checked)
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
    <BillingAddressFormContext.Provider value={{ validation, setValue }}>
      <form autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressFormContext.Provider>
  )
}

BillingAddressForm.propTypes = propTypes

export default BillingAddressForm

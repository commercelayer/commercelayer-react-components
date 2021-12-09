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
import { Address } from '@commercelayer/sdk'
import { getSaveShippingAddressToAddressBook } from '#utils/localStorage'

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
  const { setAddressErrors, setAddress, shipToDifferentAddress } =
    useContext(AddressesContext)
  const {
    saveAddressToCustomerAddressBook,
    include,
    addResourceToInclude,
    includeLoaded,
  } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!include?.includes('shipping_address')) {
      addResourceToInclude({
        newResource: 'shipping_address',
      })
    } else if (!includeLoaded?.['shipping_address']) {
      addResourceToInclude({
        newResourceLoaded: { shipping_address: true },
      })
    }
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const { code, message } = errors[fieldName]
        if (['shipping_address_state_code'].includes(fieldName)) {
          if (isEmpty(values['state_code'])) {
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message,
              resource: 'shipping_address',
              field: fieldName,
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message,
            resource: 'shipping_address',
            field: fieldName,
          })
        }
      }
      shipToDifferentAddress && setAddressErrors(formErrors, 'shipping_address')
    } else if (!isEmpty(values) && shipToDifferentAddress) {
      setAddressErrors([], 'shipping_address')
      for (const name in values) {
        const field = values[name]
        if (field?.value) {
          values[name.replace('shipping_address_', '')] = field.value
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerAddressBook({
            type: 'shipping_address',
            value: field.checked,
          })
        }
      }
      setAddress({ values: values as Address, resource: 'shipping_address' })
    }
    const checkboxChecked =
      ref.current?.querySelector(
        '[name="shipping_address_save_to_customer_book"]'
        // @ts-ignore
      )?.checked || getSaveShippingAddressToAddressBook()
    if (reset && (!isEmpty(values) || !isEmpty(errors) || checkboxChecked)) {
      saveAddressToCustomerAddressBook &&
        saveAddressToCustomerAddressBook({
          type: 'shipping_address',
          value: false,
        })
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([], 'shipping_address')
        setAddress({ values: {} as Address, resource: 'shipping_address' })
      }
    }
  }, [values, errors, shipToDifferentAddress, reset, include, includeLoaded])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => {
    const field: any = {
      [name.replace('shipping_address_', '')]: value,
    }
    setAddress({
      values: { ...values, ...field },
      resource: 'shipping_address',
    })
  }
  const providerValues = {
    values,
    validation,
    setValue,
    errorClassName,
    errors: errors as any,
    resetField: (name: string) =>
      resetForm({ currentTarget: ref.current } as any, name),
  }
  return (
    <ShippingAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressFormContext.Provider>
  )
}

ShippingAddressForm.propTypes = propTypes

export default ShippingAddressForm

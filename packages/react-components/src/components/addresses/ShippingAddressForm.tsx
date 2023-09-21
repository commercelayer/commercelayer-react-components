import AddressesContext from '#context/AddressContext'
import { useRapidForm } from 'rapid-form'
import { type ReactNode, useContext, useEffect, useRef } from 'react'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { type BaseError, type CodeErrorType } from '#typings/errors'
import OrderContext from '#context/OrderContext'
import { getSaveShippingAddressToAddressBook } from '#utils/localStorage'

interface Props extends Omit<JSX.IntrinsicElements['form'], 'onSubmit'> {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
}

export function ShippingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = 'on',
    reset = false,
    ...p
  } = props
  const { validation, values, errors, reset: resetForm } = useRapidForm()
  const { setAddressErrors, setAddress, shipToDifferentAddress, isBusiness } =
    useContext(AddressesContext)
  const {
    saveAddressToCustomerAddressBook,
    include,
    addResourceToInclude,
    includeLoaded
  } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!include?.includes('shipping_address')) {
      addResourceToInclude({
        newResource: 'shipping_address'
      })
    } else if (!includeLoaded?.shipping_address) {
      addResourceToInclude({
        newResourceLoaded: { shipping_address: true }
      })
    }
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const code = errors[fieldName]?.code
        const message = errors[fieldName]?.message
        if (['shipping_address_state_code'].includes(fieldName)) {
          if (isEmpty(values['state_code'])) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message: message || '',
              resource: 'shipping_address',
              field: fieldName
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message: message || '',
            resource: 'shipping_address',
            field: fieldName
          })
        }
      }
      shipToDifferentAddress && setAddressErrors(formErrors, 'shipping_address')
    } else if (!isEmpty(values) && shipToDifferentAddress) {
      setAddressErrors([], 'shipping_address')
      for (const name in values) {
        const field = values[name]
        if (
          field?.value ||
          (field?.required === false && field?.type !== 'checkbox')
        ) {
          values[name.replace('shipping_address_', '')] = field.value
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete values[name]
          saveAddressToCustomerAddressBook({
            type: 'shipping_address',
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
        resource: 'shipping_address'
      })
    }
    const checkboxChecked =
      ref.current?.querySelector(
        '[name="shipping_address_save_to_customer_book"]'
        // @ts-expect-error no type
      )?.checked || getSaveShippingAddressToAddressBook()
    if (reset && (!isEmpty(values) || !isEmpty(errors) || checkboxChecked)) {
      if (saveAddressToCustomerAddressBook) {
        saveAddressToCustomerAddressBook({
          type: 'shipping_address',
          value: false
        })
      }
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([], 'shipping_address')
        // @ts-expect-error no type
        setAddress({ values: {}, resource: 'shipping_address' })
      }
    }
  }, [
    values,
    errors,
    shipToDifferentAddress,
    reset,
    include,
    includeLoaded,
    isBusiness
  ])
  const setValue = (name: any, value: any): void => {
    const field: any = {
      [name.replace('shipping_address_', '')]: value
    }
    setAddress({
      values: {
        ...values,
        ...field,
        ...(isBusiness && { business: isBusiness })
      },
      resource: 'shipping_address'
    })
  }
  const providerValues = {
    values,
    validation,
    setValue,
    errorClassName,
    errors: errors as any,
    resetField: (name: string) => {
      resetForm({ currentTarget: ref.current } as any, name)
    }
  } as any
  return (
    <ShippingAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressFormContext.Provider>
  )
}

export default ShippingAddressForm

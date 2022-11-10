import AddressesContext from '#context/AddressContext'
import { useRapidForm } from 'rapid-form'
import { ReactNode, useContext, useEffect, useRef } from 'react'
import BillingAddressFormContext, {
  AddressValuesKeys,
  DefaultContextAddress
} from '#context/BillingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { BaseError, CodeErrorType } from '#typings/errors'
import type { AddressInputName } from '#typings'
import OrderContext from '#context/OrderContext'
import { getSaveBillingAddressToAddressBook } from '#utils/localStorage'
import { businessMandatoryField } from '#utils/validateFormFields'

type Props = {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

export function BillingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = 'on',
    reset = false,
    ...p
  } = props
  const { validation, values, errors, reset: resetForm } = useRapidForm()
  const { setAddressErrors, setAddress, isBusiness } =
    useContext(AddressesContext)
  const {
    saveAddressToCustomerAddressBook,
    order,
    include,
    addResourceToInclude,
    includeLoaded
  } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement | null>(null)
  useEffect(() => {
    if (!include?.includes('billing_address')) {
      addResourceToInclude({
        newResource: 'billing_address'
      })
    } else if (!includeLoaded?.billing_address) {
      addResourceToInclude({
        newResourceLoaded: { billing_address: true }
      })
    }
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const code = errors[fieldName]?.code
        const message = errors[fieldName]?.message
        if (['billing_address_state_code'].includes(fieldName)) {
          if (!values?.['state_code']) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message: message || '',
              resource: 'billing_address',
              field: fieldName
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message: message || '',
            resource: 'billing_address',
            field: fieldName
          })
        }
      }
      setAddressErrors(formErrors, 'billing_address')
    } else if (values && Object.keys(values).length > 0) {
      setAddressErrors([], 'billing_address')
      for (const name in values) {
        const field = values[name]
        const mandatory = businessMandatoryField(
          name as AddressInputName,
          isBusiness
        )
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (!mandatory) delete values[name]
        if (
          field?.value ||
          (field?.required === false && field?.type !== 'checkbox')
        ) {
          values[name.replace('billing_address_', '')] = field.value
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete values[name]
          saveAddressToCustomerAddressBook({
            type: 'billing_address',
            value: field.checked
          })
        }
      }
      setAddress({
        values: {
          ...values,
          ...(isBusiness && { business: isBusiness })
        },
        resource: 'billing_address'
      })
    }
    const checkboxChecked =
      ref.current?.querySelector(
        '[name="billing_address_save_to_customer_book"]'
        // @ts-expect-error
      )?.checked || getSaveBillingAddressToAddressBook()
    if (reset && (!isEmpty(values) || !isEmpty(errors) || checkboxChecked)) {
      if (saveAddressToCustomerAddressBook) {
        saveAddressToCustomerAddressBook({
          type: 'billing_address',
          value: false
        })
      }
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([], 'billing_address')
        setAddress({ values: {}, resource: 'billing_address' })
      }
    }
  }, [errors, values, reset, include, includeLoaded, isBusiness])
  const setValue = (
    name: AddressValuesKeys,
    value: string | number | readonly string[]
  ): void => {
    const field: any = {
      [name.replace('billing_address_', '')]: value
    }
    setAddress({
      values: {
        ...values,
        ...field,
        ...(isBusiness && { business: isBusiness })
      },
      resource: 'billing_address'
    })
  }
  const providerValues = {
    isBusiness,
    values: values as DefaultContextAddress['values'],
    validation,
    setValue,
    errorClassName,
    requiresBillingInfo: order?.requires_billing_info || false,
    errors: errors as any,
    resetField: (name: string) =>
      resetForm({ currentTarget: ref.current } as any, name)
  }
  return (
    <BillingAddressFormContext.Provider value={providerValues}>
      <form ref={ref} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressFormContext.Provider>
  )
}

export default BillingAddressForm

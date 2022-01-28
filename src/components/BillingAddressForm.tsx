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
import { Address } from '@commercelayer/sdk'
import { getSaveBillingAddressToAddressBook } from '#utils/localStorage'
import { businessMandatoryField } from '#utils/validateFormFields'

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
  // const [formType, setFormType] = useState<'customer' | 'business'>('customer')
  const { setAddressErrors, setAddress, isBusiness } =
    useContext(AddressesContext)
  const {
    saveAddressToCustomerAddressBook,
    order,
    include,
    addResourceToInclude,
    includeLoaded,
  } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!include?.includes('billing_address')) {
      addResourceToInclude({
        newResource: 'billing_address',
      })
    } else if (!includeLoaded?.['billing_address']) {
      addResourceToInclude({
        newResourceLoaded: { billing_address: true },
      })
    }
    if (!isEmpty(errors)) {
      const formErrors: BaseError[] = []
      for (const fieldName in errors) {
        const { code, message } = errors[fieldName]
        if (['billing_address_state_code'].includes(fieldName)) {
          if (isEmpty(values['state_code'])) {
            delete errors[fieldName]
          } else {
            formErrors.push({
              code: code as CodeErrorType,
              message,
              resource: 'billing_address',
              field: fieldName,
            })
          }
        } else {
          formErrors.push({
            code: code as CodeErrorType,
            message,
            resource: 'billing_address',
            field: fieldName,
          })
        }
      }
      setAddressErrors(formErrors, 'billing_address')
    } else if (!isEmpty(values)) {
      setAddressErrors([], 'billing_address')
      for (const name in values) {
        const field = values[name]
        const mandatory = businessMandatoryField(
          name as AddressInputName,
          isBusiness
        )
        if (!mandatory) delete values[name]
        if (field?.value) {
          values[name.replace('billing_address_', '')] = field.value
          delete values[name]
        }
        if (field?.type === 'checkbox') {
          delete values[name]
          saveAddressToCustomerAddressBook({
            type: 'billing_address',
            value: field.checked,
          })
        }
      }
      console.log('values', values)
      setAddress({
        values: {
          ...values,
          ...(isBusiness && { business: isBusiness }),
        } as Address,
        resource: 'billing_address',
      })
    }
    const checkboxChecked =
      ref.current?.querySelector(
        '[name="billing_address_save_to_customer_book"]'
        // @ts-ignore
      )?.checked || getSaveBillingAddressToAddressBook()
    if (reset && (!isEmpty(values) || !isEmpty(errors) || checkboxChecked)) {
      saveAddressToCustomerAddressBook &&
        saveAddressToCustomerAddressBook({
          type: 'billing_address',
          value: false,
        })
      if (ref) {
        ref.current?.reset()
        resetForm({ target: ref.current } as any)
        setAddressErrors([], 'billing_address')
        setAddress({ values: {} as Address, resource: 'billing_address' })
      }
    }
  }, [errors, values, reset, include, includeLoaded, isBusiness])
  const setValue = (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => {
    const field: any = {
      [name.replace('billing_address_', '')]: value,
    }
    setAddress({
      values: {
        ...values,
        ...field,
        ...(isBusiness && { business: isBusiness }),
      },
      resource: 'billing_address',
    })
  }
  const providerValues = {
    isBusiness,
    values,
    validation,
    setValue,
    errorClassName,
    requiresBillingInfo: order?.requires_billing_info || false,
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

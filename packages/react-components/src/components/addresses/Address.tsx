import { useContext, useState, useEffect } from 'react'
import AddressChildrenContext from '#context/AddressChildrenContext'
import CustomerContext from '#context/CustomerContext'
import BillingAddressContext from '#context/BillingAddressContext'
import ShippingAddressContext from '#context/ShippingAddressContext'
import type { Address as AddressType } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import AddressContext from '#context/AddressContext'
import OrderContext from '#context/OrderContext'
import AddressCardsTemplate, {
  AddressCardsTemplateChildren,
  CustomerAddress,
  HandleSelect
} from '#components/utils/AddressCardsTemplate'

interface Props
  extends Omit<JSX.IntrinsicElements['div'], 'children' | 'onSelect'> {
  children: JSX.Element[] | JSX.Element | AddressCardsTemplateChildren
  selectedClassName?: string
  disabledClassName?: string
  onSelect?: (address: AddressType) => void
  addresses?: AddressType[]
  deselect?: boolean
}

export function Address(props: Props): JSX.Element {
  const {
    children,
    className,
    selectedClassName = '',
    disabledClassName = '',
    onSelect,
    addresses = [],
    deselect = false,
    ...p
  } = props
  const { addresses: addressesContext } = useContext(CustomerContext)
  const { setBillingAddress, billingCustomerAddressId } = useContext(
    BillingAddressContext
  )
  const { setShippingAddress, shippingCustomerAddressId } = useContext(
    ShippingAddressContext
  )
  const { shipToDifferentAddress, billingAddressId, shippingAddressId } =
    useContext(AddressContext)
  const { order } = useContext(OrderContext)
  const [selected, setSelected] = useState<null | number | undefined>(null)
  const items = !isEmpty(addresses)
    ? addresses
    : (addressesContext && addressesContext) || []
  useEffect(() => {
    if (items && !deselect) {
      items.forEach((address, k) => {
        if (billingCustomerAddressId) {
          const preselected = address.reference === billingCustomerAddressId
          if (preselected && selected === null) {
            setSelected(k)
          }
        }
        if (!billingAddressId && k === selected && setBillingAddress) {
          void setBillingAddress(address.id, {
            customerAddressId: address.reference as string
          })
        }
        if (shippingCustomerAddressId) {
          const preselected = address.reference === shippingCustomerAddressId
          preselected && selected === null && setSelected(k)
        }
        if (!shippingAddressId && k === selected && setShippingAddress) {
          void setShippingAddress(address.id, {
            customerAddressId: address.reference as string
          })
        }
      })
    }
    if (deselect) {
      const disabledSaveButton = async (): Promise<void> => {
        setBillingAddress && (await setBillingAddress(''))
        setShippingAddress && (await setShippingAddress(''))
      }
      void disabledSaveButton()
    }
  }, [
    deselect,
    billingCustomerAddressId,
    shippingCustomerAddressId,
    addressesContext,
    shipToDifferentAddress
  ])
  const handleSelect: HandleSelect = async (
    k,
    addressId,
    customerAddressId,
    disabled,
    address
  ) => {
    !disabled && setSelected(k)
    setBillingAddress &&
      (await setBillingAddress(addressId, { customerAddressId }))
    !disabled &&
      setShippingAddress &&
      (await setShippingAddress(addressId, { customerAddressId }))
    if (onSelect) onSelect(address)
  }
  const countryLock = order?.shipping_country_code_lock
  const components =
    typeof children === 'function'
      ? []
      : items
          .filter((address) => {
            if (
              setShippingAddress &&
              countryLock &&
              countryLock !== address.country_code
            ) {
              return false
            }
            return true
          })
          .map((address, k) => {
            const addressProps = {
              address
            }
            const disabled =
              (setShippingAddress &&
                countryLock &&
                countryLock !== address.country_code) ||
              false
            const selectedClass = deselect ? '' : selectedClassName
            const addressSelectedClass =
              selected === k ? `${className || ''} ${selectedClass}` : className
            const customerAddressId: string = address?.reference || ''
            const finalClassName = disabled
              ? `${className || ''} ${disabledClassName}`
              : addressSelectedClass
            return (
              <AddressChildrenContext.Provider key={k} value={addressProps}>
                <div
                  className={finalClassName}
                  onClick={() => {
                    void handleSelect(
                      k,
                      address.id,
                      customerAddressId,
                      disabled,
                      address
                    )
                  }}
                  data-disabled={disabled}
                  {...p}
                >
                  {children}
                </div>
              </AddressChildrenContext.Provider>
            )
          })
  const parentProps = {
    customerAddresses: items as CustomerAddress[],
    selected,
    handleSelect,
    countryLock,
    ...props
  }
  return typeof children === 'function' ? (
    <AddressCardsTemplate {...parentProps}>{children}</AddressCardsTemplate>
  ) : (
    <>{components}</>
  )
}

export default Address

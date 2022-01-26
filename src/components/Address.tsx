import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import AddressChildrenContext from '#context/AddressChildrenContext'
import components from '#config/components'
import CustomerContext from '#context/CustomerContext'
import BillingAddressContext from '#context/BillingAddressContext'
import ShippingAddressContext from '#context/ShippingAddressContext'
import { Address as AddressType } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import AddressContext from '#context/AddressContext'
import OrderContext from '#context/OrderContext'
import AddressCardsTemplate, {
  AddressCardsTemplateChildren,
  CustomerAddress,
} from './utils/AddressCardsTemplate'

const propTypes = components.Address.propTypes

type Props = {
  children: ReactNode | AddressCardsTemplateChildren
  selectedClassName?: string
  disabledClassName?: string
  onSelect?: () => void
  addresses?: AddressType[]
  deselect?: boolean
} & JSX.IntrinsicElements['div']

const Address: FunctionComponent<Props> = (props) => {
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
      items.map((address, k) => {
        if (billingCustomerAddressId) {
          const preselected = address.reference === billingCustomerAddressId
          if (preselected && selected === null) {
            setSelected(k)
          }
        }
        if (!billingAddressId && k === selected) {
          setBillingAddress &&
            setBillingAddress(address.id, {
              customerAddressId: address.reference as string,
            })
        }
        if (shippingCustomerAddressId) {
          const preselected = address.reference === shippingCustomerAddressId
          preselected && selected === null && setSelected(k)
        }
        if (!shippingAddressId && k === selected) {
          setShippingAddress &&
            setShippingAddress(address.id, {
              customerAddressId: address.reference as string,
            })
        }
      })
    }
    if (deselect) {
      const disabledSaveButton = async () => {
        setBillingAddress && (await setBillingAddress(''))
        setShippingAddress && (await setShippingAddress(''))
      }
      disabledSaveButton()
    }
  }, [
    deselect,
    billingCustomerAddressId,
    shippingCustomerAddressId,
    addressesContext,
    shipToDifferentAddress,
  ])
  const handleSelect = async (
    k: number,
    addressId: string,
    customerAddressId: string,
    disabled: boolean
  ) => {
    !disabled && setSelected(k)
    setBillingAddress &&
      (await setBillingAddress(addressId, { customerAddressId }))
    !disabled &&
      setShippingAddress &&
      (await setShippingAddress(addressId, { customerAddressId }))
    onSelect && onSelect()
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
              address,
            }
            const disabled =
              (setShippingAddress &&
                countryLock &&
                countryLock !== address.country_code) ||
              false
            const selectedClass = deselect ? '' : selectedClassName
            const addressSelectedClass =
              selected === k ? `${className} ${selectedClass}` : className
            const customerAddressId: string = address?.reference || ''
            const finalClassName = disabled
              ? `${className} ${disabledClassName}`
              : addressSelectedClass
            return (
              <AddressChildrenContext.Provider key={k} value={addressProps}>
                <div
                  className={finalClassName}
                  onClick={() =>
                    handleSelect(k, address.id, customerAddressId, disabled)
                  }
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
    ...props,
  }
  return typeof children === 'function' ? (
    <AddressCardsTemplate {...parentProps}>
      {children as AddressCardsTemplateChildren}
    </AddressCardsTemplate>
  ) : (
    <Fragment>{components}</Fragment>
  )
}

Address.propTypes = propTypes

export default Address

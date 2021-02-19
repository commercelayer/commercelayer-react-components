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
import { AddressCollection } from '@commercelayer/js-sdk'
import _ from 'lodash'
import AddressContext from '#context/AddressContext'
import OrderContext from '#context/OrderContext'

const propTypes = components.Address.propTypes

type Props = {
  children: ReactNode
  selectedClassName?: string
  disabledClassName?: string
  onSelect?: () => void
  addresses?: AddressCollection[]
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
  const {
    shipToDifferentAddress,
    billingAddressId,
    shippingAddressId,
    // setCloneAddress,
    // setShippingCustomerAddressId,
  } = useContext(AddressContext)
  const { order } = useContext(OrderContext)
  const [selected, setSelected] = useState<null | number | undefined>(null)
  const items = !_.isEmpty(addresses)
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
              customerAddressId: address.customerAddressId as string,
            })
        }
        if (shippingCustomerAddressId) {
          const preselected = address.reference === shippingCustomerAddressId
          preselected && selected === null && setSelected(k)
        }
        if (!shippingAddressId && k === selected) {
          setShippingAddress &&
            setShippingAddress(address.id, {
              customerAddressId: address.customerAddressId as string,
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
  const components = items.map((address, k) => {
    const addressProps = {
      address,
    }
    const countryLock = order?.shippingCountryCodeLock
    const disabled =
      (setShippingAddress &&
        countryLock &&
        countryLock !== address.countryCode) ||
      false
    const selectedClass = deselect ? '' : selectedClassName
    const addressSelectedClass =
      selected === k ? `${className} ${selectedClass}` : className
    const customerAddressId: string = address?.customerAddressId || ''
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
  return <Fragment>{components}</Fragment>
}

Address.propTypes = propTypes

export default Address

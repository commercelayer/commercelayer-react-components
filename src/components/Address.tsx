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

const propTypes = components.Address.propTypes

type Props = {
  children: ReactNode
  selectedClassName?: string
  onSelect?: () => void
  addresses?: AddressCollection[]
} & JSX.IntrinsicElements['div']

const Address: FunctionComponent<Props> = (props) => {
  const {
    children,
    className,
    selectedClassName,
    onSelect,
    addresses = [],
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
    billingAddress,
    shippingAddress,
    shipToDifferentAddress,
  } = useContext(AddressContext)
  const [selected, setSelected] = useState<null | number>(null)
  const items = !_.isEmpty(addresses)
    ? addresses
    : (addressesContext && addressesContext) || []
  useEffect(() => {
    if (items) {
      items.map((address, k) => {
        if (
          billingCustomerAddressId ||
          shippingCustomerAddressId === undefined
        ) {
          const preselected =
            address.customerAddressId === billingCustomerAddressId
          if (preselected && selected === null && _.isEmpty(billingAddress))
            setSelected(k)
          else if (
            (preselected || selected !== null) &&
            !_.isEmpty(billingAddress)
          )
            setSelected(null)
        }
        if (
          (shipToDifferentAddress && shippingCustomerAddressId) ||
          billingCustomerAddressId === undefined
        ) {
          const preselected =
            address.customerAddressId === shippingCustomerAddressId
          if (preselected && selected === null && _.isEmpty(shippingAddress))
            setSelected(k)
          else if (
            (preselected || selected !== null) &&
            !_.isEmpty(shippingAddress)
          )
            setSelected(null)
        }
      })
    }
  }, [billingAddress, shippingAddress, addresses])
  const handleSelect = async (
    k: number,
    addressId: string,
    customerAddressId: string
  ) => {
    if (k !== selected) {
      setSelected(k)
      setBillingAddress &&
        (await setBillingAddress(addressId, { customerAddressId }))
      setShippingAddress &&
        (await setShippingAddress(addressId, { customerAddressId }))
      onSelect && onSelect()
    }
  }
  const components = items.map((address, k) => {
    const addressProps = {
      address,
    }
    const addressSelectedClass =
      selected === k ? `${className} ${selectedClassName}` : className
    const customerAddressId: string = address?.customerAddressId || ''
    return (
      <AddressChildrenContext.Provider key={k} value={addressProps}>
        <div
          className={addressSelectedClass}
          onClick={() => handleSelect(k, address.id, customerAddressId)}
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

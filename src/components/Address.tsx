import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useState,
} from 'react'
import AddressChildrenContext from '@context/AddressChildrenContext'
import components from '@config/components'
import CustomerContext from '@context/CustomerContext'
import BillingAddressContext from '@context/BillingAddressContext'
import ShippingAddressContext from '@context/ShippingAddressContext'
import { AddressCollection } from '@commercelayer/js-sdk'
import _ from 'lodash'

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
  const { setBillingAddress } = useContext(BillingAddressContext)
  const { setShippingAddress } = useContext(ShippingAddressContext)
  const [selected, setSelected] = useState<null | number>(null)
  const handleSelect = async (k: number, addressId: string) => {
    if (k !== selected) {
      setSelected(k)
      setBillingAddress && (await setBillingAddress(addressId))
      setShippingAddress && (await setShippingAddress(addressId))
      onSelect && onSelect()
    }
    if (k === selected) {
      setSelected(null)
      setBillingAddress && (await setBillingAddress(''))
      setShippingAddress && (await setShippingAddress(''))
      onSelect && onSelect()
    }
  }
  const items = !_.isEmpty(addresses)
    ? addresses
    : (addressesContext && addressesContext) || []
  const components = items.map((address, k) => {
    const addressProps = {
      address,
    }
    const addressSelectedClass =
      selected === k ? `${className} ${selectedClassName}` : className
    return (
      <AddressChildrenContext.Provider key={k} value={addressProps}>
        <div
          className={addressSelectedClass}
          onClick={() => handleSelect(k, address.id)}
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

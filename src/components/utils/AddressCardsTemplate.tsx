import Parent from '#components/utils/Parent'
import { useContext } from 'react'
import { Address } from '@commercelayer/sdk'
import AddressChildrenContext from '#context/AddressChildrenContext'
import ShippingAddressContext from '#context/ShippingAddressContext'
import { ChildrenFunction } from '#typings'

type ChildrenProps = Pick<Props, 'customerAddresses' | 'className'> & {
  AddressProvider: typeof AddressChildrenContext.Provider
}

export type CustomerAddress = Address & {
  onClick: () => void
  handleSelect?: () => void
}

export type AddressCardsTemplateChildren = ChildrenFunction<ChildrenProps>

export type AddressCardsType = ChildrenProps

export type HandleSelect = (
  k: number,
  addressId: string,
  customerAddressId: string,
  disabled: boolean,
  address: Address
) => Promise<void>

type Props = {
  customerAddresses: CustomerAddress[]
  countryLock?: string
  children: AddressCardsTemplateChildren
  selectedClassName?: string
  disabledClassName?: string
  deselect?: boolean
  selected?: number | null
  className?: string
  handleSelect: HandleSelect
}

export default function AddressCardsTemplate({
  customerAddresses,
  children,
  deselect,
  countryLock,
  selected,
  selectedClassName,
  className,
  disabledClassName,
  handleSelect,
}: Props) {
  const { setShippingAddress } = useContext(ShippingAddressContext)
  const addresses = customerAddresses.map((address, k) => {
    const attributes = address
    const disabled =
      (setShippingAddress &&
        countryLock &&
        countryLock !== address.country_code) ||
      false
    const selectedClass = deselect ? '' : selectedClassName
    const addressSelectedClass =
      selected === k ? `${className} ${selectedClass}` : className
    const finalClassName = disabled
      ? `${className} ${disabledClassName}`
      : addressSelectedClass
    const customerAddressId: string = address?.reference || ''
    const onClick = () =>
      handleSelect(k, address.id, customerAddressId, disabled, address)
    return {
      ...attributes,
      className: finalClassName,
      onClick,
    }
  })
  const value = {
    customerAddresses: addresses,
    AddressProvider: AddressChildrenContext.Provider,
  }
  return <Parent {...value}>{children}</Parent>
}

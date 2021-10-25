import Parent from '#components/utils/Parent'
import React, { useContext } from 'react'
import { AddressCollection } from '@commercelayer/js-sdk'
import AddressChildrenContext from '#context/AddressChildrenContext'
import ShippingAddressContext from '#context/ShippingAddressContext'
import { FunctionChildren } from '#typings'

type ChildrenProps = Pick<Props, 'customerAddresses' | 'className'> & {
  onClick: () => void
}

type CustomerAddress = AddressCollection & {
  handleSelect?: () => void
}

export type AddressCardsTemplateChildren = FunctionChildren<ChildrenProps>

type HandleSelect = (
  k: number,
  addressId: string,
  customerAddressId: string,
  disabled: boolean
) => void

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
    const attributes = address.attributes() as any
    const disabled =
      (setShippingAddress &&
        countryLock &&
        countryLock !== address.countryCode) ||
      false
    const selectedClass = deselect ? '' : selectedClassName
    const addressSelectedClass =
      selected === k ? `${className} ${selectedClass}` : className
    const finalClassName = disabled
      ? `${className} ${disabledClassName}`
      : addressSelectedClass
    const customerAddressId: string = address?.customerAddressId || ''
    const onClick = () =>
      handleSelect(k, address.id, customerAddressId, disabled)
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

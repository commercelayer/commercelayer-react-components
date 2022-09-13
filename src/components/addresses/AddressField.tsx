import { useContext, ReactNode } from 'react'
import AddressChildrenContext from '#context/AddressChildrenContext'
import Parent from '#components-utils/Parent'

import { AddressFieldView } from '#reducers/AddressReducer'
import type { Address } from '@commercelayer/sdk'
import CustomerContext from '#context/CustomerContext'

type AddressFieldChildrenProps = Omit<Props, 'children' | 'name'> & {
  address: Address
}

type Props =
  | {
      type?: 'field'
      label?: never
      onClick?: never
      children?: (props: AddressFieldChildrenProps) => JSX.Element
      name: AddressFieldView
      className?: string
    }
  | {
      type?: 'edit'
      label: string | ReactNode
      onClick: (address: Address) => void
      children?: (props: AddressFieldChildrenProps) => JSX.Element
      name?: AddressFieldView
      className?: string
    }
  | {
      type?: 'delete'
      label: string
      onClick: () => void
      children?: (props: AddressFieldChildrenProps) => JSX.Element
      name?: AddressFieldView
      className?: string
    }
  | {
      type?: 'edit' | 'field' | 'delete'
      label?: never
      onClick?: never
      children: (props: AddressFieldChildrenProps) => JSX.Element
      name?: never
      className?: string
    }

export function AddressField(props: Props): JSX.Element {
  const { name, type = 'field', label, onClick, ...p } = props
  const { address } = useContext(AddressChildrenContext)
  const text = name && address ? address?.[name] : ''
  const { deleteCustomerAddress } = useContext(CustomerContext)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (type === 'delete' && deleteCustomerAddress && address?.reference) {
      void deleteCustomerAddress({ customerAddressId: address?.reference })
    }
    address && onClick && onClick(address)
  }
  const parentProps = {
    address,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : type === 'field' ? (
    <p {...{ ...p, name }}>{text}</p>
  ) : (
    <a {...p} onClick={handleClick}>
      {label}
    </a>
  )
}

export default AddressField

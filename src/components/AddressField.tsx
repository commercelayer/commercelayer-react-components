import React, { useContext, FunctionComponent, ReactNode } from 'react'
import AddressChildrenContext from '#context/AddressChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { AddressFieldView } from '#reducers/AddressReducer'
import { camelCase, get } from 'lodash'
import { AddressCollection } from '@commercelayer/js-sdk'
import CustomerContext from '#context/CustomerContext'

const propTypes = components.AddressField.propTypes
const displayName = components.AddressField.displayName

type AddressFieldChildrenProps = Omit<
  AddressFieldProps,
  'children' | 'name'
> & {
  address: AddressCollection
}

type AddressFieldProps =
  | {
      type?: 'field'
      label?: never
      onClick?: never
      children?: (props: AddressFieldChildrenProps) => ReactNode
      name: AddressFieldView
      className?: string
    }
  | {
      type?: 'edit'
      label: string
      onClick: (addressId: string) => void
      children?: (props: AddressFieldChildrenProps) => ReactNode
      name?: AddressFieldView
      className?: string
    }
  | {
      type?: 'delete'
      label: string
      onClick: () => void
      children?: (props: AddressFieldChildrenProps) => ReactNode
      name?: AddressFieldView
      className?: string
    }
  | {
      type?: 'edit' | 'field' | 'delete'
      label?: never
      onClick?: never
      children: (props: AddressFieldChildrenProps) => ReactNode
      name?: never
      className?: string
    }

const AddressField: FunctionComponent<AddressFieldProps> = (props) => {
  const { name, type = 'field', label, onClick, ...p } = props
  const { address } = useContext(AddressChildrenContext)
  const { deleteCustomerAddress } = useContext(CustomerContext)
  const key = camelCase(name)
  const text = get(address, key)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (type === 'delete') {
      deleteCustomerAddress({ customerAddressId: address.customerAddressId })
    }
    onClick && onClick(address.id)
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

AddressField.propTypes = propTypes
AddressField.displayName = displayName

export default AddressField

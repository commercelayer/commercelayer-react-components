import { useContext, ReactNode } from 'react'
import AddressChildrenContext from '#context/AddressChildrenContext'
import Parent from '#components-utils/Parent'
import { AddressFieldView } from '#reducers/AddressReducer'
import type { Address } from '@commercelayer/sdk'
import CustomerContext from '#context/CustomerContext'
import { ChildrenFunction } from '#typings/index'

interface ChildrenProps extends Omit<Props, 'children' | 'name'> {
  address: Address
}

type ChildrenProp = ChildrenFunction<ChildrenProps>

type Props =
  | {
      type?: 'field'
      label?: never
      onClick?: never
      children?: ChildrenProp
      name: AddressFieldView
      className?: string
    }
  | {
      type?: 'edit'
      label: string | ReactNode
      onClick: (address: Address) => void
      children?: ChildrenProp
      name?: AddressFieldView
      className?: string
    }
  | {
      type?: 'delete'
      label: string
      onClick: () => void
      children?: ChildrenProp
      name?: AddressFieldView
      className?: string
    }
  | {
      type?: 'edit' | 'field' | 'delete'
      label?: never
      onClick?: never
      children: ChildrenProp
      name?: never
      className?: string
    }

export function AddressField(props: Props): JSX.Element {
  const { name, type = 'field', label, onClick, ...p } = props
  const { address } = useContext(AddressChildrenContext)
  const text = name && address ? address?.[name] : ''
  const { deleteCustomerAddress } = useContext(CustomerContext)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.stopPropagation()
    e.preventDefault()
    if (type === 'delete' && deleteCustomerAddress && address?.reference) {
      void deleteCustomerAddress({ customerAddressId: address?.reference })
    }
    address && onClick && onClick(address)
  }
  const parentProps = {
    address,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : type === 'field' ? (
    <p data-testid={`address-field-${name ?? ''}`} {...{ ...p, name }}>
      {text}
    </p>
  ) : (
    <a data-testid={`address-field-${name ?? ''}`} {...p} onClick={handleClick}>
      {label}
    </a>
  )
}

export default AddressField

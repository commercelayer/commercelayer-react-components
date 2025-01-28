import { useContext, type ReactNode, type JSX } from 'react';
import AddressChildrenContext from '#context/AddressChildrenContext'
import Parent from '#components/utils/Parent'
import type { AddressFieldView } from '#reducers/AddressReducer'
import type { Address } from '@commercelayer/sdk'
import CustomerContext from '#context/CustomerContext'
import type { ChildrenFunction } from '#typings/index'

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

/**
 * The AddressField component displays any attribute of the `address` object set in the state of the parent `<Address>` component.
 *
 * It accepts a `name` prop to define the attribute to be shown.
 * It also accepts:
 * - a `type` props to enable different kind of behaviors like `field` (default), `edit` or `delete`.
 * - a `label` props to show a custom label if chosen `type` is `edit` or `delete`.
 * - an `onClick` props to define a custom click behavior.
 *
 * <span title="Type `delete`" type="info">
 * Only in case `type` is set to `delete` a default `onClick` behavior will be set to manage current address removal.
 * </span>
 *
 * <span title="Requirement" type="warning">
 * It must to be used inside the `<Address>` component.
 * </span>
 *
 * <span title="Fields" type="info">
 * Check the `addresses` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/addresses/object)
 * for more details about the available attributes to render.
 * </span>
 */
export function AddressField(props: Props): JSX.Element {
  const { name, type = 'field', label, onClick, ...p } = props
  const { address } = useContext(AddressChildrenContext)
  const text = name && address ? address?.[name] : ''
  const { deleteCustomerAddress } = useContext(CustomerContext)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.stopPropagation()
    e.preventDefault()
    if (type === 'delete' && deleteCustomerAddress && address?.reference) {
      deleteCustomerAddress({ customerAddressId: address?.reference })
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

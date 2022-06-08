import { useContext, FunctionComponent, ReactNode } from 'react'
import AddressChildrenContext from '#context/AddressChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { AddressFieldView } from '#reducers/AddressReducer'
import get from 'lodash/get'
import { Address } from '@commercelayer/sdk'

const propTypes = components.AddressField.propTypes
const displayName = components.AddressField.displayName

type AddressFieldChildrenProps = Omit<
  AddressFieldProps,
  'children' | 'name'
> & {
  address: Address
}

type AddressFieldProps = (
  | {
      children?: (props: AddressFieldChildrenProps) => ReactNode
      name: AddressFieldView
    }
  | {
      children: (props: AddressFieldChildrenProps) => ReactNode
      name?: AddressFieldView
    }
) &
  JSX.IntrinsicElements['p']

const AddressField: FunctionComponent<AddressFieldProps> = (props) => {
  const { name } = props
  const { address } = useContext(AddressChildrenContext)
  const text = get(address, name as AddressFieldView)
  const parentProps = {
    address,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{text}</p>
  )
}

AddressField.propTypes = propTypes
AddressField.displayName = displayName

export default AddressField

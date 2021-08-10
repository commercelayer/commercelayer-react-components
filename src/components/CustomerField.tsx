import React, { useContext, FunctionComponent, ReactNode } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import get from 'lodash/get'
import CustomerContext from '#context/CustomerContext'

const propTypes = components.CustomerField.propTypes
const displayName = components.CustomerField.displayName

type CustomerFieldChildrenProps = Omit<
  CustomerFieldProps,
  'children' | 'name'
> & {
  text: string
}

type CustomerFieldProps = {
  children?: (props: CustomerFieldChildrenProps) => ReactNode
  name: 'email'
} & JSX.IntrinsicElements['p']

const CustomerField: FunctionComponent<CustomerFieldProps> = (props) => {
  const { name } = props
  const { attributes } = useContext(CustomerContext)
  const text = get(attributes, name)
  const parentProps = {
    text,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...props}>{text}</span>
  )
}

CustomerField.propTypes = propTypes
CustomerField.displayName = displayName

export default CustomerField

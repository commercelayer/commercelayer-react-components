import React, { useContext, FunctionComponent, ReactNode } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.ShippingMethodName.propTypes
const displayName = components.ShippingMethodName.displayName

type LineItemNameChildrenProps = Omit<LineItemNameProps, 'children'>

type LineItemNameProps = {
  children?: (props: LineItemNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['p']

const ShippingMethodName: FunctionComponent<LineItemNameProps> = (props) => {
  const { shippingMethod } = useContext(ShippingMethodChildrenContext)
  const labelName = shippingMethod['name']
  const parentProps = {
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{labelName}</p>
  )
}

ShippingMethodName.propTypes = propTypes
ShippingMethodName.displayName = displayName

export default ShippingMethodName

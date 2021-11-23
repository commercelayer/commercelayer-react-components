import React, { useContext, FunctionComponent, ReactNode } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { ShippingMethod } from '@commercelayer/sdk'

const propTypes = components.ShippingMethodName.propTypes
const displayName = components.ShippingMethodName.displayName

type LineItemNameChildrenProps = Omit<LineItemNameProps, 'children'> & {
  label: string
  shippingMethod: ShippingMethod
}

type LineItemNameProps = {
  children?: (props: LineItemNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['label']

const ShippingMethodName: FunctionComponent<LineItemNameProps> = (props) => {
  const { shippingMethod, deliveryLeadTimeForShipment, shipmentId } =
    useContext(ShippingMethodChildrenContext)
  const htmlFor = `shipment-${shipmentId}-${shippingMethod?.id}` || ''
  const labelName = shippingMethod?.['name']
  const parentProps = {
    shippingMethod,
    deliveryLeadTimeForShipment,
    label: labelName,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <label htmlFor={htmlFor} {...props}>
      {labelName}
    </label>
  )
}

ShippingMethodName.propTypes = propTypes
ShippingMethodName.displayName = displayName

export default ShippingMethodName

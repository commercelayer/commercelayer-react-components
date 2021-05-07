import React, { useContext, FunctionComponent, ReactNode } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { camelCase, get } from 'lodash'
import { ShipmentCollection } from '@commercelayer/js-sdk'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

const propTypes = components.ShipmentField.propTypes
const displayName = components.ShipmentField.displayName

type ShipmentFieldChildrenProps = Omit<ShipmentFieldProps, 'children'> & {
  shipment: ShipmentCollection
}

export type ShipmentAttribute =
  | 'number'
  | 'currencyCode'
  | 'status'
  | 'costAmountCents'
  | 'costAmountFloat'
  | 'formattedCostAmount'
  | 'keyNumber'

type ShipmentFieldProps = {
  children?: (props: ShipmentFieldChildrenProps) => ReactNode
  name: ShipmentAttribute
} & JSX.IntrinsicElements['p']

const ShipmentField: FunctionComponent<ShipmentFieldProps> = (props) => {
  const { name } = props
  const { shipment, keyNumber } = useContext(ShipmentChildrenContext)
  const key = camelCase(name)
  const text = key !== 'keyNumber' ? get(shipment, key) : keyNumber
  const parentProps = {
    shipment,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{text}</p>
  )
}

ShipmentField.propTypes = propTypes
ShipmentField.displayName = displayName

export default ShipmentField

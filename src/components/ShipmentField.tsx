import React, { useContext, FunctionComponent, ReactNode } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import get from 'lodash/get'
import { Shipment } from '@commercelayer/sdk'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

const propTypes = components.ShipmentField.propTypes
const displayName = components.ShipmentField.displayName

type ShipmentFieldChildrenProps = Omit<ShipmentFieldProps, 'children'> & {
  shipment: Shipment
}

export type ShipmentAttribute =
  | 'number'
  | 'currency_code'
  | 'status'
  | 'cost_amount_cents'
  | 'cost_amount_float'
  | 'formatted_cost_amount'
  | 'key_number'

type ShipmentFieldProps = {
  children?: (props: ShipmentFieldChildrenProps) => ReactNode
  name: ShipmentAttribute
} & JSX.IntrinsicElements['span']

const ShipmentField: FunctionComponent<ShipmentFieldProps> = (props) => {
  const { name } = props
  const { shipment, keyNumber } = useContext(ShipmentChildrenContext)
  const key = name
  const text = key !== 'key_number' ? get(shipment, key) : keyNumber
  const parentProps = {
    shipment,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...props}>{text}</span>
  )
}

ShipmentField.propTypes = propTypes
ShipmentField.displayName = displayName

export default ShipmentField

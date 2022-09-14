import { useContext } from 'react'
import Parent from '#components-utils/Parent'
import components from '#config/components'
import get from 'lodash/get'
import { Shipment } from '@commercelayer/sdk'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

const propTypes = components.ShipmentField.propTypes
const displayName = components.ShipmentField.displayName

type ShipmentFieldChildrenProps = Omit<Props, 'children'> & {
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

type Props = {
  children?: (props: ShipmentFieldChildrenProps) => JSX.Element
  name: ShipmentAttribute
} & JSX.IntrinsicElements['span']

export function ShipmentField(props: Props) {
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

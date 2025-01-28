import { useContext, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import get from 'lodash/get'
import type { Shipment } from '@commercelayer/sdk'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

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

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children' | 'ref'> {
  children?: (props: ShipmentFieldChildrenProps) => JSX.Element
  name: ShipmentAttribute
}

export function ShipmentField(props: Props): JSX.Element {
  const { name } = props
  const { shipment, keyNumber } = useContext(ShipmentChildrenContext)
  const key = name
  const text = key !== 'key_number' ? get(shipment, key) : keyNumber
  const parentProps = {
    shipment,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...props}>{text}</span>
  )
}

export default ShipmentField

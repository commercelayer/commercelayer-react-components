import Parent from '#components/utils/Parent'
import ShipmentContext from '#context/ShipmentContext'
import { ChildrenFunction } from '#typings/index'
import type { Shipment } from '@commercelayer/sdk'
import { useContext } from 'react'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * Shipments of the current order
   */
  shipments?: Shipment[]
  /**
   * Quantity of the shipments
   */
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
}

export function ShipmentsCount({ children, ...p }: Props): JSX.Element {
  const { shipments } = useContext(ShipmentContext)
  if (shipments === undefined)
    throw new Error(
      'Cannot use `ShipmentsCount` outside of `ShipmentsContainer`'
    )
  const quantity = shipments.length
  const childrenProps: ChildrenProps = {
    ...p,
    quantity,
    shipments
  }
  return children ? (
    <Parent {...childrenProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

export default ShipmentsCount

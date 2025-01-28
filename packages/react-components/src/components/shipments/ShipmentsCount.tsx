import Parent from '#components/utils/Parent'
import ShipmentContext from '#context/ShipmentContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { Shipment } from '@commercelayer/sdk'

import type { JSX } from "react";

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * Shipments of the current order
   */
  shipments?: Shipment[] | null
  /**
   * Quantity of the shipments
   */
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children' | 'ref'> {
  children?: ChildrenFunction<ChildrenProps>
}

export function ShipmentsCount({ children, ...p }: Props): JSX.Element {
  const { shipments } = useCustomContext({
    context: ShipmentContext,
    contextComponentName: 'ShipmentsContainer',
    currentComponentName: 'ShipmentsCount',
    key: 'shipments'
  })
  const quantity = shipments?.length ?? 0
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

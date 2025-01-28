import Parent from '#components/utils/Parent'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { Parcel } from '@commercelayer/sdk'

import type { JSX } from "react";

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * Shipments of the current order
   */
  parcels?: Parcel[] | null
  /**
   * Quantity of the parcels
   */
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
}

export function ParcelsCount({ children, ...p }: Props): JSX.Element {
  const { parcels } = useCustomContext({
    context: ShipmentChildrenContext,
    contextComponentName: 'ShipmentsContainer',
    currentComponentName: 'ParcelsCount',
    key: 'parcels'
  })
  const quantity = parcels?.length ?? 0
  const childrenProps: ChildrenProps = {
    ...p,
    quantity,
    parcels
  }
  return children ? (
    <Parent {...childrenProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

export default ParcelsCount

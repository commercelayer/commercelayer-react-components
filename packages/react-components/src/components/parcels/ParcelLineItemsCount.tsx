import Parent from '#components/utils/Parent'
import ParcelChildrenContext from '#context/ParcelChildrenContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { Parcel } from '@commercelayer/sdk'

import type { JSX } from "react";

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * Parcel of the current shipment
   */
  parcel?: Parcel
  /**
   * Quantity of the parcel line items
   */
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
}

export function ParcelLineItemsCount({ children, ...p }: Props): JSX.Element {
  const { parcel } = useCustomContext({
    context: ParcelChildrenContext,
    contextComponentName: 'Parcels',
    currentComponentName: 'ParcelLineItemsCount',
    key: 'parcel'
  })
  const quantity = parcel?.parcel_line_items?.length ?? 0
  const childrenProps: ChildrenProps = {
    ...p,
    quantity,
    parcel
  }
  return children ? (
    <Parent {...childrenProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

export default ParcelLineItemsCount

import Parent from '#components/utils/Parent'
import ParcelChildrenContext from '#context/ParcelChildrenContext'
import { ChildrenFunction } from '#typings/index'
import type { Parcel } from '@commercelayer/sdk'
import { useContext } from 'react'

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
  const { parcel } = useContext(ParcelChildrenContext)
  if (parcel === undefined)
    throw new Error('Cannot use `ParcelLineItemsCount` outside of `Parcels`')
  const quantity = parcel.parcel_line_items?.length ?? 0
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

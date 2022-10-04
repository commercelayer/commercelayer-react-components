import Parent from '#components/utils/Parent'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import { ChildrenFunction } from '#typings/index'
import type { Parcel } from '@commercelayer/sdk'
import { useContext } from 'react'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * Shipments of the current order
   */
  parcels?: Parcel[]
  /**
   * Quantity of the parcels
   */
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
}

export function ParcelsCount({ children, ...p }: Props): JSX.Element {
  const { parcels } = useContext(ShipmentChildrenContext)
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

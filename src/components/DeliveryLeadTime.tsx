import React, { FunctionComponent, useContext, ReactNode } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.DeliveryLeadTime.propTypes
const displayName = components.DeliveryLeadTime.displayName

export type DeliveryLeadTimeField =
  | 'minHours'
  | 'maxHours'
  | 'minDays'
  | 'maxDays'

export type DeliveryLeadTimeComponentChildren = Omit<
  ShippingMethodPriceProps,
  'children'
>

export interface ShippingMethodPriceProps
  extends Partial<JSX.IntrinsicElements['span']> {
  children?: (props: DeliveryLeadTimeComponentChildren) => ReactNode
  type: DeliveryLeadTimeField
  text?: string
}

const DeliveryLeadTime: FunctionComponent<ShippingMethodPriceProps> = (
  props
) => {
  const { type, ...p } = props
  const { deliveryLeadTimeForShipment } = useContext(
    ShippingMethodChildrenContext
  )
  const text = deliveryLeadTimeForShipment[type]
  const parentProps = {
    text,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{text}</span>
  )
}

DeliveryLeadTime.propTypes = propTypes
DeliveryLeadTime.displayName = displayName

export default DeliveryLeadTime

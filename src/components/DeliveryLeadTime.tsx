import React, {
  FunctionComponent,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.DeliveryLeadTime.propTypes
const displayName = components.DeliveryLeadTime.displayName

export type DeliveryLeadTimeField =
  | 'min_hours'
  | 'max_hours'
  | 'min_days'
  | 'max_days'

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
  const [text, setText] = useState<string | number>()
  const { deliveryLeadTimeForShipment } = useContext(
    ShippingMethodChildrenContext
  )
  useEffect(() => {
    if (deliveryLeadTimeForShipment && deliveryLeadTimeForShipment[type])
      setText(deliveryLeadTimeForShipment[type])
    return () => {
      setText('')
    }
  }, [deliveryLeadTimeForShipment])
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

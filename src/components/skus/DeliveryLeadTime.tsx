import { useContext, useState, useEffect } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from '../utils/Parent'

export type DeliveryLeadTimeField =
  | 'min_hours'
  | 'max_hours'
  | 'min_days'
  | 'max_days'

export type DeliveryLeadTimeComponentChildren = Omit<Props, 'children'>

type Props = Partial<JSX.IntrinsicElements['span']> & {
  children?: (props: DeliveryLeadTimeComponentChildren) => JSX.Element
  type: DeliveryLeadTimeField
  text?: string
}

export function DeliveryLeadTime(props: Props) {
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

export default DeliveryLeadTime

import { useContext, type JSX } from 'react';
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from '#components/utils/Parent'
import type { ShippingMethod } from '@commercelayer/sdk'

type ChildrenProps = Omit<Props, 'children'> & {
  label: string
  shippingMethod: ShippingMethod
}

interface Props extends Omit<JSX.IntrinsicElements['label'], 'children' | 'ref'> {
  children?: (props: ChildrenProps) => JSX.Element
}

export function ShippingMethodName(props: Props): JSX.Element {
  const { shippingMethod, deliveryLeadTimeForShipment, shipmentId } =
    useContext(ShippingMethodChildrenContext)
  const htmlFor =
    `shipment-${shipmentId ?? ''}-${shippingMethod?.id ?? ''}` || ''
  const labelName = shippingMethod?.name
  const parentProps = {
    shippingMethod,
    deliveryLeadTimeForShipment,
    label: labelName,
    htmlFor,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <label htmlFor={htmlFor} {...props}>
      {labelName}
    </label>
  )
}

export default ShippingMethodName

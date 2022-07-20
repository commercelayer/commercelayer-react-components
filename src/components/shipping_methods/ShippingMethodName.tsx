import { useContext, ReactNode } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from '#components-utils/Parent'
import components from '#config/components'
import { ShippingMethod } from '@commercelayer/sdk'

const propTypes = components.ShippingMethodName.propTypes
const displayName = components.ShippingMethodName.displayName

type ChildrenProps = Omit<Props, 'children'> & {
  label: string
  shippingMethod: ShippingMethod
}

type Props = {
  children?: (props: ChildrenProps) => ReactNode
} & JSX.IntrinsicElements['label']

export function ShippingMethodName(props: Props) {
  const { shippingMethod, deliveryLeadTimeForShipment, shipmentId } =
    useContext(ShippingMethodChildrenContext)
  const htmlFor = `shipment-${shipmentId}-${shippingMethod?.id}` || ''
  const labelName = shippingMethod?.['name']
  const parentProps = {
    shippingMethod,
    deliveryLeadTimeForShipment,
    label: labelName,
    htmlFor,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <label htmlFor={htmlFor} {...props}>
      {labelName}
    </label>
  )
}

ShippingMethodName.propTypes = propTypes
ShippingMethodName.displayName = displayName

export default ShippingMethodName

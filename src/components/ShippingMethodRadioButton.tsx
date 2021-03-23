import React, { useContext, FunctionComponent, ReactNode } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import ShipmentContext from '#context/ShipmentContext'
import { ShippingMethodCollection } from '@commercelayer/js-sdk'

const propTypes = components.ShippingMethodRadioButton.propTypes
const displayName = components.ShippingMethodRadioButton.displayName

type ShippingMethodRadioButtonChildrenProps = Omit<
  ShippingMethodRadioButtonProps,
  'children'
>

type ShippingMethodRadioButtonProps = {
  children?: (props: ShippingMethodRadioButtonChildrenProps) => ReactNode
  onChange?: (
    shippingMethod: ShippingMethodCollection | Record<string, any>
  ) => void
} & JSX.IntrinsicElements['input']

const ShippingMethodRadioButton: FunctionComponent<ShippingMethodRadioButtonProps> = (
  props
) => {
  const { onChange, ...p } = props
  const { shippingMethod, currentShippingMethodId } = useContext(
    ShippingMethodChildrenContext
  )
  const { setShippingMethod } = useContext(ShipmentContext)
  const shipmentId = shippingMethod.shipmentId || ''
  const shippingMethodId = shippingMethod.id
  const name = `shipment-${shipmentId}`
  const checked = shippingMethod.id === currentShippingMethodId
  const handleOnChange = async () => {
    await setShippingMethod(shipmentId, shippingMethodId)
    onChange && onChange(shippingMethod)
  }
  const parentProps = {
    handleOnChange,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <input
      type="radio"
      name={name}
      onChange={handleOnChange}
      defaultChecked={checked}
      {...p}
    />
  )
}

ShippingMethodRadioButton.propTypes = propTypes
ShippingMethodRadioButton.displayName = displayName

export default ShippingMethodRadioButton

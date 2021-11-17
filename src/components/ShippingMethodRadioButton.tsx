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

const ShippingMethodRadioButton: FunctionComponent<ShippingMethodRadioButtonProps> =
  (props) => {
    const { onChange, ...p } = props
    const { shippingMethod, currentShippingMethodId, shipmentId } = useContext(
      ShippingMethodChildrenContext
    )
    const { setShippingMethod } = useContext(ShipmentContext)
    const shippingMethodId = shippingMethod?.id
    const name = `shipment-${shipmentId}`
    const id = `${name}-${shippingMethodId}`
    const checked = shippingMethodId === currentShippingMethodId
    const handleOnChange = async () => {
      if (shipmentId && shippingMethodId)
        await setShippingMethod(shipmentId, shippingMethodId)
      if (shippingMethod && onChange) onChange(shippingMethod)
    }
    const parentProps = {
      handleOnChange,
      name,
      id,
      ...props,
    }
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <input
        type="radio"
        name={name}
        id={id}
        onChange={handleOnChange}
        defaultChecked={checked}
        {...p}
      />
    )
  }

ShippingMethodRadioButton.propTypes = propTypes
ShippingMethodRadioButton.displayName = displayName

export default ShippingMethodRadioButton

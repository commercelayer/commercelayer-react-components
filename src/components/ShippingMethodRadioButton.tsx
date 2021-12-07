import React, { useContext, FunctionComponent, ReactNode } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import ShipmentContext from '#context/ShipmentContext'
import { ShippingMethod } from '@commercelayer/sdk'

const propTypes = components.ShippingMethodRadioButton.propTypes
const displayName = components.ShippingMethodRadioButton.displayName

export type ShippingMethodRadioButtonType = Omit<
  ShippingMethodRadioButtonProps,
  'children'
> & { shippingMethod: ShippingMethod; shipmentId: string }

export type ShippingMethodRadioButtonOnChangeType = (
  shippingMethod: ShippingMethod,
  shipmentId: string
) => void

type ShippingMethodRadioButtonProps = {
  children?: (props: ShippingMethodRadioButtonType) => ReactNode
  onChange?: ShippingMethodRadioButtonOnChangeType
} & Omit<JSX.IntrinsicElements['input'], 'onChange'>

const ShippingMethodRadioButton: FunctionComponent<
  ShippingMethodRadioButtonProps
> = (props) => {
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
    if (shipmentId) {
      if (shippingMethodId)
        await setShippingMethod(shipmentId, shippingMethodId)
      if (shippingMethod && onChange) onChange(shippingMethod, shipmentId)
    }
  }
  const parentProps = {
    shippingMethod,
    shipmentId,
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

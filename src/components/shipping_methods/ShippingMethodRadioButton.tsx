import { useContext, ReactNode, useEffect, useState } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import ShipmentContext from '#context/ShipmentContext'
import type { ShippingMethod } from '@commercelayer/sdk'

const propTypes = components.ShippingMethodRadioButton.propTypes
const displayName = components.ShippingMethodRadioButton.displayName

export type ShippingMethodRadioButtonType = Omit<Props, 'children'> & {
  shippingMethod: ShippingMethod
  shipmentId: string
}

export type ShippingMethodRadioButtonOnChangeType = (
  shippingMethod: ShippingMethod,
  shipmentId: string
) => void

type Props = {
  children?: (props: ShippingMethodRadioButtonType) => ReactNode
  onChange?: ShippingMethodRadioButtonOnChangeType
} & Omit<JSX.IntrinsicElements['input'], 'onChange'>

export function ShippingMethodRadioButton(props: Props) {
  const { onChange, ...p } = props
  const [checked, setChecked] = useState(false)
  const { shippingMethod, currentShippingMethodId, shipmentId } = useContext(
    ShippingMethodChildrenContext
  )
  const { setShippingMethod } = useContext(ShipmentContext)
  const shippingMethodId = shippingMethod?.id
  const name = `shipment-${shipmentId}`
  const id = `${name}-${shippingMethodId}`
  useEffect(() => {
    if (shippingMethodId === currentShippingMethodId) {
      setChecked(true)
    } else setChecked(false)
    return () => {
      setChecked(false)
    }
  }, [currentShippingMethodId])

  const handleOnChange = async () => {
    if (shipmentId) {
      if (shippingMethodId) {
        setChecked(true)
        await setShippingMethod(shipmentId, shippingMethodId)
        if (shippingMethod && onChange) onChange(shippingMethod, shipmentId)
      }
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
      checked={checked}
      {...p}
    />
  )
}

ShippingMethodRadioButton.propTypes = propTypes
ShippingMethodRadioButton.displayName = displayName

export default ShippingMethodRadioButton

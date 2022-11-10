import { useContext, useEffect, useState } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from '#components/utils/Parent'
import ShipmentContext from '#context/ShipmentContext'
import type { ShippingMethod } from '@commercelayer/sdk'

export type ShippingMethodRadioButtonType = Omit<Props, 'children'> & {
  shippingMethod: ShippingMethod
  shipmentId: string
}

export type ShippingMethodRadioButtonOnChangeType = (
  shippingMethod: ShippingMethod,
  shipmentId: string
) => void

type Props = {
  children?: (props: ShippingMethodRadioButtonType) => JSX.Element
  onChange?: ShippingMethodRadioButtonOnChangeType
} & Omit<JSX.IntrinsicElements['input'], 'onChange'>

export function ShippingMethodRadioButton(props: Props): JSX.Element {
  const { onChange, ...p } = props
  const [checked, setChecked] = useState(false)
  const { shippingMethod, currentShippingMethodId, shipmentId } = useContext(
    ShippingMethodChildrenContext
  )
  const { setShippingMethod } = useContext(ShipmentContext)
  const shippingMethodId = shippingMethod?.id
  const name = `shipment-${shipmentId ?? ''}`
  const id = `${name}-${shippingMethodId ?? ''}`
  useEffect(() => {
    if (shippingMethodId === currentShippingMethodId) {
      setChecked(true)
    } else setChecked(false)
    return () => {
      setChecked(false)
    }
  }, [currentShippingMethodId])

  const handleOnChange = async (): Promise<void> => {
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
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <input
      type='radio'
      name={name}
      id={id}
      onChange={() => {
        void handleOnChange()
      }}
      checked={checked}
      {...p}
    />
  )
}

export default ShippingMethodRadioButton

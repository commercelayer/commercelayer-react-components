import { useContext, useEffect, useState } from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from '#components/utils/Parent'
import ShipmentContext from '#context/ShipmentContext'
import type { Order, ShippingMethod } from '@commercelayer/sdk'

interface ShippingMethodRadioButtonType extends Omit<Props, 'children'> {
  shippingMethod: ShippingMethod
  shipmentId: string
}

interface TOnChange {
  shippingMethod: ShippingMethod
  shipmentId: string
  order?: Order
}

type Props = {
  children?: (props: ShippingMethodRadioButtonType) => JSX.Element
  onChange?: (params: TOnChange) => void
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
      if (shippingMethodId && setShippingMethod != null) {
        setChecked(true)
        const { order } = await setShippingMethod(shipmentId, shippingMethodId)
        if (shippingMethod && onChange != null)
          onChange({
            shippingMethod,
            shipmentId,
            order
          })
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

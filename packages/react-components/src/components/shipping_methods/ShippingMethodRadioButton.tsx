import type { Order, ShippingMethod } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect, useState } from "react"
import Parent from "#components/utils/Parent"
import ShipmentContext from "#context/ShipmentContext"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"

interface ShippingMethodRadioButtonType extends Omit<Props, "children"> {
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
} & Omit<JSX.IntrinsicElements["input"], "onChange" | "ref" | "children">

export function ShippingMethodRadioButton(props: Props): JSX.Element {
  const { onChange, children, ...p } = props
  const [checked, setChecked] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const { shippingMethod, currentShippingMethodId, shipmentId } = useContext(
    ShippingMethodChildrenContext
  )
  const { setShippingMethod, isRefreshing } = useContext(ShipmentContext)
  const shippingMethodId = shippingMethod?.id
  const name = `shipment-${shipmentId ?? ""}`
  const id = `${name}-${shippingMethodId ?? ""}`
  useEffect(() => {
    if (shippingMethodId === currentShippingMethodId) {
      setChecked(true)
    } else setChecked(false)
    return () => {
      setChecked(false)
    }
  }, [currentShippingMethodId, shippingMethodId])

  const handleOnChange = async (): Promise<void> => {
    setDisabled(true)
    if (shipmentId) {
      if (shippingMethodId && setShippingMethod != null) {
        const { order } = await setShippingMethod(shipmentId, shippingMethodId)
        if (shippingMethod && onChange != null)
          onChange({
            shippingMethod,
            shipmentId,
            order,
          })
      }
    }
    setDisabled(false)
  }
  // While `<Shipments>` refetches after an order change, this radio may show a
  // method the API has cleared — checked, so a click fires no change event — or
  // belong to a shipment the order replaced, so a click PATCHes a 404. Neither
  // can be told apart from a good click until the refetch lands, so wait for it.
  const isDisabled = disabled || isRefreshing === true
  const parentProps = {
    shippingMethod,
    shipmentId,
    handleOnChange,
    name,
    id,
    disabled: isDisabled,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      disabled={isDisabled}
      type="radio"
      name={name}
      id={id}
      onChange={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleOnChange()
      }}
      checked={checked}
      {...p}
    />
  )
}

export default ShippingMethodRadioButton

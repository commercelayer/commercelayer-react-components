import { type JSX, type ReactNode, useContext, useEffect, useState } from "react"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"
import { isEmpty } from "#utils/isEmpty"

interface Props {
  children: ReactNode
  readonly?: boolean
  emptyText?: string
}
export function ShippingMethod(props: Props): JSX.Element {
  const { children, readonly, emptyText = `There are not any shipping method available` } = props
  const { shippingMethods, currentShippingMethodId, deliveryLeadTimes, shipment } =
    useContext(ShipmentChildrenContext)
  const [items, setItems] = useState<JSX.Element[]>([])
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — children and readonly are stable within render cycle
  useEffect(() => {
    const methods = shippingMethods
      ?.filter((s) => {
        if (readonly) return s.id === currentShippingMethodId
        return true
      })
      .map((shippingMethod, k) => {
        const [deliveryLeadTimeForShipment] =
          deliveryLeadTimes?.filter((delivery) => {
            const deliveryShippingMethodId = delivery.shipping_method?.id
            return shippingMethod.id === deliveryShippingMethodId
          }) ?? []
        const shippingProps = {
          shipmentId: shipment?.id,
          shippingMethod,
          currentShippingMethodId,
          deliveryLeadTimeForShipment,
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list — no unique key available on shipping methods
          <ShippingMethodChildrenContext.Provider key={k} value={shippingProps}>
            {children}
          </ShippingMethodChildrenContext.Provider>
        )
      })
    if (methods) setItems(methods)
    return () => {
      setItems([])
    }
  }, [currentShippingMethodId, deliveryLeadTimes, shippingMethods])
  const components = (!isEmpty(items) && items) || emptyText
  return <>{components}</>
}

export default ShippingMethod

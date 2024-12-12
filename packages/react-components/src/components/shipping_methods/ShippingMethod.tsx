import { useContext, type ReactNode, useEffect, useState, type JSX } from 'react';
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import isEmpty from 'lodash/isEmpty'

interface Props {
  children: ReactNode
  readonly?: boolean
  emptyText?: string
}
export function ShippingMethod(props: Props): JSX.Element {
  const {
    children,
    readonly,
    emptyText = `There are not any shipping method available`
  } = props
  const {
    shippingMethods,
    currentShippingMethodId,
    deliveryLeadTimes,
    shipment
  } = useContext(ShipmentChildrenContext)
  const [items, setItems] = useState<JSX.Element[]>([])
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
          deliveryLeadTimeForShipment
        }
        return (
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

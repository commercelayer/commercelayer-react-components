import {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import components from '#config/components'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import isEmpty from 'lodash/isEmpty'
import type { DeliveryLeadTime } from '@commercelayer/sdk'

const propTypes = components.ShippingMethod.propTypes
const displayName = components.ShippingMethod.displayName

type ShippingMethodProps = {
  children: ReactNode
  readonly?: boolean
  emptyText?: string
}

const ShippingMethod: FunctionComponent<ShippingMethodProps> = (props) => {
  const {
    children,
    readonly,
    emptyText = `There are not any shipping method available`,
  } = props
  const {
    shippingMethods,
    currentShippingMethodId,
    deliveryLeadTimes,
    shipment,
  } = useContext(ShipmentChildrenContext)
  const [items, setItems] = useState<JSX.Element[]>([])
  useEffect(() => {
    const methods =
      shippingMethods &&
      shippingMethods
        .filter((s) => {
          if (readonly) return s.id === currentShippingMethodId
          return true
        })
        .map((shippingMethod, k) => {
          const [deliveryLeadTimeForShipment] = deliveryLeadTimes?.filter(
            (delivery) => {
              const deliveryShippingMethodId = delivery.shipping_method?.id
              return shippingMethod.id === deliveryShippingMethodId
            }
          ) as DeliveryLeadTime[]
          const shippingProps = {
            shipmentId: shipment?.id,
            shippingMethod,
            currentShippingMethodId,
            deliveryLeadTimeForShipment,
          }
          return (
            <ShippingMethodChildrenContext.Provider
              key={k}
              value={shippingProps}
            >
              {children}
            </ShippingMethodChildrenContext.Provider>
          )
        })
    if (methods) setItems(methods)
  }, [currentShippingMethodId, deliveryLeadTimes, shippingMethods])
  const components = (!isEmpty(items) && items) || emptyText
  return <Fragment>{components}</Fragment>
}

ShippingMethod.propTypes = propTypes
ShippingMethod.displayName = displayName

export default ShippingMethod

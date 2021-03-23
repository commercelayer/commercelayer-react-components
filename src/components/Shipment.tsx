import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
} from 'react'
import ShipmentContext from '#context/ShipmentContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import components from '#config/components'
import { LineItemCollection } from '@commercelayer/js-sdk'

const propTypes = components.Shipment.propTypes
const displayName = components.Shipment.displayName

type ShipmentProps = {
  children: ReactNode
}

const Shipment: FunctionComponent<ShipmentProps> = ({ children }) => {
  const { shipments, deliveryLeadTimes } = useContext(ShipmentContext)
  const components =
    shipments &&
    shipments.map((shipment, k) => {
      const shipmentLineItems = shipment.shipmentLineItems()?.toArray()
      const lineItems = shipmentLineItems?.map((shipmentLineItem) => {
        const l = shipmentLineItem.lineItem() as LineItemCollection
        if (l) l.quantity = shipmentLineItem.quantity
        return l
      })
      const shippingMethods = shipment.availableShippingMethods()?.toArray()
      const currentShippingMethodId = shipment.shippingMethod()?.id
      const stockTransfers = shipment.stockTransfers()?.toArray()
      const times = deliveryLeadTimes?.filter(
        (time) => time.stockLocation()?.id === shipment.stockLocation()?.id
      )
      const shipmentProps = {
        lineItems,
        shippingMethods,
        currentShippingMethodId,
        stockTransfers,
        deliveryLeadTimes: times,
        shipment,
      }
      return (
        <ShipmentChildrenContext.Provider key={k} value={shipmentProps}>
          {children}
        </ShipmentChildrenContext.Provider>
      )
    })
  return <Fragment>{components}</Fragment>
}

Shipment.propTypes = propTypes
Shipment.displayName = displayName

export default Shipment

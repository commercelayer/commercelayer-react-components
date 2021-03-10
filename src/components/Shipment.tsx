import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
} from 'react'
import ShipmentContext from '#context/ShipmentContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import components from '#config/components'

const propTypes = components.Shipment.propTypes
const displayName = components.Shipment.displayName

type ShipmentProps = {
  children: ReactNode
}

const Shipment: FunctionComponent<ShipmentProps> = ({ children }) => {
  const { shipments } = useContext(ShipmentContext)
  const components =
    shipments &&
    shipments.map((shipment, k) => {
      const shipmentLineItems = shipment.shipmentLineItems()?.toArray()
      const lineItems = shipmentLineItems?.map((shipmentLineItem) =>
        shipmentLineItem.lineItem()
      )
      // @ts-ignore
      const deliveryLeadTime = shipment?.deliveryLeadTime
        ? shipment?.deliveryLeadTime()
        : null
      const shippingMethods = shipment.availableShippingMethods()?.toArray()
      const currentShippingMethodId = shipment.shippingMethod()?.id
      const stockTransfers = shipment.stockTransfers()?.toArray()
      const shipmentProps = {
        lineItems,
        shippingMethods,
        currentShippingMethodId,
        stockTransfers,
        deliveryLeadTime,
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

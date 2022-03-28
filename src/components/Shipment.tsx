import React, {
  Fragment,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import ShipmentContext from '#context/ShipmentContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import components from '#config/components'
import { LoaderType } from '#typings'
import getLoaderComponent from '#utils/getLoaderComponent'
import { ShipmentLineItem } from '#reducers/ShipmentReducer'

const propTypes = components.Shipment.propTypes
const displayName = components.Shipment.displayName

type ShipmentProps = {
  children: ReactNode
  loader?: LoaderType
}

const Shipment: React.FunctionComponent<ShipmentProps> = ({
  children,
  loader = 'Loading...',
}) => {
  const [loading, setLoading] = useState(true)
  const { shipments, deliveryLeadTimes } = useContext(ShipmentContext)
  useEffect(() => {
    if (shipments) setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [shipments])
  const components =
    shipments &&
    shipments.map((shipment, k) => {
      const shipmentLineItems =
        shipment.shipment_line_items as ShipmentLineItem[]
      const lineItems = shipmentLineItems?.map((shipmentLineItem) => {
        const l = shipmentLineItem.line_item
        if (l) l.quantity = shipmentLineItem.quantity
        return l
      })
      const shippingMethods = shipment.available_shipping_methods
      const currentShippingMethodId = shipment.shipping_method?.id
      const stockTransfers = shipment.stock_transfers
      const times = deliveryLeadTimes?.filter(
        (time) => time.stock_location?.id === shipment.stock_location?.id
      )
      const shipmentProps = {
        lineItems,
        shippingMethods,
        currentShippingMethodId,
        stockTransfers,
        deliveryLeadTimes: times,
        shipment,
        keyNumber: k + 1,
      }
      return (
        <ShipmentChildrenContext.Provider key={k} value={shipmentProps}>
          {children}
        </ShipmentChildrenContext.Provider>
      )
    })
  return !loading ? (
    <Fragment>{components}</Fragment>
  ) : (
    getLoaderComponent(loader)
  )
}

Shipment.propTypes = propTypes
Shipment.displayName = displayName

export default Shipment

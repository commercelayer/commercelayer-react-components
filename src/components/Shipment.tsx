import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import ShipmentContext from '#context/ShipmentContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import components from '#config/components'
import { LineItemCollection } from '@commercelayer/js-sdk'
import { LoaderType } from '#typings'
import getLoaderComponent from '#utils/getLoaderComponent'

const propTypes = components.Shipment.propTypes
const displayName = components.Shipment.displayName

type ShipmentProps = {
  children: ReactNode
  loader?: LoaderType
}

const Shipment: FunctionComponent<ShipmentProps> = ({
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

import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Shipment, ShipmentCollection } from '@commercelayer/js-sdk'
import { compact, isEmpty } from 'lodash'

type ShipmentsFilled = (
  shipments: ShipmentCollection[],
  credentials: CommerceLayerConfig
) => Promise<boolean>

export const shipmentsFilled: ShipmentsFilled = async (
  shipments,
  credentials
) => {
  const checking = await Promise.all(
    shipments.map(async (shipment) => {
      return await Shipment.withCredentials(credentials)
        .select('id')
        .includes('shippingMethod')
        .find(shipment.id)
    })
  )
  const filled = compact(
    checking.filter((shipment) => {
      return shipment && !!shipment.shippingMethod()
    })
  )
  return !isEmpty(filled)
}

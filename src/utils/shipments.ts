import { Shipment } from '@commercelayer/sdk'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'

export function shipmentsFilled(shipments: Shipment[]) {
  const filled = compact(
    shipments.filter((shipment) => !isEmpty(shipment.shipping_method))
  )
  return !isEmpty(filled)
}

import { LineItem, Shipment } from '@commercelayer/sdk'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'

export function shipmentsFilled(shipments: Shipment[]) {
  const filled = compact(
    shipments.filter((shipment) => !isEmpty(shipment.shipping_method))
  )
  return !isEmpty(filled)
}

export function isDoNotShip(lineItems?: LineItem[]) {
  const itemDoNotShip: boolean[] = []
  const items = lineItems
    ? lineItems
        .filter(({ item_type }) => item_type === 'skus')
        .map((lineItem) => {
          // @ts-ignore
          if (lineItem.item && lineItem.item?.do_not_ship)
            itemDoNotShip.push(true)
          return lineItem
        })
    : []
  return itemDoNotShip.length > 0 && itemDoNotShip.length === items.length
}

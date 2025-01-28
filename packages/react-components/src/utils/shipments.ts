import type { LineItem, Shipment } from '@commercelayer/sdk'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'

export function shipmentsFilled(shipments: Shipment[]): boolean {
  const filled = compact(
    shipments.filter((shipment) => !isEmpty(shipment.shipping_method))
  )
  return !isEmpty(filled)
}

export function isDoNotShip(lineItems?: LineItem[] | null): boolean {
  const itemDoNotShip: boolean[] = []
  const items = lineItems
    ? lineItems
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .filter(({ item_type }) => item_type === 'skus')
        .map((lineItem) => {
          // @ts-expect-error missing type
          if (lineItem.item?.do_not_ship) {
            itemDoNotShip.push(true)
          }
          return lineItem
        })
    : []
  return itemDoNotShip.length > 0 && itemDoNotShip.length === items.length
}

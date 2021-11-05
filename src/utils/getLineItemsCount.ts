import { LineItem } from '@commercelayer/sdk'

export interface GetLineItemsCountInterface {
  (lineItems: LineItem[], quantity?: number): number
}

const getLineItemsCount: GetLineItemsCountInterface = (
  lineItems,
  quantity = 0
) => {
  const typeAccept = ['skus', 'gift_cards']
  lineItems
    .filter((l) => l.item_type && typeAccept.includes(l.item_type))
    .forEach((l) => {
      if (l.quantity) quantity += l.quantity
    })
  return quantity
}

export default getLineItemsCount

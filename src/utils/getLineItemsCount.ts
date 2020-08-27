import { LineItemCollection } from '@commercelayer/js-sdk'

export interface GetLineItemsCountInterface {
  (lineItems: LineItemCollection[], quantity?: number): number
}

const getLineItemsCount: GetLineItemsCountInterface = (
  lineItems,
  quantity = 0
) => {
  const typeAccept = ['skus', 'gift_cards']
  lineItems
    .filter((l) => typeAccept.includes(l.itemType))
    .map((l) => {
      quantity += l.quantity
    })
  return quantity
}

export default getLineItemsCount

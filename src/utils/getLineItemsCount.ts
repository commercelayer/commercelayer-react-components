import { LineItemCollection } from '@commercelayer/js-sdk'

export interface GetLineItemsCountInterface {
  (lineItems: LineItemCollection[], quantity?: number): number
}

const getLineItemsCount: GetLineItemsCountInterface = (
  lineItems,
  quantity = 0
) => {
  lineItems.map(l => {
    quantity += l.quantity
  })
  return quantity
}

export default getLineItemsCount

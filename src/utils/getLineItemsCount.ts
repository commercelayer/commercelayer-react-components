import { LineItem } from '@commercelayer/sdk'
import { LineItemType } from '#typings'

export interface GetLineItemsCountInterface {
  (args: {
    lineItems: LineItem[]
    quantity?: number
    typeAccepted?: TypeAccepted[]
  }): number
}

export type TypeAccepted = Extract<
  LineItemType,
  'skus' | 'gift_cards' | 'bundles' | 'adjustments'
>

const getLineItemsCount: GetLineItemsCountInterface = ({
  lineItems,
  quantity = 0,
  typeAccepted = ['skus', 'gift_cards', 'bundles', 'adjustments'],
}) => {
  lineItems
    .filter(
      (l) => l.item_type && typeAccepted.includes(l.item_type as TypeAccepted)
    )
    .forEach((l) => {
      if (l.quantity) quantity += l.quantity
    })
  return quantity
}

export default getLineItemsCount

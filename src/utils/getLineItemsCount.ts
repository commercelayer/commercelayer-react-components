import { LineItem } from '@commercelayer/sdk'
import { LineItemType } from '#typings'

export interface GetLineItemsCountInterface {
  (lineItems: LineItem[], quantity?: number): number
}

type TypeAccepted = Extract<
  LineItemType,
  'skus' | 'gift_cards' | 'bundles' | 'adjustments'
>

const getLineItemsCount: GetLineItemsCountInterface = (
  lineItems,
  quantity = 0
) => {
  const typeAccepted: TypeAccepted[] = [
    'skus',
    'gift_cards',
    'bundles',
    'adjustments',
  ]
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

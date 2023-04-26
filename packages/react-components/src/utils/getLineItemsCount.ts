import type { TLineItem } from '#components/line_items/LineItem'
import type { LineItem } from '@commercelayer/sdk'

export type TypeAccepted = Extract<
  TLineItem,
  'skus' | 'gift_cards' | 'bundles' | 'adjustments'
>

interface Args {
  lineItems: LineItem[]
  quantity?: number
  typeAccepted?: TypeAccepted[]
}

export default function getLineItemsCount({
  lineItems,
  quantity = 0,
  typeAccepted = ['skus', 'gift_cards', 'bundles', 'adjustments']
}: Args): number {
  lineItems
    .filter(
      (l) =>
        typeAccepted.includes(l.item_type as TypeAccepted) &&
        l?.total_amount_cents != null &&
        l?.total_amount_cents >= 0
    )
    .forEach((l) => {
      if (l.quantity) quantity += l.quantity
    })
  return quantity
}

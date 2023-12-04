import { useContext } from 'react'
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext, {
  type InitialLineItemChildrenContext
} from '#context/LineItemChildrenContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import LineItemBundleChildrenContext, {
  type InitialLineItemBundleChildrenContext
} from '#context/LineItemBundleChildrenContext'

export type TLineItem =
  | 'gift_cards'
  | 'payment_methods'
  | 'promotions'
  | 'shipments'
  | 'skus'
  | 'bundles'
  | 'adjustments'

interface Props {
  children: JSX.Element | JSX.Element[]
  type?: TLineItem
}

export function LineItem(props: Props): JSX.Element {
  const { type = 'skus', children } = props
  const { lineItems } = useContext(LineItemContext)
  const { lineItems: shipmentLineItems } = useContext(ShipmentChildrenContext)
  const items =
    shipmentLineItems && shipmentLineItems?.length > 0
      ? shipmentLineItems
      : lineItems
  const components = items
    ?.filter((l) => l?.item_type === type)
    .map((lineItem) => {
      if (lineItem?.item_type === 'bundles') {
        const skuListItems = lineItem?.bundle?.sku_list?.sku_list_items
        const skuListItemsProps: InitialLineItemBundleChildrenContext = {
          skuListItems,
          lineItem
        }
        return (
          <LineItemBundleChildrenContext.Provider
            key={lineItem?.id}
            value={skuListItemsProps}
          >
            {children}
          </LineItemBundleChildrenContext.Provider>
        )
      }
      if (
        lineItem?.item_type === 'gift_cards' &&
        lineItem?.total_amount_cents &&
        lineItem?.total_amount_cents <= 0
      ) {
        return null
      }
      const lineProps: InitialLineItemChildrenContext = {
        lineItem
      }
      return (
        <LineItemChildrenContext.Provider key={lineItem?.id} value={lineProps}>
          {children}
        </LineItemChildrenContext.Provider>
      )
    })
  return <>{components}</>
}

export default LineItem

import { useContext, type JSX } from 'react';
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext, {
  type InitialLineItemChildrenContext
} from '#context/LineItemChildrenContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

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
    .map((lineItem, k, check) => {
      if (
        lineItem?.item_type === 'bundles' &&
        k > 0 &&
        check[k - 1]?.bundle_code === lineItem.bundle_code
      )
        return null
      if (
        lineItem?.item_type === 'gift_cards' &&
        lineItem?.total_amount_cents &&
        lineItem?.total_amount_cents <= 0
      )
        return null
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

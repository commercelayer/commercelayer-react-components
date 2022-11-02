import { useContext } from 'react'
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import { LineItemType } from '#typings'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

interface Props {
  children: JSX.Element | JSX.Element[]
  type?: LineItemType
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
    ?.filter((l) => l.item_type === type)
    .map((lineItem, k, check) => {
      if (
        lineItem.item_type === 'bundles' &&
        k > 0 &&
        check[k - 1]?.bundle_code === lineItem.bundle_code
      )
        return null
      if (
        lineItem.item_type === 'gift_cards' &&
        lineItem?.total_amount_cents &&
        lineItem?.total_amount_cents <= 0
      )
        return null
      const lineProps = {
        lineItem
      }
      return (
        <LineItemChildrenContext.Provider key={k} value={lineProps}>
          {children}
        </LineItemChildrenContext.Provider>
      )
    })
  return <>{components}</>
}

export default LineItem

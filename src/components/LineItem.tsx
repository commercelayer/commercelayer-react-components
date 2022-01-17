import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
} from 'react'
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import components from '#config/components'
import { LineItemType } from '#typings'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import { isEmpty } from 'lodash'

const propTypes = components.LineItem.propTypes
const displayName = components.LineItem.displayName

type LineItemProps = {
  children: ReactNode
  type?: LineItemType
}

const LineItem: FunctionComponent<LineItemProps> = (props) => {
  const { type = 'skus', children } = props
  const { lineItems } = useContext(LineItemContext)
  const { lineItems: shipmentLineItems } = useContext(ShipmentChildrenContext)
  const items = isEmpty(shipmentLineItems) ? lineItems : shipmentLineItems
  const components =
    items &&
    items
      .filter((l) => l.item_type === type)
      .map((lineItem, k, check) => {
        if (
          lineItem.item_type === 'bundles' &&
          k > 0 &&
          check[k - 1].bundle_code === lineItem.bundle_code
        )
          return null
        const lineProps = {
          lineItem,
        }
        return (
          <LineItemChildrenContext.Provider key={k} value={lineProps}>
            {children}
          </LineItemChildrenContext.Provider>
        )
      })
  return <Fragment>{components}</Fragment>
}

LineItem.propTypes = propTypes
LineItem.displayName = displayName

export default LineItem

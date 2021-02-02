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
import _ from 'lodash'

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
  const items = _.isEmpty(shipmentLineItems) ? lineItems : shipmentLineItems
  const components =
    items &&
    items
      .filter((l) => l.itemType === type)
      .map((lineItem, k) => {
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
LineItem.defaultProps = {
  type: 'skus',
}

export default LineItem

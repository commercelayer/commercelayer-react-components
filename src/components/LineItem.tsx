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

const propTypes = components.LineItem.propTypes
const displayName = components.LineItem.displayName

type LineItemProps = {
  children: ReactNode
  type?: LineItemType
}

const LineItem: FunctionComponent<LineItemProps> = (props) => {
  const { type = 'skus' } = props
  const { lineItems } = useContext(LineItemContext)
  const components =
    lineItems &&
    lineItems
      .filter((l) => l.itemType === type)
      .map((lineItem, k) => {
        const lineProps = {
          lineItem,
        }
        return (
          <LineItemChildrenContext.Provider key={k} value={lineProps}>
            {props.children}
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

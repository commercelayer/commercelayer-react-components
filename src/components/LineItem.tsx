import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode
} from 'react'
import LineItemContext from '../context/LineItemContext'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import PropTypes from 'prop-types'

type LineItemType = 'skus' | 'gift_cards'

export interface LineItemProps {
  children?: ReactNode
  type?: LineItemType
}

const LineItem: FunctionComponent<LineItemProps> = props => {
  const { type } = props
  const { lineItems } = useContext(LineItemContext)
  const items = lineItems
    .filter(l => l.itemType === type)
    .map((lineItem, k) => {
      const lineProps = {
        lineItem
      }
      return (
        <LineItemChildrenContext.Provider key={k} value={lineProps}>
          {props.children}
        </LineItemChildrenContext.Provider>
      )
    })
  return <Fragment>{items}</Fragment>
}

LineItem.defaultProps = {
  type: 'skus'
}

LineItem.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf<LineItemType>(['skus', 'gift_cards'])
}

export default LineItem

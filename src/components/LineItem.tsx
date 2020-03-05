import React, { FunctionComponent, Fragment, useContext } from 'react'
import LineItemContext from '../context/LineItemContext'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import PropTypes, { InferProps } from 'prop-types'

type LineItemType = 'skus' | 'gift_cards'

const LIProps = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf<LineItemType>(['skus', 'gift_cards'])
}

export type LineItemProps = InferProps<typeof LIProps>

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

LineItem.propTypes = LIProps

export default LineItem

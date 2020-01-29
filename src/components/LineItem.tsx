import React, {
  FunctionComponent,
  Fragment,
  ReactElement,
  useContext,
  ReactNode
} from 'react'
import { LineItemPriceProps } from './LineItemPrice'
import { LineItemImageProps } from './LineItemImage'
import LineItemContext from './context/LineItemContext'
import LineItemChildrenContext from './context/LineItemChildrenContext'

export interface LineItemProps {
  children?: ReactNode
  type?: 'skus' | 'gift_cards'
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

export default LineItem

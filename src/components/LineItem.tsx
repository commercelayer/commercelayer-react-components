import React, {
  FunctionComponent,
  Fragment,
  ReactElement,
  useContext
} from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import Parent from './utils/Parent'
import { LineItemPriceProps } from './LineItemPrice'
import { LineItemImageProps } from './LineItemImage'
import LineItemContext from './context/LineItemContext'
import LineItemChildrenContext from './context/LineItemChildrenContext'

export interface LineItemProps {
  children?: ReactElement<LineItemPriceProps | LineItemImageProps>[] // TODO: set type
  type?: 'skus' | 'gift_cards'
}

const LineItem: FunctionComponent<LineItemProps> = props => {
  const { type } = props
  const { lineItems } = useContext(LineItemContext)
  console.log('lineItems', lineItems)
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

import React, { FunctionComponent, Fragment, ReactElement } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import Parent from './utils/Parent'
import { LineItemPriceProps } from './LineItemPrice'
import { LineItemImageProps } from './LineItemImage'

export interface LineItemProps {
  children?: ReactElement<LineItemPriceProps | LineItemImageProps>[] // TODO: set type
  lineItems?: LineItemCollection[]
  type?: 'skus' | 'gift_cards'
}

const LineItem: FunctionComponent<LineItemProps> = props => {
  const { type } = props
  const items = props.lineItems
    .filter(l => l.itemType === type)
    .map((lineItem, i) => {
      const lineProps = {
        lineItem,
        ...props
      }
      return (
        <Parent key={i} {...lineProps}>
          {props.children}
        </Parent>
      )
    })
  return <Fragment>{items}</Fragment>
}

LineItem.defaultProps = {
  type: 'skus'
}

export default LineItem

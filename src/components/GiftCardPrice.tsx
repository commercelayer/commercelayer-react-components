import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { BaseOrderComponentProps, BOCProps } from './utils/BaseOrderPrice'

export type GiftCardPriceProps = BaseOrderComponentProps

const GiftCardPrice: FunctionComponent<GiftCardPriceProps> = props => {
  return <BaseOrderPrice base="amount" type="giftcard" {...props} />
}

GiftCardPrice.propTypes = BOCProps

export default GiftCardPrice

import React, { FunctionComponent } from 'react'
import { BaseComponent } from '../@types/index'
import BaseOrderPrice from './utils/BaseOrderPrice'

export interface GiftCardPriceProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const GiftCardPrice: FunctionComponent<GiftCardPriceProps> = props => {
  return <BaseOrderPrice base="amount" type="giftcard" {...props} />
}

export default GiftCardPrice

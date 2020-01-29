import React, { FunctionComponent } from 'react'
import { GeneralComponent } from '../@types/index'
import GeneralOrderPrice from './utils/GeneralOrderPrice'

export interface GiftCardProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const GiftCard: FunctionComponent<GiftCardProps> = props => {
  return <GeneralOrderPrice base="amount" type="giftcard" {...props} />
}

export default GiftCard

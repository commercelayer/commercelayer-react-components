import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.GiftCardPrice.propTypes
const displayName = components.GiftCardPrice.displayName

export type GiftCardPriceProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const GiftCardPrice: FunctionComponent<GiftCardPriceProps> = (props) => {
  return <BaseOrderPrice base="amount" type="giftcard" {...props} />
}

GiftCardPrice.propTypes = propTypes
GiftCardPrice.displayName = displayName

export default GiftCardPrice

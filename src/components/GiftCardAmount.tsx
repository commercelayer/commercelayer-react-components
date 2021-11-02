import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.GiftCardAmount.propTypes
const displayName = components.GiftCardAmount.displayName

const GiftCardAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="gift_card" {...props} />
}

GiftCardAmount.propTypes = propTypes
GiftCardAmount.displayName = displayName

export default GiftCardAmount

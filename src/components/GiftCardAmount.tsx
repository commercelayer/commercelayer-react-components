import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.GiftCardAmount.propTypes
const displayName = components.GiftCardAmount.displayName

export type GiftCardAmountProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const GiftCardAmount: FunctionComponent<GiftCardAmountProps> = (props) => {
  return <BaseOrderPrice base="amount" type="giftcard" {...props} />
}

GiftCardAmount.propTypes = propTypes
GiftCardAmount.displayName = displayName

export default GiftCardAmount

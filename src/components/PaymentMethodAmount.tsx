import { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.PaymentMethodAmount.propTypes
const defaultProps = components.PaymentMethodAmount.defaultProps
const displayName = components.PaymentMethodAmount.displayName

const PaymentMethodAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="payment_method" {...props} />
}

PaymentMethodAmount.propTypes = propTypes
PaymentMethodAmount.defaultProps = defaultProps
PaymentMethodAmount.displayName = displayName

export default PaymentMethodAmount

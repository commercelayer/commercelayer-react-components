import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.PaymentMethodAmount.propTypes
const defaultProps = components.PaymentMethodAmount.defaultProps
const displayName = components.PaymentMethodAmount.displayName

export function PaymentMethodAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="payment_method" {...props} />
}

PaymentMethodAmount.propTypes = propTypes
PaymentMethodAmount.defaultProps = defaultProps
PaymentMethodAmount.displayName = displayName

export default PaymentMethodAmount

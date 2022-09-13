import { PaypalConfig } from '#components/payment_sources/PaypalPayment'
import {
  PaymentResource,
  PaymentMethodConfig,
  getPaymentConfig,
} from '#reducers/PaymentMethodReducer'
import pick from 'lodash/pick'

export default function getPaypalConfig(
  paymentResource: PaymentResource,
  config: PaymentMethodConfig
): Pick<PaypalConfig, 'return_url' | 'cancel_url'> | undefined {
  const attributes = getPaymentConfig<'paypalPayment'>(paymentResource, config)
  return attributes && pick(attributes, ['return_url', 'cancel_url'])
}

import Parent from '#components/utils/Parent'
import { ChildrenFunction } from '#typings/index'
import type { StripeElementLocale } from '@stripe/stripe-js'
import { PaymentSourceProps } from './PaymentSource'

export interface ExternalPaymentConfig {
  /**
   * Show the component
   */
  show: boolean
  /**
   * Use to display information about the external payment or whatever else.
   */
  customComponent?: ChildrenFunction<Omit<Props, 'customComponent'>>
}

interface Props
  extends ExternalPaymentConfig,
    Pick<PaymentSourceProps, 'templateCustomerSaveToWallet'> {
  paymentSourceToken: string
  locale?: StripeElementLocale
}

export function ExternalPayment(props: Props): JSX.Element | null {
  return props?.customComponent != null && props.show ? (
    <>
      <Parent>{props.customComponent}</Parent>
      {props?.templateCustomerSaveToWallet != null && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {props.templateCustomerSaveToWallet}
        </Parent>
      )}
    </>
  ) : null
}

export default ExternalPayment

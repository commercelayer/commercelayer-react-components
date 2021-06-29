import PaymentMethodContext from '#context/PaymentMethodContext'
import { SetPaymentSourceResponse } from '#reducers/PaymentMethodReducer'
import isFunction from 'lodash/isFunction'
import React, { FunctionComponent, ReactNode, useContext } from 'react'

export type PaypalConfig = {
  returnUrl: string
  cancelUrl: string
  infoMessage?: {
    text?: string | ReactNode
    className?: string
  }
  submitButton?: {
    label?: string | ReactNode
    onClick?: (response?: SetPaymentSourceResponse) => void
    className?: string
    containerClassName?: string
  }
}

const defaultMessage =
  'by placing the order, you will be redirected to the PayPal website to sign in and authorize the payment'
const defaultLabel = 'Set payment method'

type Props = Omit<PaypalConfig, 'returnUrl' | 'cancelUrl'> &
  JSX.IntrinsicElements['div']
const PaypalPayment: FunctionComponent<Props> = ({
  infoMessage,
  submitButton,
  ...p
}) => {
  const { setPaymentSource, paymentSource, currentPaymentMethodType } =
    useContext(PaymentMethodContext)
  const handleClick = async () => {
    if (paymentSource && currentPaymentMethodType) {
      const source = await setPaymentSource({
        paymentSourceId: paymentSource.id,
        paymentResource: currentPaymentMethodType,
        attributes: {
          metadata: {
            card: {
              id: paymentSource.id,
              brand: 'paypal',
              last4: '',
            },
          },
        },
      })
      submitButton?.onClick && submitButton?.onClick(source)
    }
  }
  return (
    <div {...p}>
      <span className={infoMessage?.className}>
        {isFunction(infoMessage?.text)
          ? infoMessage?.text()
          : infoMessage?.text || defaultMessage}
      </span>
      <div className={submitButton?.containerClassName}>
        <button className={submitButton?.className} onClick={handleClick}>
          {isFunction(submitButton?.label)
            ? submitButton?.label()
            : submitButton?.label || defaultLabel}
        </button>
      </div>
    </div>
  )
}

export default PaypalPayment

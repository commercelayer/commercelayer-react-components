import PaymentMethodContext from '#context/PaymentMethodContext'
import { SetPaymentSourceResponse } from '#reducers/PaymentMethodReducer'
import isFunction from 'lodash/isFunction'
import React, { FunctionComponent, ReactNode, useContext } from 'react'

export type WireTransferConfig = {
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
  'after placing the order, you will need to manually complete the payment with your bank'
const defaultLabel = 'Set payment method'

type Props = WireTransferConfig & JSX.IntrinsicElements['div']
const WireTransferPayment: FunctionComponent<Props> = ({
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
              brand: 'wire-transfer',
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

export default WireTransferPayment

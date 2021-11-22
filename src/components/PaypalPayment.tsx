import PaymentMethodContext from '#context/PaymentMethodContext'
import isFunction from 'lodash/isFunction'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'

export type PaypalConfig = {
  return_url: string
  cancel_url: string
  infoMessage?: {
    text?: string | ReactNode
    className?: string
  }
}

const defaultMessage =
  'by placing the order, you will be redirected to the PayPal website to sign in and authorize the payment'

type Props = Omit<PaypalConfig, 'return_url' | 'cancel_url'> &
  JSX.IntrinsicElements['div']
const PaypalPayment: FunctionComponent<Props> = ({ infoMessage, ...p }) => {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (
      ref.current &&
      paymentSource &&
      currentPaymentMethodType &&
      // @ts-ignore
      paymentSource?.approvalUrl
    ) {
      ref.current.onsubmit = () => handleClick()
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, paymentSource, currentPaymentMethodType])
  const handleClick = async () => {
    if (paymentSource && currentPaymentMethodType) {
      try {
        await setPaymentSource({
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
        return true
      } catch (e) {
        return false
      }
    }
    return false
  }
  return (
    <form ref={ref}>
      <div {...p}>
        <span className={infoMessage?.className}>
          {isFunction(infoMessage?.text)
            ? infoMessage?.text()
            : infoMessage?.text || defaultMessage}
        </span>
      </div>
    </form>
  )
}

export default PaypalPayment

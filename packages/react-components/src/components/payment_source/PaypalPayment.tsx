import PaymentMethodContext from '#context/PaymentMethodContext'
import isFunction from 'lodash/isFunction'
import { type ReactNode, useContext, useEffect, useRef, type JSX } from 'react';

export interface PaypalConfig {
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
export function PaypalPayment({
  infoMessage,
  ...p
}: Props): JSX.Element | null {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentRef
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (
      ref.current &&
      paymentSource &&
      currentPaymentMethodType &&
      // @ts-expect-error no type
      paymentSource?.approval_url
    ) {
      ref.current.onsubmit = async () => {
        return await handleClick()
      }
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, paymentSource, currentPaymentMethodType])
  const handleClick = async (): Promise<boolean> => {
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
                last4: ''
              }
            }
          }
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

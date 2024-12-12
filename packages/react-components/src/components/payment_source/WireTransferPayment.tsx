import PaymentMethodContext from '#context/PaymentMethodContext'
import { useContext, useEffect, useRef, type JSX } from 'react';

export interface WireTransferConfig {
  infoMessage?: {
    text?: string | JSX.Element[]
    className?: string
  }
}

const defaultMessage =
  'after placing the order, you will need to manually complete the payment with your bank'

type Props = WireTransferConfig &
  JSX.IntrinsicElements['div'] & { 'data-testid'?: string }

export function WireTransferPayment({ infoMessage, ...p }: Props): JSX.Element {
  const { className, 'data-testid': dataTestId } = p
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentRef
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (ref.current && paymentSource && currentPaymentMethodType) {
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
                brand: 'wire-transfer',
                last4: ''
              }
            }
          }
        })
        return true
      } catch (error) {
        return false
      }
    }
    return false
  }
  return (
    <form ref={ref}>
      <div className={className} data-testid={dataTestId}>
        <span className={infoMessage?.className}>
          {infoMessage?.text ?? defaultMessage}
        </span>
      </div>
    </form>
  )
}

export default WireTransferPayment

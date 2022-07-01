import PaymentMethodContext from '#context/PaymentMethodContext'
import isFunction from 'lodash/isFunction'
import { ReactNode, useContext, useEffect, useRef } from 'react'

export type WireTransferConfig = {
  infoMessage?: {
    text?: string | ReactNode
    className?: string
  }
}

const defaultMessage =
  'after placing the order, you will need to manually complete the payment with your bank'

type Props = WireTransferConfig & JSX.IntrinsicElements['div']
export function WireTransferPayment({ infoMessage, ...p }: Props) {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (ref.current && paymentSource && currentPaymentMethodType) {
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
                brand: 'wire-transfer',
                last4: '',
              },
            },
          },
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

export default WireTransferPayment

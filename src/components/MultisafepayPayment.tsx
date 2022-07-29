import isFunction from "lodash/isFunction"
import { FunctionComponent, useContext, useEffect, useRef, ReactNode } from "react"

import PaymentMethodContext from "#context/PaymentMethodContext"

type MultisafepayGatewayType =
  | "AFTERPAY"
  | "APPLEPAY"
  | "BANKTRANS"
  | "BELFIUS"
  | "CBC"
  | "CREDITCARD"
  | "DIRECTBANK"
  | "DOTPAY"
  | "GOOGLEPAY"
  | "IDEAL"
  | "IDEALQR"
  | "KBC"
  | "MISTERCASH"
  | "TRUSTLY"
  | "VVVGIFTCARD"

export type MultisafepayConfig = {
  return_url: string
  cancel_url: string
  infoMessage?: {
    text?: string | ReactNode
    className?: string
  }
}

const defaultMessage =
  "by placing the order, you will be redirected to a Multisafepay page to authorize the payment"

type Props = Omit<MultisafepayConfig, "return_url" | "cancel_url"> &
  JSX.IntrinsicElements["div"]
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      paymentSource?.approval_url
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
                brand: "mastercard",
                last4: "",
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

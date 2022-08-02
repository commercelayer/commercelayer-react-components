import isFunction from "lodash/isFunction"
import { FunctionComponent, useContext, useEffect, useRef, ReactNode } from "react"

import PaymentMethodContext from "#context/PaymentMethodContext"

export type MultisafepayConfig = {
  infoMessage?: {
    text?: string | ReactNode
    className?: string
  }
}

const defaultMessage =
  "by placing the order, you will be redirected to a Multisafepay page to authorize the payment"

type Props = MultisafepayConfig &
  JSX.IntrinsicElements["div"]
const PaypalPayment: FunctionComponent<Props> = ({ infoMessage, ...p }) => {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    //setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (
      ref.current &&
      //paymentSource &&
      currentPaymentMethodType 
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      //paymentSource?.approval_url
    ) {
      console.log("Current payment method type", currentPaymentMethodType)
      ref.current.onsubmit = () => handleClick()
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, paymentSource, currentPaymentMethodType])
  const handleClick = async () => {
    //if (paymentSource && currentPaymentMethodType) {
      // try {
      //   await setPaymentSource({
      //     paymentSourceId: paymentSource.id,
      //     paymentResource: currentPaymentMethodType,
      //     attributes: {
      //       payment_source_token: "xxx.yyy.zzz",
      //       metadata: {
      //         card: {
      //           id: paymentSource.id,
      //           brand: "mastercard",
      //           last4: "",
      //         },
      //       },
      //     },
      //   })
      //   return true
      // } catch (e) {
      //   return false
      // }
    //}
    //return false
    return true
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

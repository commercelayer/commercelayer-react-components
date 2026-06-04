import PaymentMethodContext from "#context/PaymentMethodContext"
import { type ReactNode, useContext, useEffect, useRef, type JSX } from "react"

export interface PaypalConfig {
  return_url: string
  cancel_url: string
  infoMessage?: {
    text?: string | ReactNode | (() => ReactNode)
    className?: string
  }
}

const defaultMessage =
  "by placing the order, you will be redirected to the PayPal website to sign in and authorize the payment"

type Props = Omit<PaypalConfig, "return_url" | "cancel_url"> & JSX.IntrinsicElements["div"]
export function PaypalPayment({ infoMessage, ...p }: Props): JSX.Element | null {
  const ref = useRef<null | HTMLFormElement>(null)
  const { setPaymentSource, paymentSource, currentPaymentMethodType, setPaymentRef } =
    useContext(PaymentMethodContext)
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
                brand: "paypal",
                last4: "",
              },
            },
          },
        })
        return true
      } catch {
        return false
      }
    }
    return false
  }
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleClick intentionally included in deps
  }, [paymentSource, currentPaymentMethodType, setPaymentRef, handleClick])
  return (
    <form ref={ref}>
      <div {...p}>
        <span className={infoMessage?.className}>
          {typeof infoMessage?.text === "function"
            ? infoMessage?.text()
            : infoMessage?.text || defaultMessage}
        </span>
      </div>
    </form>
  )
}

export default PaypalPayment

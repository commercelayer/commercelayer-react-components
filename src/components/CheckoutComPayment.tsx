import React, {
  FunctionComponent,
  // SyntheticEvent,
  // useContext,
  useEffect,
  // useRef,
  // useState,
} from 'react'
// import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentMethodConfig } from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
import useExternalScript from '#utils/hooks/useExternalScript'
const scriptUrl = 'https://cdn.checkout.com/js/framesv2.min.js'
// import Parent from './utils/Parent'
// import OrderContext from '#context/OrderContext'
// import { setCustomerOrderParam } from '#utils/localStorage'

export type CheckoutComConfig = {
  containerClassName?: string
  hintLabel?: string
  name?: string
  // options?: StripeCardElementOptions
  [key: string]: unknown
}

// type StripePaymentFormProps = {
//   options?: StripeCardElementOptions
//   templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
// }

// const defaultOptions = {
//   style: {
//     base: {
//       fontSize: '16px',
//       color: '#424770',
//       '::placeholder': {
//         color: '#aab7c4',
//       },
//     },
//     invalid: {
//       color: '#9e2146',
//     },
//   },
//   hidePostalCode: true,
// }

type CheckoutComPaymentProps = PaymentMethodConfig['checkoutComPayment'] &
  JSX.IntrinsicElements['div'] &
  Partial<PaymentSourceProps['templateCustomerSaveToWallet']> & {
    show?: boolean
    publicKey: string
    locale?: string
  }

const CheckoutComPayment: FunctionComponent<CheckoutComPaymentProps> = ({
  publicKey,
  show,
  options,
  locale = 'auto',
  ...p
}) => {
  const loaded = useExternalScript(scriptUrl)
  const {
    containerClassName,
    // templateCustomerSaveToWallet,
    // fonts = [],
    ...divProps
  } = p
  useEffect(() => {
    // @ts-ignore
    if (loaded && publicKey) window.Frames.init(publicKey)
  }, [loaded, publicKey])

  return loaded ? (
    <div className={containerClassName} {...divProps}>
      <div className="card-frame"></div>
    </div>
  ) : null
}

export default CheckoutComPayment

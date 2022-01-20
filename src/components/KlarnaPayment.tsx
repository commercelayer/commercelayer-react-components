import React, {
  FunctionComponent,
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import {
  StripeCardElementOptions,
  StripeElementLocale,
} from '@stripe/stripe-js'
import { PaymentMethodConfig } from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
import Parent from './utils/Parent'
import OrderContext from '#context/OrderContext'
import { setCustomerOrderParam } from '#utils/localStorage'
import useExternalScript from '#utils/hooks/useExternalScript'

export type KlarnaConfig = {
  // containerClassName?: string
  // hintLabel?: string
  // name?: string
  // options?: StripeCardElementOptions
  [key: string]: any
}

// type KlarnaPaymentFormProps = {
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

// const StripePaymentForm: FunctionComponent<KlarnaPaymentFormProps> = ({
//   options = defaultOptions,
//   templateCustomerSaveToWallet,
// }) => {
//   const ref = useRef<null | HTMLFormElement>(null)
//   const {
//     setPaymentSource,
//     paymentSource,
//     currentPaymentMethodType,
//     setPaymentMethodErrors,
//     setPaymentRef,
//   } = useContext(PaymentMethodContext)
//   const { order } = useContext(OrderContext)
//   const stripe = useStripe()
//   const elements = useElements()
//   useEffect(() => {
//     if (ref.current && stripe && elements) {
//       ref.current.onsubmit = () =>
//         onSubmit(ref.current as any, stripe, elements)
//       setPaymentRef({ ref })
//     }
//     return () => {
//       setPaymentRef({ ref: { current: null } })
//     }
//   }, [ref, stripe, elements])
//   const onSubmit = async (
//     event: SyntheticEvent<HTMLFormElement>,
//     stripe: any,
//     elements: any
//   ): Promise<boolean> => {
//     if (!stripe) return false

//     const savePaymentSourceToCustomerWallet =
//       // @ts-ignore
//       event?.elements?.['save_payment_source_to_customer_wallet']?.checked
//     if (savePaymentSourceToCustomerWallet)
//       setCustomerOrderParam(
//         '_save_payment_source_to_customer_wallet',
//         savePaymentSourceToCustomerWallet
//       )

//     const cardElement = elements && elements.getElement(CardElement)
//     if (cardElement) {
//       const billingInfo = order?.billing_address
//       const email = order?.customer_email
//       const billing_details = {
//         name: billingInfo?.full_name,
//         email,
//         phone: billingInfo?.phone,
//         address: {
//           city: billingInfo?.city,
//           country: billingInfo?.country_code,
//           line1: billingInfo?.line_1,
//           postal_code: billingInfo?.zip_code,
//           state: billingInfo?.state_code,
//         },
//       }
//       const { paymentMethod } = await stripe.createPaymentMethod({
//         type: 'card',
//         card: cardElement,
//         billing_details,
//       })
//       // @ts-ignore
//       if (paymentSource?.client_secret) {
//         const { error, paymentIntent } = await stripe.confirmCardPayment(
//           // @ts-ignore
//           paymentSource.client_secret,
//           {
//             payment_method: {
//               card: cardElement,
//               billing_details,
//             },
//           }
//         )
//         if (error) {
//           console.error(error)
//           setPaymentMethodErrors([
//             {
//               code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
//               resource: 'payment_methods',
//               field: currentPaymentMethodType,
//               message: error.message as string,
//             },
//           ])
//         } else {
//           if (
//             paymentIntent &&
//             paymentMethod &&
//             paymentSource &&
//             currentPaymentMethodType
//           ) {
//             try {
//               await setPaymentSource({
//                 paymentSourceId: paymentSource.id,
//                 paymentResource: currentPaymentMethodType,
//                 attributes: {
//                   options: {
//                     ...(paymentMethod as Record<string, any>),
//                     setup_future_usage: 'off_session',
//                   },
//                 },
//               })
//               return true
//             } catch (e) {
//               return false
//             }
//           }
//         }
//       }
//     }
//     return false
//   }

//   return (
//     <form ref={ref} onSubmit={(e) => onSubmit(e, stripe, elements)}>
//       <CardElement options={{ ...defaultOptions, ...options }} />
//       {templateCustomerSaveToWallet && (
//         <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
//           {templateCustomerSaveToWallet}
//         </Parent>
//       )}
//     </form>
//   )
// }

type KlarnaPaymentProps = PaymentMethodConfig['klarnaPayment'] &
  JSX.IntrinsicElements['div'] &
  Partial<PaymentSourceProps['templateCustomerSaveToWallet']> & {
    show?: boolean
    clientToken: string
    locale?: string
  }

export default function KlarnaPayment({
  clientToken,
  show,
  options,
  locale = 'auto',
  ...p
}: KlarnaPaymentProps) {
  const loaded = useExternalScript('https://x.klarnacdn.net/kp/lib/v1/api.js')
  console.log('loaded', loaded)
  // const [isLoaded, setIsLoaded] = useState(false)
  // const [stripe, setStripe] = useState(null)
  // const {
  //   containerClassName,
  //   templateCustomerSaveToWallet,
  //   fonts = [],
  //   ...divProps
  // } = p
  return null
}

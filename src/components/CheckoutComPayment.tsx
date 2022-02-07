import React, {
  FunctionComponent,
  useContext,
  // SyntheticEvent,
  // useContext,
  useEffect,
  useRef,
  // useRef,
  // useState,
} from 'react'
// import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  PaymentMethodConfig,
  setPaymentMethodErrors,
} from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
import useExternalScript from '#utils/hooks/useExternalScript'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { Frames, CardNumber, ExpiryDate, Cvv } from 'frames-react'
import OrderContext from '#context/OrderContext'
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
  const ref = useRef<null | HTMLFormElement>(null)
  const loaded = useExternalScript(scriptUrl)
  const {
    setPaymentRef,
    currentPaymentMethodType,
    paymentSource,
    setPaymentSource,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const {
    containerClassName,
    // templateCustomerSaveToWallet,
    // fonts = [],
    ...divProps
  } = p
  const handleClick = async (): Promise<boolean> => {
    if (window.Frames) {
      window.Frames.cardholder = {
        name: order?.billing_address?.full_name,
        billingAddress: {
          addressLine1: order?.billing_address?.line_1,
          addressLine2: order?.billing_address?.line_2,
          zip: order?.billing_address?.zip_code,
          city: order?.billing_address?.city,
          state: order?.billing_address?.state_code,
          country: order?.billing_address?.country_code,
        },
        phone: order?.billing_address?.phone,
      }
      try {
        const data = await window.Frames.submitCard()
        console.log('data', data)
        if (data.token && paymentSource && currentPaymentMethodType) {
          await setPaymentSource({
            paymentSourceId: paymentSource.id,
            paymentResource: currentPaymentMethodType,
            attributes: {
              token: data.token,
              payment_type: 'token',
              // _details: true,
            },
          })
          debugger
          // return true
        }
      } catch (error) {
        console.error(error)
        debugger
        // setPaymentMethodErrors([
        //   {
        //     code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
        //     resource: 'payment_methods',
        //     field: currentPaymentMethodType,
        //     message: error?.message as string,
        //   },
        // ])
      }
    }
    return false
  }
  return loaded ? (
    <form ref={ref}>
      <div className={containerClassName} {...divProps}>
        <Frames
          config={{
            debug: true,
            publicKey,
            // localization: {
            //   cardNumberPlaceholder: 'Card number',
            //   expiryMonthPlaceholder: 'MM',
            //   expiryYearPlaceholder: 'YY',
            //   cvvPlaceholder: 'CVV',
            // },
            // style: {
            //   base: {
            //     fontSize: '17px',
            //   },
            // },
          }}
          cardValidationChanged={(e) => {
            if (e.isValid && ref.current) {
              ref.current.onsubmit = () => handleClick()
              setPaymentRef({ ref })
            }
          }}
          cardTokenized={(data) => data}
          cardBinChanged={(e) => {
            // debugger
          }}
        >
          <CardNumber />
          <ExpiryDate />
          <Cvv />
        </Frames>
      </div>
    </form>
  ) : null
}

export default CheckoutComPayment

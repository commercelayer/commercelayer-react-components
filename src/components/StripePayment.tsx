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
  Stripe,
  StripeCardElementOptions,
  StripeElementLocale,
} from '@stripe/stripe-js'
import { PaymentMethodConfig } from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
import Parent from './utils/Parent'
import OrderStorageContext from '#context/OrderStorageContext'
import OrderContext from '#context/OrderContext'

export type StripeConfig = {
  containerClassName?: string
  hintLabel?: string
  name?: string
  options?: StripeCardElementOptions
  [key: string]: any
}

type StripePaymentFormProps = {
  options?: StripeCardElementOptions
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
}

const defaultOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
}

const StripePaymentForm: FunctionComponent<StripePaymentFormProps> = ({
  options = defaultOptions,
  templateCustomerSaveToWallet,
}) => {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentMethodErrors,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  const { setLocalOrder } = useContext(OrderStorageContext)
  const { order } = useContext(OrderContext)
  const stripe = useStripe()
  const elements = useElements()
  useEffect(() => {
    if (ref.current && stripe && elements) {
      ref.current.onsubmit = () =>
        onSubmit(ref.current as any, stripe, elements)
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, stripe, elements])
  const onSubmit = async (
    event: SyntheticEvent<HTMLFormElement>,
    stripe: any,
    elements: any
  ): Promise<boolean> => {
    if (!stripe) return false

    const savePaymentSourceToCustomerWallet =
      // @ts-ignore
      event?.elements?.['save_payment_source_to_customer_wallet']?.checked
    if (savePaymentSourceToCustomerWallet)
      setLocalOrder(
        'savePaymentSourceToCustomerWallet',
        savePaymentSourceToCustomerWallet
      )

    const cardElement = elements && elements.getElement(CardElement)
    if (cardElement) {
      const billingInfo = order?.billingAddress()
      const email = order?.customerEmail
      const billing_details = {
        name: billingInfo?.fullName,
        email,
        phone: billingInfo?.phone,
        address: {
          city: billingInfo?.city,
          country: billingInfo?.countryCode,
          line1: billingInfo?.line1,
          postal_code: billingInfo?.zipCode,
          state: billingInfo?.stateCode,
        },
      }
      const { paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details,
      })
      // @ts-ignore
      if (paymentSource?.clientSecret) {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          // @ts-ignore
          paymentSource.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details,
            },
          }
        )
        if (error) {
          console.error(error)
          setPaymentMethodErrors([
            {
              code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
              resource: 'paymentMethod',
              field: currentPaymentMethodType,
              message: error.message as string,
            },
          ])
        } else {
          if (
            paymentIntent &&
            paymentMethod &&
            paymentSource &&
            currentPaymentMethodType
          ) {
            try {
              await setPaymentSource({
                paymentSourceId: paymentSource.id,
                paymentResource: currentPaymentMethodType,
                attributes: {
                  options: {
                    ...(paymentMethod as Record<string, any>),
                    setup_future_usage: 'off_session',
                  },
                },
              })
              return true
            } catch (e) {
              return false
            }
          }
        }
      }
    }
    return false
  }

  return (
    <form ref={ref} onSubmit={(e) => onSubmit(e, stripe, elements)}>
      <CardElement options={{ ...defaultOptions, ...options }} />
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  )
}

type StripePaymentProps = PaymentMethodConfig['stripePayment'] &
  JSX.IntrinsicElements['div'] &
  Partial<PaymentSourceProps['templateCustomerSaveToWallet']> & {
    show?: boolean
    publishableKey: string
    locale?: StripeElementLocale
  }

let stripe: Promise<Stripe | null>

const StripePayment: FunctionComponent<StripePaymentProps> = ({
  publishableKey,
  show,
  options,
  locale = 'auto',
  ...p
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    ...divProps
  } = p
  useEffect(() => {
    if (show && publishableKey) {
      const { loadStripe } = require('@stripe/stripe-js')
      setIsLoaded(true)
      stripe = loadStripe(publishableKey, {
        locale,
      })
    }
    return () => {
      setIsLoaded(false)
    }
  }, [show, publishableKey])
  return isLoaded && stripe ? (
    <div className={containerClassName} {...divProps}>
      <Elements stripe={stripe} options={{ fonts }}>
        <StripePaymentForm
          options={options}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
        />
      </Elements>
    </div>
  ) : null
}

export default StripePayment

import { useContext, useEffect, useRef, useState } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import {
  Stripe,
  StripeCardElementOptions,
  StripeElementLocale,
  StripeElements
} from '@stripe/stripe-js'
import { PaymentMethodConfig } from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
import Parent from '#components/utils/Parent'
import OrderContext from '#context/OrderContext'
import { setCustomerOrderParam } from '#utils/localStorage'
import { StripePayment as StripePaymentType } from '@commercelayer/sdk'

export interface StripeConfig {
  containerClassName?: string
  hintLabel?: string
  name?: string
  options?: StripeCardElementOptions
  [key: string]: any
}

interface StripePaymentFormProps {
  options?: StripeCardElementOptions
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
}

type SubmitEvent = React.FormEvent<HTMLFormElement>

interface OnSubmitArgs {
  event: SubmitEvent
  stripe: Stripe | null
  elements: StripeElements | null
  paymentSource?: StripePaymentType
}

const defaultOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146'
    }
  },
  hidePostalCode: true
}

function StripePaymentForm({
  options = defaultOptions,
  templateCustomerSaveToWallet
}: StripePaymentFormProps): JSX.Element {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    setPaymentSource,
    currentPaymentMethodType,
    setPaymentMethodErrors,
    setPaymentRef,
    paymentSource
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const stripe = useStripe()
  const elements = useElements()
  useEffect(() => {
    if (ref.current && stripe && elements && paymentSource) {
      // @ts-expect-error
      ref.current.onsubmit = async (paymentSource?: StripePaymentType) => {
        return await onSubmit({
          event: ref.current as any,
          stripe,
          elements,
          paymentSource
        })
      }
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, stripe, elements, paymentSource])
  const onSubmit = async ({
    event,
    stripe,
    elements,
    paymentSource: ps
  }: OnSubmitArgs): Promise<boolean> => {
    if (!stripe) return false

    const savePaymentSourceToCustomerWallet =
      // @ts-expect-error
      event?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
        savePaymentSourceToCustomerWallet
      )

    const cardElement = elements?.getElement(CardElement)
    if (cardElement) {
      const billingInfo = order?.billing_address
      const email = order?.customer_email
      const billingDetails = {
        name: billingInfo?.full_name,
        email,
        phone: billingInfo?.phone,
        address: {
          city: billingInfo?.city,
          country: billingInfo?.country_code,
          line1: billingInfo?.line_1,
          postal_code: billingInfo?.zip_code,
          state: billingInfo?.state_code
        }
      }
      const { paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails
      })
      const clientSecret = ps?.client_secret
      const paymentSourceId = ps?.id
      if (clientSecret) {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: billingDetails
            }
          }
        )
        if (error) {
          console.error(error)
          setPaymentMethodErrors([
            {
              code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
              resource: 'payment_methods',
              field: currentPaymentMethodType,
              message: error.message as string
            }
          ])
          return false
        } else {
          if (
            paymentIntent &&
            paymentMethod &&
            paymentSourceId &&
            currentPaymentMethodType
          ) {
            try {
              await setPaymentSource({
                paymentSourceId,
                paymentResource: currentPaymentMethodType,
                attributes: {
                  options: {
                    ...(paymentMethod as Record<string, any>),
                    setup_future_usage: 'off_session'
                  }
                }
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
    <form ref={ref}>
      <CardElement options={{ ...defaultOptions, ...options }} />
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  )
}

type Props = PaymentMethodConfig['stripePayment'] &
  JSX.IntrinsicElements['div'] &
  Partial<PaymentSourceProps['templateCustomerSaveToWallet']> & {
    show?: boolean
    publishableKey: string
    locale?: StripeElementLocale
  }

export function StripePayment({
  publishableKey,
  show,
  options,
  locale = 'auto',
  ...p
}: Props): JSX.Element | null {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    ...divProps
  } = p
  useEffect(() => {
    if (show && publishableKey) {
      void import('@stripe/stripe-js').then(({ loadStripe }) => {
        const getStripe = async (): Promise<void> => {
          const res = await loadStripe(publishableKey, {
            locale
          })
          if (res != null) {
            setStripe(res)
            setIsLoaded(true)
          }
        }
        void getStripe()
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

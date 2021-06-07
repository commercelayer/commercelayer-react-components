import React, {
  FunctionComponent,
  ReactNode,
  SyntheticEvent,
  useContext,
  useEffect,
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
  loadStripe,
  Stripe,
  StripeCardElementOptions,
  StripeElementLocale,
} from '@stripe/stripe-js'
import {
  PaymentMethodConfig,
  SetPaymentSourceResponse,
} from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
import Parent from './utils/Parent'
import OrderStorageContext from '#context/OrderStorageContext'
import OrderContext from '#context/OrderContext'
import isFunction from 'lodash/isFunction'

export type StripeConfig = {
  containerClassName?: string
  hintLabel?: string
  name?: string
  options?: StripeCardElementOptions
  submitClassName?: string
  submitContainerClassName?: string
  submitLabel?: string | ReactNode
  handleSubmit?: (response?: SetPaymentSourceResponse) => void
  [key: string]: any
}

type StripePaymentFormProps = {
  options?: StripeCardElementOptions
  handleSubmit?: (response: SetPaymentSourceResponse) => void
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
} & Pick<
  StripeConfig,
  'submitClassName' | 'submitLabel' | 'submitContainerClassName'
>

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
  submitClassName,
  submitContainerClassName,
  submitLabel = 'Add payment',
  handleSubmit,
  templateCustomerSaveToWallet,
}) => {
  const {
    setPaymentSource,
    paymentSource,
    currentPaymentMethodType,
    setPaymentMethodErrors,
  } = useContext(PaymentMethodContext)
  const { setLocalOrder } = useContext(OrderStorageContext)
  const { order } = useContext(OrderContext)
  const stripe = useStripe()
  const elements = useElements()
  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    // Block native form submission.
    event.preventDefault()

    if (!stripe) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return
    }
    const savePaymentSourceToCustomerWallet =
      // @ts-ignore
      event?.target?.elements?.['save_payment_source_to_customer_wallet']
        ?.checked
    if (savePaymentSourceToCustomerWallet)
      setLocalOrder(
        'savePaymentSourceToCustomerWallet',
        savePaymentSourceToCustomerWallet
      )
    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
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
            const source = await setPaymentSource({
              paymentSourceId: paymentSource.id,
              paymentResource: currentPaymentMethodType,
              attributes: {
                options: {
                  ...(paymentMethod as Record<string, any>),
                  setup_future_usage: 'off_session',
                },
              },
            })
            handleSubmit && handleSubmit(source)
          }
        }
      }
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <CardElement options={{ ...defaultOptions, ...options }} />
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
      <div className={submitContainerClassName}>
        <button className={submitClassName} type="submit" disabled={!stripe}>
          {isFunction(submitLabel) ? submitLabel() : submitLabel}
        </button>
      </div>
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
    submitClassName,
    submitLabel,
    handleSubmit,
    submitContainerClassName,
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    ...divProps
  } = p
  useEffect(() => {
    if (show && publishableKey) {
      setIsLoaded(true)
      stripe = loadStripe(publishableKey, {
        locale,
      })
    }
    return () => {
      setIsLoaded(false)
    }
  }, [show, publishableKey])
  console.table([show, publishableKey, isLoaded])
  return isLoaded ? (
    <div className={containerClassName} {...divProps}>
      <Elements stripe={stripe} options={{ fonts }}>
        <StripePaymentForm
          options={options}
          submitClassName={submitClassName}
          submitLabel={submitLabel}
          submitContainerClassName={submitContainerClassName}
          handleSubmit={handleSubmit}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
        />
      </Elements>
    </div>
  ) : null
}

export default StripePayment

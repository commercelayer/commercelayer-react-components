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
  ElementsConsumer,
} from '@stripe/react-stripe-js'
import {
  loadStripe,
  Stripe,
  StripeCardElementOptions,
  StripeElements,
} from '@stripe/stripe-js'
import {
  PaymentMethodConfig,
  SetPaymentSourceResponse,
} from '#reducers/PaymentMethodReducer'
import { PaymentMethodNameProps } from './PaymentSource'
import Parent from './utils/Parent'
import OrderStorageContext from '#context/OrderStorageContext'
import OrderContext from '#context/OrderContext'
import isFunction from 'lodash/isFunction'

type StripePaymentFormProps = {
  stripe: Stripe | null
  elements: StripeElements | null
  options?: StripeCardElementOptions
  submitClassName?: string
  submitContainerClassName?: string
  submitLabel?: string | ReactNode
  handleSubmit?: (response: SetPaymentSourceResponse) => void
  templateCustomerSaveToWallet?: PaymentMethodNameProps['templateCustomerSaveToWallet']
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
  stripe,
  elements,
  options = defaultOptions,
  submitClassName,
  submitContainerClassName,
  submitLabel = 'Add payment',
  handleSubmit,
  templateCustomerSaveToWallet,
}) => {
  const { setPaymentSource } = useContext(PaymentMethodContext)
  const { setLocalOrder } = useContext(OrderStorageContext)
  const { order } = useContext(OrderContext)
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
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details,
      })

      if (error) {
        console.log('[error]', error)
      } else {
        console.log('[PaymentMethod]', paymentMethod)
        if (paymentMethod) {
          const source = await setPaymentSource({
            paymentResource: 'StripePayment',
            options: {
              ...(paymentMethod as Record<string, any>),
              setup_future_usage: 'off_session',
            },
            savePaymentSourceToCustomerWallet,
          })
          handleSubmit && handleSubmit(source)
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
  Partial<PaymentMethodNameProps['templateCustomerSaveToWallet']> & {
    show?: boolean
  }

const StripePayment: FunctionComponent<StripePaymentProps> = ({
  publishableKey,
  show,
  options,
  ...p
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const {
    submitClassName,
    submitLabel,
    handleSubmit,
    submitContainerClassName,
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    cssSrc = '',
    ...divProps
  } = p
  useEffect(() => {
    const loadingStripe = async () => {
      const stripePromise = publishableKey && (await loadStripe(publishableKey))
      stripePromise && setStripe(stripePromise)
    }
    show && !stripe && loadingStripe()
    return () => setStripe(null)
  }, [show])
  const cssOptions: any = { fonts, cssSrc }
  return !show ? null : (
    <div className={containerClassName} {...divProps}>
      <Elements stripe={stripe} options={cssOptions}>
        <ElementsConsumer>
          {({ elements, stripe }) => (
            <StripePaymentForm
              stripe={stripe}
              elements={elements}
              options={options}
              submitClassName={submitClassName}
              submitLabel={submitLabel}
              submitContainerClassName={submitContainerClassName}
              handleSubmit={handleSubmit}
              templateCustomerSaveToWallet={templateCustomerSaveToWallet}
            />
          )}
        </ElementsConsumer>
      </Elements>
    </div>
  )
}

export default StripePayment

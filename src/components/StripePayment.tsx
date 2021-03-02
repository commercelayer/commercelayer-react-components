import React, {
  FunctionComponent,
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
import { SetPaymentSourceResponse } from '#reducers/PaymentMethodReducer'
import _ from 'lodash'

type StripePaymentFormProps = {
  stripe: Stripe | null
  elements: StripeElements | null
  options?: StripeCardElementOptions
  submitClassName?: string
  submitLabel?: string
  handleSubmit?: (response: SetPaymentSourceResponse) => void
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
  submitLabel = 'Add payment',
  handleSubmit,
}) => {
  const { setPaymentSource } = useContext(PaymentMethodContext)
  const onSubmit = async (event: any) => {
    // Block native form submission.
    event.preventDefault()

    if (!stripe) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements && elements.getElement(CardElement)
    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        console.log('[error]', error)
      } else {
        console.log('[PaymentMethod]', paymentMethod)
        if (paymentMethod) {
          const source = await setPaymentSource({
            paymentResource: 'StripePayment',
            options: {
              id: paymentMethod.id,
              card: {
                brand: paymentMethod.card?.brand,
                last4: paymentMethod.card?.last4,
                expMonth: paymentMethod.card?.exp_month,
                expYear: paymentMethod.card?.exp_year,
              },
            },
          })
          handleSubmit && handleSubmit(source)
        }
      }
      // const billing_details = {
      //   name: billinInfo?.fullName,
      //   address: {
      //     city: billinInfo?.city,
      //     country: billinInfo?.countryCode,
      //     line1: billinInfo?.line1,
      //     postal_code: billinInfo?.zipCode,
      //   },
      // }
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <CardElement options={options} />
      <button className={submitClassName} type="submit" disabled={!stripe}>
        {submitLabel}
      </button>
    </form>
  )
}

type StripePaymentProps = {
  publishableKey?: string
  show: boolean
  options?: StripeCardElementOptions
  submitClassName?: string
  submitLabel?: string
  handleSubmit?: (response?: SetPaymentSourceResponse) => void
} & JSX.IntrinsicElements['div']

const StripePayment: FunctionComponent<StripePaymentProps> = ({
  publishableKey,
  show,
  options,
  ...p
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const { submitClassName, submitLabel, handleSubmit, ...divProps } = p
  useEffect(() => {
    const loadingStripe = async () => {
      const stripePromise = publishableKey && (await loadStripe(publishableKey))
      stripePromise && setStripe(stripePromise)
    }
    show && !stripe && loadingStripe()
    return () => setStripe(null)
  }, [show])
  return !show ? null : (
    <div {...divProps}>
      <Elements stripe={stripe}>
        <ElementsConsumer>
          {({ elements, stripe }) => (
            <StripePaymentForm
              stripe={stripe}
              elements={elements}
              options={options}
              submitClassName={submitClassName}
              submitLabel={submitLabel}
              handleSubmit={handleSubmit}
            />
          )}
        </ElementsConsumer>
      </Elements>
    </div>
  )
}

export default StripePayment

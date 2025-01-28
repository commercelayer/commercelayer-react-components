import { useContext, useEffect, useRef, useState, type JSX } from 'react';
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import type {
  Stripe,
  StripeElementLocale,
  StripeElements,
  StripeElementsOptions,
  StripePaymentElementOptions
} from '@stripe/stripe-js'
import type { PaymentMethodConfig } from '#reducers/PaymentMethodReducer'
import type { PaymentSourceProps } from './PaymentSource'
import Parent from '#components/utils/Parent'
import { setCustomerOrderParam } from '#utils/localStorage'
import OrderContext from '#context/OrderContext'
import { StripeExpressPayment } from './StripeExpressPayment'

export interface StripeConfig {
  containerClassName?: string
  hintLabel?: string
  name?: string
  options?: StripePaymentElementOptions
  appearance?: StripeElementsOptions['appearance']
  [key: string]: any
}

interface StripePaymentFormProps {
  options?: StripePaymentElementOptions
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
}

type SubmitEvent = React.FormEvent<HTMLFormElement>

interface OnSubmitArgs {
  event: SubmitEvent
  stripe: Stripe | null
  elements: StripeElements | null
}

const defaultOptions: StripePaymentElementOptions = {
  layout: {
    type: 'accordion',
    defaultCollapsed: false,
    radios: true,
    spacedAccordionItems: false
  },
  fields: { billingDetails: 'never' }
}

const defaultAppearance: StripeElementsOptions['appearance'] = {
  theme: 'stripe',
  variables: {
    colorText: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif'
  }
}

function StripePaymentForm({
  options = defaultOptions,
  templateCustomerSaveToWallet
}: StripePaymentFormProps): JSX.Element {
  const ref = useRef<null | HTMLFormElement>(null)
  const { currentPaymentMethodType, setPaymentMethodErrors, setPaymentRef } =
    useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const stripe = useStripe()
  const elements = useElements()
  useEffect(() => {
    if (ref.current && stripe && elements) {
      ref.current.onsubmit = async () => {
        return await onSubmit({
          event: ref.current as any,
          stripe,
          elements
        })
      }
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, stripe, elements])
  const onSubmit = async ({
    event,
    stripe,
    elements
  }: OnSubmitArgs): Promise<boolean> => {
    if (!stripe) return false

    const savePaymentSourceToCustomerWallet: string =
      // @ts-expect-error no type
      event?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
        savePaymentSourceToCustomerWallet
      )
    if (elements != null) {
      const billingInfo = order?.billing_address
      const email = order?.customer_email ?? ''
      const billingDetails = {
        name: billingInfo?.full_name ?? '',
        email,
        phone: billingInfo?.phone,
        address: {
          city: billingInfo?.city,
          country: billingInfo?.country_code,
          line1: billingInfo?.line_1,
          line2: billingInfo?.line_2 ?? '',
          postal_code: billingInfo?.zip_code ?? '',
          state: billingInfo?.state_code
        }
      }
      const url = new URL(window.location.href)
      const cleanUrl = `${url.origin}${url.pathname}?accessToken=${url.searchParams.get('accessToken')}`
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: cleanUrl,
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required'
      })
      if (error) {
        console.error(error)
        setPaymentMethodErrors([
          {
            code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
            resource: 'payment_methods',
            field: currentPaymentMethodType,
            message: error.message ?? ''
          }
        ])
        return false
      } else {
        return true
      }
    }
    return false
  }

  return (
    <form ref={ref}>
      {/* <CardElement options={{ ...defaultOptions, ...options }} /> */}
      <PaymentElement
        id='payment-element'
        options={{ ...defaultOptions, ...options }}
      />
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  )
}

type Props = PaymentMethodConfig['stripePayment'] &
  Omit<JSX.IntrinsicElements['div'], 'ref'> &
  Partial<PaymentSourceProps['templateCustomerSaveToWallet']> & {
    show?: boolean
    publishableKey: string
    locale?: StripeElementLocale
    clientSecret: string
    expressPayments?: boolean
  }

export function StripePayment({
  publishableKey,
  show,
  options,
  clientSecret,
  locale = 'auto',
  expressPayments = false,
  ...p
}: Props): JSX.Element | null {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    appearance,
    ...divProps
  } = p
  useEffect(() => {
    if (show && publishableKey) {
      import('@stripe/stripe-js').then(({ loadStripe }) => {
        const getStripe = async (): Promise<void> => {
          const res = await loadStripe(publishableKey, {
            locale
          })
          if (res != null) {
            setStripe(res)
            setIsLoaded(true)
          }
        }
        getStripe()
      })
    }
    return () => {
      setIsLoaded(false)
    }
  }, [show, publishableKey])
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: { ...defaultAppearance, ...appearance },
    fonts
  }
  return isLoaded && stripe != null && clientSecret != null ? (
    <div className={containerClassName} {...divProps}>
      <Elements stripe={stripe} options={elementsOptions}>
        {expressPayments ? (
          <StripeExpressPayment clientSecret={clientSecret} />
        ) : (
          <StripePaymentForm
            options={options}
            templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          />
        )}
      </Elements>
    </div>
  ) : null
}

export default StripePayment

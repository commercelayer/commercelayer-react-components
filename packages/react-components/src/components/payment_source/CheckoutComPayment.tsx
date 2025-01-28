import { useContext, useRef, type JSX } from 'react';
import type {
  PaymentMethodConfig,
  PaymentSourceObject
} from '#reducers/PaymentMethodReducer'
import type { PaymentSourceProps } from './PaymentSource'
import useExternalScript from '#utils/hooks/useExternalScript'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  Frames,
  CardNumber,
  ExpiryDate,
  Cvv,
  type FramesLanguages,
  type FramesStyle
} from 'frames-react'
import OrderContext from '#context/OrderContext'
import Parent from '#components/utils/Parent'
import { setCustomerOrderParam } from '#utils/localStorage'
const scriptUrl = 'https://cdn.checkout.com/js/framesv2.min.js'

export interface CheckoutComConfig {
  containerClassName?: string
  hintLabel?: string
  name?: string
  success_url?: string
  failure_url?: string
  options?: {
    style: FramesStyle
  }
  [key: string]: unknown
}

const systemLanguages: FramesLanguages[] = [
  'DE-DE',
  'EN-GB',
  'ES-ES',
  'FR-FR',
  'IT-IT',
  'KO-KR',
  'NL-NL'
]

const defaultOptions = {
  style: {
    base: {
      color: 'black',
      fontSize: '18px'
    },
    autofill: {
      backgroundColor: 'yellow'
    },
    hover: {
      color: 'blue'
    },
    focus: {
      color: 'blue'
    },
    valid: {
      color: 'green'
    },
    invalid: {
      color: 'red'
    },
    placeholder: {
      base: {
        color: 'gray'
      },
      focus: {
        border: 'solid 1px blue'
      }
    }
  }
}

type Props = PaymentMethodConfig['checkoutComPayment'] &
  JSX.IntrinsicElements['div'] & {
    show?: boolean
    publicKey: string
    locale?: string
    templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  }

export function CheckoutComPayment({
  publicKey,
  options = defaultOptions,
  locale = 'EN-GB',
  ...p
}: Props): JSX.Element | null {
  const ref = useRef<null | HTMLFormElement>(null)
  const loaded = useExternalScript(scriptUrl)
  const {
    setPaymentRef,
    currentPaymentMethodType,
    paymentSource,
    setPaymentSource,
    setPaymentMethodErrors
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    successUrl = window.location.href,
    failureUrl = window.location.href,
    show,
    ...divProps
  } = p
  const handleSubmit = async (): Promise<boolean> => {
    const savePaymentSourceToCustomerWallet: string =
      // @ts-expect-error no type
      ref?.current?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet) {
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
        savePaymentSourceToCustomerWallet
      )
    }
    if (window.Frames) {
      window.Frames.cardholder = {
        name: order?.billing_address?.full_name,
        billingAddress: {
          addressLine1: order?.billing_address?.line_1,
          addressLine2: order?.billing_address?.line_2 ?? '',
          zip: order?.billing_address?.zip_code ?? '',
          city: order?.billing_address?.city,
          state: order?.billing_address?.state_code,
          country: order?.billing_address?.country_code
        },
        phone: order?.billing_address?.phone
      }
      try {
        const data = await window.Frames.submitCard()
        if (data.token && paymentSource && currentPaymentMethodType) {
          const ps = (await setPaymentSource({
            paymentSourceId: paymentSource.id,
            paymentResource: currentPaymentMethodType,
            attributes: {
              token: data.token,
              payment_type: 'token',
              success_url: successUrl,
              failure_url: failureUrl,
              _authorize: true
            }
          })) as PaymentSourceObject['checkout_com_payments']
          if (ps?.redirect_uri) {
            window.location.href = ps.redirect_uri
          }
        }
      } catch (error: any) {
        console.error(error)
        setPaymentMethodErrors([
          {
            code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
            resource: 'payment_methods',
            field: currentPaymentMethodType,
            message: error?.message as string
          }
        ])
      }
    }
    return false
  }
  const lang =
    `${locale.toUpperCase()}-${locale.toUpperCase()}` as FramesLanguages
  const localization = systemLanguages.includes(lang) ? lang : 'EN-GB'
  return loaded && show ? (
    <form ref={ref}>
      <div className={containerClassName} {...divProps}>
        <Frames
          config={{
            debug: true,
            publicKey,
            localization,
            ...options
          }}
          cardValidationChanged={(e) => {
            if (e.isValid && ref.current) {
              ref.current.onsubmit = async () => {
                return await handleSubmit()
              }
              setPaymentRef({ ref })
            }
          }}
          cardTokenized={(data) => data}
        >
          <CardNumber />
          <ExpiryDate />
          <Cvv />
        </Frames>
      </div>
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  ) : null
}

export default CheckoutComPayment

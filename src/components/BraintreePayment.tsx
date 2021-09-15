import React, {
  FormEvent,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { HostedFieldFieldOptions } from 'braintree-web/modules/hosted-fields'
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'
import OrderContext from '#context/OrderContext'
import Parent from './utils/Parent'
import { PaymentSourceProps } from './PaymentSource'
import { setLocalOrder } from '#utils/localStorage'
import promisify from '#utils/promisify'
type BraintreeHostedFields<Type> = {
  [Property in keyof Type]: {
    label?: string
  } & Type[Property]
}

export type BraintreeConfig = {
  containerClassName?: string
  cardContainerClassName?: string
  expDateContainerClassName?: string
  fieldsContainerClassName?: string
  cvvContainerClassName?: string
  fieldLabelClassName?: string
  inputWrapperClassName?: string
  fields?: BraintreeHostedFields<HostedFieldFieldOptions>
  styles?: {
    [key: string]: Record<string, string>
  }
}

type BraintreePaymentProps = {
  authorization: string
  config?: BraintreeConfig
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  locale?: string
}

const defaultConfig: BraintreeConfig = {
  styles: {
    // Style all elements
    input: {
      'font-size': '16px',
      color: '#3A3A3A',
    },

    // Styling a specific field
    // Custom web fonts are not supported. Only use system installed fonts.
    '.number': {
      'font-family': 'monospace',
    },

    // Styling element state
    ':focus': {
      color: 'blue',
    },
    '.valid': {
      color: 'green',
    },
    '.invalid': {
      color: 'red',
    },

    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 700px)': {
      // @ts-ignore
      input: {
        'font-size': '14px',
      },
    },
  },
  fields: {
    number: {
      label: 'Card Number',
      selector: '#card-number',
      placeholder: '4111 1111 1111 1111',
    },
    cvv: {
      label: 'CVV',
      selector: '#cvv',
      placeholder: '123',
    },
    expirationDate: {
      label: 'Expiration Date',
      selector: '#expiration-date',
      placeholder: '10/2022',
    },
  },
  submitLabel: 'Set payment method',
}

const BraintreePayment: FunctionComponent<BraintreePaymentProps> = ({
  authorization,
  config,
  templateCustomerSaveToWallet,
}) => {
  const {
    fields,
    styles,
    containerClassName,
    cardContainerClassName,
    fieldsContainerClassName,
    expDateContainerClassName,
    fieldLabelClassName,
    cvvContainerClassName,
    inputWrapperClassName,
  } = { ...defaultConfig, ...config }
  const [loadBraintree, setLoadBraintree] = useState(false)
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const ref = useRef<null | HTMLFormElement>(null)
  const handleSubmitForm = async (
    event?: FormEvent<HTMLFormElement>,
    hostedFieldsInstance?: any,
    threeDSInstance?: any
  ) => {
    const savePaymentSourceToCustomerWallet =
      // @ts-ignore
      event?.elements?.['save_payment_source_to_customer_wallet']?.checked
    if (savePaymentSourceToCustomerWallet)
      setLocalOrder(
        'savePaymentSourceToCustomerWallet',
        savePaymentSourceToCustomerWallet
      )
    if (hostedFieldsInstance) {
      try {
        const payload = await promisify(hostedFieldsInstance).then(
          (payload) => payload
        )
        const billingAddress = order?.billingAddress()
        const verifyCardOptions = {
          nonce: payload.nonce,
          bin: payload.details.bin,
          amount: order?.totalAmountWithTaxesFloat as number,
          email: order?.customerEmail,
          billingAddress: {
            givenName: billingAddress?.firstName,
            surname: billingAddress?.lastName,
            phoneNumber: billingAddress?.phone,
            streetAddress: billingAddress?.line1,
            countryCodeAlpha2: billingAddress?.countryCode,
            postalCode: billingAddress?.zipCode,
            region: billingAddress?.stateCode,
            locality: billingAddress?.city,
          },
          onLookupComplete: (_data: any, next: any) => {
            next()
          },
        }
        const response = await threeDSInstance.verifyCard(verifyCardOptions)
        if (
          response.rawCardinalSDKVerificationData.Validated &&
          paymentSource
        ) {
          paymentSource &&
            (await setPaymentSource({
              paymentSourceId: paymentSource.id,
              paymentResource: 'braintree_payments',
              attributes: {
                paymentMethodNonce: response.nonce,
                options: {
                  id: response.nonce,
                  card: {
                    last4: response.details.lastFour,
                    expYear: response.details.expirationYear,
                    expMonth: response.details.expirationMonth,
                    brand: response.details.cardType.toLowerCase(),
                  },
                },
              },
            }))
          return true
        }
        return false
      } catch (error: any) {
        console.error(error)
        setPaymentMethodErrors([
          {
            code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
            resource: 'paymentMethod',
            field: currentPaymentMethodType,
            message: error.message as string,
          },
        ])
        return false
      }
    }
    return false
  }
  useEffect(() => {
    if (!ref && authorization)
      setLocalOrder('savePaymentSourceToCustomerWallet', 'false')
    if (authorization && !loadBraintree && !isEmpty(window)) {
      const braintreeClient = require('braintree-web/client')
      const hostedFields = require('braintree-web/hosted-fields')
      const threeDSecure = require('braintree-web/three-d-secure')
      braintreeClient.create(
        { authorization },
        (clientErr: any, clientInstance: any) => {
          if (clientErr) {
            console.error(clientErr)
            return
          }
          hostedFields.create(
            {
              client: clientInstance,
              fields: fields as HostedFieldFieldOptions,
              styles: styles,
            },
            (hostedFieldsErr: any, hostedFieldsInstance: any) => {
              if (hostedFieldsErr) {
                console.error(hostedFieldsErr)
                return
              }
              setLoadBraintree(true)
              threeDSecure.create(
                {
                  authorization,
                  version: 2,
                },
                (threeDSecureErr: any, threeDSecureInstance: any) => {
                  if (threeDSecureErr) {
                    // Handle error in 3D Secure component creation
                    console.error('3DSecure error', threeDSecureErr)
                    setPaymentMethodErrors([
                      {
                        code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
                        resource: 'paymentMethod',
                        field: currentPaymentMethodType,
                        message: threeDSecureErr.message as string,
                      },
                    ])
                  }
                  if (ref.current) {
                    ref.current.onsubmit = () =>
                      handleSubmitForm(
                        ref.current as any,
                        hostedFieldsInstance,
                        threeDSecureInstance
                      )
                    setPaymentRef({ ref })
                  }
                }
              )
            }
          )
        }
      )
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
      setLoadBraintree(false)
    }
  }, [authorization, ref])
  return !authorization && !loadBraintree ? null : (
    <div className={containerClassName}>
      <form
        ref={ref}
        id="braintree-form"
        onSubmit={handleSubmitForm}
        className={containerClassName}
      >
        <div className={fieldsContainerClassName}>
          <div className={cardContainerClassName}>
            <label className={fieldLabelClassName} htmlFor="card-number">
              {fields?.number.label}
            </label>
            <div className={inputWrapperClassName} id="card-number"></div>
          </div>
          <div className={expDateContainerClassName}>
            <label className={fieldLabelClassName} htmlFor="expiration-date">
              {fields?.expirationDate?.label}
            </label>
            <div className={inputWrapperClassName} id="expiration-date"></div>
          </div>
          <div className={cvvContainerClassName}>
            <label className={fieldLabelClassName} htmlFor="cvv">
              {fields?.cvv?.label}
            </label>
            <div className={inputWrapperClassName} id="cvv"></div>
          </div>
        </div>
        <div className={fieldsContainerClassName}>
          {templateCustomerSaveToWallet && (
            <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
              {templateCustomerSaveToWallet}
            </Parent>
          )}
        </div>
      </form>
    </div>
  )
}

export default BraintreePayment

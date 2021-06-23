import React, {
  FormEvent,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { HostedFieldFieldOptions } from 'braintree-web/modules/hosted-fields'
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'
import OrderContext from '#context/OrderContext'
import Parent from './utils/Parent'
import { PaymentSourceProps } from './PaymentSource'
import { SetPaymentSourceResponse } from '#reducers/PaymentMethodReducer'
import isFunction from 'lodash/isFunction'
import { setCustomerOrderParam, setLocalOrder } from '#utils/localStorage'

type BraintreeHostedFields<Type> = {
  [Property in keyof Type]: {
    label?: string
  } & Type[Property]
}

export type BraintreeConfig = {
  containerClassName?: string
  fields?: BraintreeHostedFields<HostedFieldFieldOptions>
  handleSubmit?: (response?: SetPaymentSourceResponse) => void
  submitClassName?: string
  submitContainerClassName?: string
  submitLabel?: string | ReactNode
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
    handleSubmit,
    submitContainerClassName,
    submitClassName,
    submitLabel,
  } = { ...defaultConfig, ...config }
  const [loadBraintree, setloadBraintree] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [hostedFieldsInstance, setHostedFieldsInstance] = useState<any>()
  const [threeDSInstance, setThreeDSInstance] = useState<any>()
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)

  const handleSubmitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const savePaymentSourceToCustomerWallet =
      // @ts-ignore
      event?.target?.elements?.['save_payment_source_to_customer_wallet']
        ?.checked
    setCustomerOrderParam(
      'savePaymentSourceToCustomerWallet',
      savePaymentSourceToCustomerWallet
    )
    if (hostedFieldsInstance) {
      hostedFieldsInstance.tokenize((tokenizeErr: any, payload: any) => {
        if (tokenizeErr) {
          console.error(tokenizeErr)
          return
        }
        if (paymentSource && threeDSInstance) {
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
          threeDSInstance.verifyCard(
            verifyCardOptions,
            async (error: any, response: any) => {
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
                return
              }
              const source = await setPaymentSource({
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
              })
              handleSubmit && handleSubmit(source)
            }
          )
        }
      })
    }
  }
  useEffect(() => {
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
              setloadBraintree(true)
              setButtonDisabled(false)
              setHostedFieldsInstance(hostedFieldsInstance)
              threeDSecure.create(
                {
                  authorization,
                  version: 2,
                },
                (threeDSecureErr: any, threeDSecureInstance: any) => {
                  if (threeDSecureErr) {
                    // Handle error in 3D Secure component creation
                    console.error('3DSecure error', threeDSecureErr)
                    return
                  }
                  setThreeDSInstance(threeDSecureInstance)
                }
              )
            }
          )
        }
      )
    }
    return () => {
      setloadBraintree(false)
      setCustomerOrderParam('savePaymentSourceToCustomerWallet', 'false')
    }
  }, [authorization])
  return !authorization && !loadBraintree ? null : (
    <div className={containerClassName}>
      <form id="braintree-form" onSubmit={handleSubmitForm}>
        <label htmlFor="card-number">{fields?.number.label}</label>
        <div id="card-number"></div>

        <label htmlFor="cvv">{fields?.cvv.label}</label>
        <div id="cvv"></div>

        <label htmlFor="expiration-date">{fields?.expirationDate?.label}</label>
        <div id="expiration-date"></div>
        {templateCustomerSaveToWallet && (
          <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
            {templateCustomerSaveToWallet}
          </Parent>
        )}
        <div className={submitContainerClassName}>
          <button
            className={submitClassName}
            type="submit"
            disabled={buttonDisabled}
          >
            {isFunction(submitLabel) ? submitLabel() : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BraintreePayment

/* eslint-disable @typescript-eslint/no-var-requires */
import { type FormEvent, useContext, useEffect, useRef, useState, type JSX } from 'react';
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'
import OrderContext from '#context/OrderContext'
import Parent from '#components/utils/Parent'
import type { PaymentSourceProps } from './PaymentSource'
import { setCustomerOrderParam } from '#utils/localStorage'
import promisify from '#utils/promisify'
import type { HostedFieldFieldOptions, ThreeDSecure } from 'braintree-web'
import type { BraintreePayment as BraintreePaymentType } from '@commercelayer/sdk'
import type { HostedFieldsHostedFieldsFieldName } from 'braintree-web/hosted-fields'
import type { ThreeDSecureVerifyOptions } from 'braintree-web/three-d-secure'
type BraintreeHostedFields<Type> = {
  [Property in keyof Type]: {
    label?: string
  } & Type[Property]
}

export interface BraintreeConfig {
  containerClassName?: string
  cardContainerClassName?: string
  expDateContainerClassName?: string
  fieldsContainerClassName?: string
  cvvContainerClassName?: string
  cardDetailsContainerClassName?: string
  fieldLabelClassName?: string
  inputWrapperClassName?: string
  fields?: BraintreeHostedFields<HostedFieldFieldOptions>
  styles?: Record<string, Record<string, string>>
  /**
   * Force challenge request for 3D Secure authentication. Default is true.
   */
  challengeRequested?: boolean
}

interface Props {
  authorization: string
  config?: BraintreeConfig
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  locale?: string
}

interface SubmitProps {
  event?: FormEvent<HTMLFormElement>
  hostedFieldsInstance: HostedFieldsHostedFieldsFieldName
  threeDSInstance: ThreeDSecure
  paymentSource?: BraintreePaymentType
}

const defaultConfig: BraintreeConfig = {
  styles: {
    // Style all elements
    input: {
      'font-size': '16px',
      color: '#3A3A3A'
    },

    // Styling a specific field
    // Custom web fonts are not supported. Only use system installed fonts.
    '.number': {
      'font-family': 'monospace'
    },

    // Styling element state
    ':focus': {
      color: 'blue'
    },
    '.valid': {
      color: 'green'
    },
    '.invalid': {
      color: 'red'
    },

    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 700px)': {
      // @ts-expect-error no type
      input: {
        'font-size': '14px'
      }
    }
  },
  fields: {
    number: {
      label: 'Card Number',
      selector: '#card-number',
      placeholder: '4111 1111 1111 1111'
    },
    cvv: {
      label: 'CVV',
      selector: '#cvv',
      placeholder: '123'
    },
    expirationDate: {
      label: 'Expiration Date',
      selector: '#expiration-date',
      placeholder: '10/2022'
    }
  },
  submitLabel: 'Set payment method'
}

export function BraintreePayment({
  authorization,
  config,
  templateCustomerSaveToWallet
}: Props): JSX.Element | null {
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
    cardDetailsContainerClassName
  } = { ...defaultConfig, ...config }
  const [loadBraintree, setLoadBraintree] = useState(false)
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const ref = useRef<null | HTMLFormElement>(null)
  const handleSubmitForm = async ({
    event,
    hostedFieldsInstance,
    threeDSInstance
  }: SubmitProps): Promise<boolean> => {
    const savePaymentSourceToCustomerWallet: string =
      // @ts-expect-error no type
      event?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
        savePaymentSourceToCustomerWallet
      )
    if (hostedFieldsInstance) {
      try {
        const payload = await promisify(hostedFieldsInstance).then(
          (payload) => payload
        )
        const billingAddress = order?.billing_address
        const verifyCardOptions: ThreeDSecureVerifyOptions & {
          onLookupComplete: unknown
        } = {
          nonce: payload.nonce,
          bin: payload.details.bin,
          amount: `${order?.total_amount_with_taxes_float}`,
          email: order?.customer_email ?? '',
          billingAddress: {
            givenName: billingAddress?.first_name ?? '',
            surname: billingAddress?.last_name ?? '',
            phoneNumber: billingAddress?.phone,
            streetAddress: billingAddress?.line_1,
            countryCodeAlpha2: billingAddress?.country_code,
            postalCode: billingAddress?.zip_code ?? '',
            region: billingAddress?.state_code,
            locality: billingAddress?.city
          },
          onLookupComplete: (_data: any, next: any) => {
            next()
          }
        }
        const response = (await threeDSInstance.verifyCard(
          verifyCardOptions
        )) as any
        const validStatus =
          response?.liabilityShiftPossible === true &&
          response?.liabilityShifted === true
        if (validStatus && paymentSource != null) {
          await setPaymentSource({
            paymentSourceId: paymentSource.id,
            paymentResource: 'braintree_payments',
            attributes: {
              payment_method_nonce: response.nonce,
              options: {
                id: response.nonce,
                card: {
                  last4: response.details.lastFour,
                  exp_year: response.details.expirationYear,
                  exp_month: response.details.expirationMonth,
                  brand: response.details.cardType.toLowerCase()
                }
              }
            }
          })
          return true
        } else {
          throw new Error(
            `3D Secure authentication failed - ${response?.threeDSecureInfo?.status}`
          )
        }
      } catch (error: any) {
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
      }
    }
    return false
  }
  useEffect(() => {
    if (!ref && authorization)
      setCustomerOrderParam('_save_payment_source_to_customer_wallet', 'false')
    if (authorization && !loadBraintree && !isEmpty(window)) {
      const braintreeClient = require('braintree-web/client')
      const hostedFields = require('braintree-web/hosted-fields')
      const threeDSecure = require('braintree-web/three-d-secure')
      braintreeClient.create(
        {
          authorization,
          challengeRequested: config?.challengeRequested ?? true
        },
        (clientErr: any, clientInstance: any) => {
          if (clientErr) {
            console.error(clientErr)
            return
          }
          hostedFields.create(
            {
              client: clientInstance,
              fields: fields as HostedFieldFieldOptions,
              styles
            },
            (
              hostedFieldsErr: any,
              hostedFieldsInstance: HostedFieldsHostedFieldsFieldName
            ) => {
              if (hostedFieldsErr) {
                console.error(hostedFieldsErr)
                return
              }
              setLoadBraintree(true)
              threeDSecure.create(
                {
                  authorization,
                  version: 2
                },
                (threeDSecureErr: any, threeDSInstance: ThreeDSecure) => {
                  if (threeDSecureErr) {
                    // Handle error in 3D Secure component creation
                    console.error('3DSecure error', threeDSecureErr)
                    setPaymentMethodErrors([
                      {
                        code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
                        resource: 'payment_methods',
                        field: currentPaymentMethodType,
                        message: threeDSecureErr.message as string
                      }
                    ])
                  }
                  if (ref.current) {
                    ref.current.onsubmit = async (paymentSource: any) => {
                      return await handleSubmitForm({
                        event: ref.current as any,
                        hostedFieldsInstance,
                        threeDSInstance,
                        paymentSource
                      })
                    }
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
        id='braintree-form'
        onSubmit={handleSubmitForm as any}
        className={containerClassName}
      >
        <div className={fieldsContainerClassName}>
          <div className={cardContainerClassName}>
            <label className={fieldLabelClassName} htmlFor='card-number'>
              {fields?.number?.label}
            </label>
            <div className={inputWrapperClassName} id='card-number' />
          </div>
          <div className={cardDetailsContainerClassName}>
            <div className={expDateContainerClassName}>
              <label className={fieldLabelClassName} htmlFor='expiration-date'>
                {fields?.expirationDate?.label}
              </label>
              <div className={inputWrapperClassName} id='expiration-date' />
            </div>
            <div className={cvvContainerClassName}>
              <label className={fieldLabelClassName} htmlFor='cvv'>
                {fields?.cvv?.label}
              </label>
              <div className={inputWrapperClassName} id='cvv' />
            </div>
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

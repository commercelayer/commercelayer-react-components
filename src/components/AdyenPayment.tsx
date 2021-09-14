import React, {
  FormEvent,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'
import OrderContext from '#context/OrderContext'
import { PaymentSourceProps } from './PaymentSource'
import { setLocalOrder } from '#utils/localStorage'
import '@adyen/adyen-web/dist/adyen.css'
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types'
import Parent from '#components/utils/Parent'

type AdyenHostedFields<Type> = {
  [Property in keyof Type]: {
    label?: string
  } & Type[Property]
}

export type AdyenConfig = {
  // containerClassName?: string
  // cardFieldsContainerClassName?: string
  // fieldContainerClassName?: string
  // fieldLabelClassName?: string
  // inputWrapperClassName?: string
  // fields?: AdyenHostedFields<HostedFieldFieldOptions>
  // styles?: {
  //   [key: string]: Record<string, string>
  // }
}

type AdyenPaymentProps = {
  clientKey?: string
  config?: AdyenConfig
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  locale?: string
}

const defaultConfig: AdyenConfig = {}

const AdyenPayment: FunctionComponent<AdyenPaymentProps> = ({
  clientKey,
  // config,
  templateCustomerSaveToWallet,
}) => {
  // const {
  //   fields,
  //   styles,
  //   containerClassName,
  //   cardFieldsContainerClassName,
  //   fieldContainerClassName,
  //   fieldLabelClassName,
  //   inputWrapperClassName,
  // } = { ...defaultConfig, ...config }
  const [loadAdyen, setLoadAdyen] = useState(false)
  const [checkout, setCheckout] = useState({})
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const ref = useRef<null | HTMLFormElement>(null)
  // const handleSubmitForm = async (
  //   event?: FormEvent<HTMLFormElement>,
  //   hostedFieldsInstance?: any,
  //   threeDSInstance?: any
  // ) => {
  //   debugger
  //   const savePaymentSourceToCustomerWallet =
  //     // @ts-ignore
  //     event?.elements?.['save_payment_source_to_customer_wallet']?.checked
  //   if (savePaymentSourceToCustomerWallet)
  //     setLocalOrder(
  //       'savePaymentSourceToCustomerWallet',
  //       savePaymentSourceToCustomerWallet
  //     )
  //   if (hostedFieldsInstance) {
  //     try {
  //       const payload = await promisify(hostedFieldsInstance).then(
  //         (payload) => payload
  //       )
  //       const billingAddress = order?.billingAddress()
  //       const verifyCardOptions = {
  //         nonce: payload.nonce,
  //         bin: payload.details.bin,
  //         amount: order?.totalAmountWithTaxesFloat as number,
  //         email: order?.customerEmail,
  //         billingAddress: {
  //           givenName: billingAddress?.firstName,
  //           surname: billingAddress?.lastName,
  //           phoneNumber: billingAddress?.phone,
  //           streetAddress: billingAddress?.line1,
  //           countryCodeAlpha2: billingAddress?.countryCode,
  //           postalCode: billingAddress?.zipCode,
  //           region: billingAddress?.stateCode,
  //           locality: billingAddress?.city,
  //         },
  //         onLookupComplete: (_data: any, next: any) => {
  //           next()
  //         },
  //       }
  //       const response = await threeDSInstance.verifyCard(verifyCardOptions)
  //       if (
  //         response.rawCardinalSDKVerificationData.Validated &&
  //         paymentSource
  //       ) {
  //         paymentSource &&
  //           (await setPaymentSource({
  //             paymentSourceId: paymentSource.id,
  //             paymentResource: 'braintree_payments',
  //             attributes: {
  //               paymentMethodNonce: response.nonce,
  //               options: {
  //                 id: response.nonce,
  //                 card: {
  //                   last4: response.details.lastFour,
  //                   expYear: response.details.expirationYear,
  //                   expMonth: response.details.expirationMonth,
  //                   brand: response.details.cardType.toLowerCase(),
  //                 },
  //               },
  //             },
  //           }))
  //         return true
  //       }
  //       return false
  //     } catch (error: any) {
  //       console.error(error)
  //       setPaymentMethodErrors([
  //         {
  //           code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
  //           resource: 'paymentMethod',
  //           field: currentPaymentMethodType,
  //           message: error.message as string,
  //         },
  //       ])
  //       return false
  //     }
  //   }
  //   return false
  // }
  const handleSubmit = (e: any, checkout: any) => {
    debugger
  }
  useEffect(() => {
    if (!ref && clientKey)
      setLocalOrder('savePaymentSourceToCustomerWallet', 'false')
    if (clientKey && !loadAdyen && !isEmpty(window)) {
      const configuration: CoreOptions = {
        locale: 'en_US', // The shopper's locale. For a list of supported locales, see https://docs.adyen.com/online-payments/components-web/localization-components.
        environment: 'test', // When you're ready to accept live payments, change the value to one of our live environments https://docs.adyen.com/online-payments/components-web#testing-your-integration.
        clientKey, // Your client key. To find out how to generate one, see https://docs.adyen.com/development-resources/client-side-authentication. Web Components versions before 3.10.1 use originKey instead of clientKey.
        paymentMethodsResponse:
          // @ts-ignore
          paymentSource && paymentSource?.paymentMethods,
        // paymentMethodsResponse: {
        //   paymentMethods: [{
        //     type: 'card',

        //   }]
        // }, // The payment methods response returned in step 1.
        onChange: (state: any, component: any) => {
          console.log(`Adyen onChange`, state, component)
          if (state.isValid) {
            if (ref.current) {
              ref.current.onsubmit = () =>
                handleSubmit(ref.current as any, checkout)
              setPaymentRef({ ref })
            }
          }
          // return null
        }, // Your function for handling onChange event
        // onAdditionalDetails: handleOnAdditionalDetails
      }
      console.log(`configuration`, configuration)
      const AdyenCheckout = require('@adyen/adyen-web')
      const adyenCheckout = new AdyenCheckout(configuration)
      const card = adyenCheckout
        .create('card', {
          data: {
            holderName: 'Alessandro',
          },
        })
        .mount('#adyen-card')
      card && setCheckout(adyenCheckout) && setLoadAdyen(true)
      // const braintreeClient = require('braintree-web/client')
      // const hostedFields = require('braintree-web/hosted-fields')
      // const threeDSecure = require('braintree-web/three-d-secure')
      // braintreeClient.create(
      //   { authorization },
      //   (clientErr: any, clientInstance: any) => {
      //     if (clientErr) {
      //       console.error(clientErr)
      //       return
      //     }
      //     hostedFields.create(
      //       {
      //         client: clientInstance,
      //         fields: fields as HostedFieldFieldOptions,
      //         styles: styles,
      //       },
      //       (hostedFieldsErr: any, hostedFieldsInstance: any) => {
      //         if (hostedFieldsErr) {
      //           console.error(hostedFieldsErr)
      //           return
      //         }
      //         setLoadAdyen(true)
      //         threeDSecure.create(
      //           {
      //             authorization,
      //             version: 2,
      //           },
      //           (threeDSecureErr: any, threeDSecureInstance: any) => {
      //             if (threeDSecureErr) {
      //               // Handle error in 3D Secure component creation
      //               console.error('3DSecure error', threeDSecureErr)
      //               setPaymentMethodErrors([
      //                 {
      //                   code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
      //                   resource: 'paymentMethod',
      //                   field: currentPaymentMethodType,
      //                   message: threeDSecureErr.message as string,
      //                 },
      //               ])
      //             }
      //             if (ref.current) {
      //               ref.current.onsubmit = () =>
      //                 handleSubmitForm(
      //                   ref.current as any,
      //                   hostedFieldsInstance,
      //                   threeDSecureInstance
      //                 )
      //               setPaymentRef({ ref })
      //             }
      //           }
      //         )
      //       }
      //     )
      //   }
      // )
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
      setLoadAdyen(false)
    }
  }, [clientKey, ref])
  return !clientKey && !loadAdyen ? null : (
    <form ref={ref} onSubmit={(e) => handleSubmit(e, checkout)}>
      <div id="adyen-card"></div>
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
      <div id="adyen-actions"></div>
    </form>
  )
}

export default AdyenPayment

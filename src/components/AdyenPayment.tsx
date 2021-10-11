import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'
import { PaymentSourceProps } from './PaymentSource'
import { setLocalOrder } from '#utils/localStorage'
import '@adyen/adyen-web/dist/adyen.css'
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types'
import Parent from '#components/utils/Parent'
import getBrowserInfo from '../utils/browserInfo'
import PlaceOrderContext from '#context/PlaceOrderContext'

const threeDSConfiguration = {
  challengeWindowSize: '05',
  // Set to any of the following:
  // '02': ['390px', '400px'] -  The default window size
  // '01': ['250px', '400px']
  // '03': ['500px', '600px']
  // '04': ['600px', '400px']
  // '05': ['100%', '100%']
}

export type AdyenConfig = {
  cardContainerClassName?: string
  threeDSecureContainerClassName?: string
  placeOrderCallback?: (response: { placed: boolean }) => void
}

type AdyenPaymentProps = {
  clientKey?: string
  config?: AdyenConfig
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  locale?: string
  environment?: string
}

const defaultConfig: AdyenConfig = {}

const AdyenPayment: FunctionComponent<AdyenPaymentProps> = ({
  clientKey,
  config,
  templateCustomerSaveToWallet,
  environment = 'test',
  locale = 'en_US',
}) => {
  const {
    cardContainerClassName,
    threeDSecureContainerClassName,
    placeOrderCallback,
  } = {
    ...defaultConfig,
    ...config,
  }
  const [loadAdyen, setLoadAdyen] = useState(false)
  const [checkout, setCheckout] = useState({})
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  const { setPlaceOrder } = useContext(PlaceOrderContext)
  const ref = useRef<null | HTMLFormElement>(null)
  const handleSubmit = async (e: any, checkout: any): Promise<boolean> => {
    const savePaymentSourceToCustomerWallet =
      // @ts-ignore
      e?.elements?.['save_payment_source_to_customer_wallet']?.checked
    if (savePaymentSourceToCustomerWallet)
      setLocalOrder(
        'savePaymentSourceToCustomerWallet',
        savePaymentSourceToCustomerWallet
      )
    const attributes: any = {
      _authorize: 1,
    }
    try {
      const pSource =
        paymentSource &&
        (await setPaymentSource({
          paymentSourceId: paymentSource.id,
          paymentResource: 'adyen_payments',
          attributes,
        }))
      // @ts-ignore
      const adyenAction = pSource?.paymentSource?.paymentResponse?.action
      // @ts-ignore
      const resultCode = pSource?.paymentSource?.paymentResponse?.resultCode
      // @ts-ignore
      if (adyenAction && resultCode === 'IdentifyShopper') {
        checkout
          .createFromAction(adyenAction, threeDSConfiguration)
          .mount('#adyen-action')
      } else if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        const brand =
          // @ts-ignore
          pSource?.paymentSource?.paymentRequestData?.paymentMethod?.brand
        if (brand) {
          const attributes = { metadata: { card: { brand } } }
          await setPaymentSource({
            paymentSourceId: pSource?.paymentSource.id,
            paymentResource: 'adyen_payments',
            attributes,
          })
        }
        return true
      }
      return false
    } catch (error: any) {
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
  const handleChange = async (
    state: any,
    _component: any,
    config: any,
    paySource: any
  ) => {
    if (state.isValid) {
      if (ref.current) {
        const AdyenCheckout = require('@adyen/adyen-web')
        const adyenCheckout = new AdyenCheckout(config)
        ref.current.onsubmit = () =>
          handleSubmit(ref.current as any, adyenCheckout)
        setPaymentRef({ ref })
      }
      let browserInfo = getBrowserInfo()
      const attributes: any = {
        payment_request_data: {
          payment_method: state.data.paymentMethod,
          shopperInteraction: 'Ecommerce',
          recurringProcessingModel: 'CardOnFile',
          origin: window.location.origin,
          return_url: window.location.href,
          browser_info: {
            acceptHeader:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            ...browserInfo,
          },
        },
      }
      paySource &&
        (await setPaymentSource({
          paymentSourceId: paySource.id,
          paymentResource: 'adyen_payments',
          attributes,
          rawResponse: true,
        }))
    }
  }
  const handleOnAdditionalDetails = async (
    state: any,
    _component: any,
    config: any
  ) => {
    const attributes: any = {
      payment_request_details: state.data,
      _details: 1,
    }
    try {
      const pSource =
        paymentSource &&
        (await setPaymentSource({
          paymentSourceId: paymentSource.id,
          paymentResource: 'adyen_payments',
          attributes,
          rawResponse: true,
        }))
      // @ts-ignore
      const adyenAction = pSource?.paymentSource?.paymentResponse?.action
      // @ts-ignore
      const resultCode = pSource?.paymentSource?.paymentResponse?.resultCode
      const AdyenCheckout = require('@adyen/adyen-web')
      if (adyenAction) {
        const adyenCheckout = new AdyenCheckout(config)
        adyenCheckout
          .createFromAction(adyenAction, threeDSConfiguration)
          .mount('#adyen-action')
      }
      if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        const { placed } = (setPlaceOrder &&
          (await setPlaceOrder({
            // @ts-ignore
            paymentSource: pSource?.paymentSource as any,
          }))) || { placed: false }
        placed && placeOrderCallback && placeOrderCallback({ placed })
      }
    } catch (error) {
      console.error('Adyen additional details error:', error)
    }
  }
  useEffect(() => {
    const options: CoreOptions = {
      locale, // The shopper's locale. For a list of supported locales, see https://docs.adyen.com/online-payments/components-web/localization-components.
      environment, // When you're ready to accept live payments, change the value to one of our live environments https://docs.adyen.com/online-payments/components-web#testing-your-integration.
      clientKey, // Your client key. To find out how to generate one, see https://docs.adyen.com/development-resources/client-side-authentication. Web Components versions before 3.10.1 use originKey instead of clientKey.
      paymentMethodsResponse:
        // @ts-ignore
        paymentSource && paymentSource?.paymentMethods,
    }
    options.onChange = (s: any, c: any) =>
      handleChange(s, c, options, paymentSource)
    options.onAdditionalDetails = (s: any, c: any) =>
      handleOnAdditionalDetails(s, c, options)
    if (!ref && clientKey)
      setLocalOrder('savePaymentSourceToCustomerWallet', 'false')
    if (clientKey && !loadAdyen && !isEmpty(window)) {
      const AdyenCheckout = require('@adyen/adyen-web')
      const adyenCheckout = new AdyenCheckout(options)
      const card = adyenCheckout.create('card').mount('#adyen-card')
      card && setCheckout(adyenCheckout) && setLoadAdyen(true)
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
      setLoadAdyen(false)
    }
  }, [clientKey, ref])
  return !clientKey && !loadAdyen && !checkout ? null : (
    <form ref={ref} onSubmit={(e) => handleSubmit(e, checkout)}>
      <div className={cardContainerClassName} id="adyen-card"></div>
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
      <div className={threeDSecureContainerClassName} id="adyen-action"></div>
    </form>
  )
}

export default AdyenPayment

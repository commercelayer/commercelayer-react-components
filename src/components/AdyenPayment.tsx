import React, {
  CSSProperties,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'
import { PaymentSourceProps } from './PaymentSource'
import { setCustomerOrderParam } from '#utils/localStorage'
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

type Styles = Partial<{
  base: CSSProperties
  error: CSSProperties
  placeholder: CSSProperties
  validated: CSSProperties
}>

export type AdyenPaymentConfig = {
  cardContainerClassName?: string
  threeDSecureContainerClassName?: string
  placeOrderCallback?: (response: { placed: boolean }) => void
  styles?: Styles
}

type AdyenPaymentProps = {
  clientKey?: string
  config?: AdyenPaymentConfig
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  locale?: string
  environment?: string
}

const defaultConfig: AdyenPaymentConfig = {}

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
    styles,
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
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
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
      const adyenAction = pSource?.payment_response?.action
      // @ts-ignore
      const resultCode = pSource?.payment_response?.resultCode
      if (
        adyenAction &&
        ['IdentifyShopper', 'RedirectShopper'].includes(resultCode)
      ) {
        checkout
          .createFromAction(adyenAction, threeDSConfiguration)
          .mount('#adyen-action')
      } else if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        const brand =
          // @ts-ignore
          pSource?.payment_request_data?.payment_method?.brand
        if (brand) {
          const attributes = { metadata: { card: { brand } } }
          await setPaymentSource({
            paymentSourceId: pSource?.id,
            paymentResource: 'adyen_payments',
            attributes,
          })
        }
        return true
      }
      // @ts-ignore
      const message = pSource?.payment_response?.refusalReason
      setPaymentMethodErrors([
        {
          code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
          resource: 'payment_methods',
          field: currentPaymentMethodType,
          message,
        },
      ])
      return false
    } catch (error: any) {
      setPaymentMethodErrors([
        {
          code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
          resource: 'payment_methods',
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
        const adyenCheckout = await AdyenCheckout(config)
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
          redirect_from_issuer_method: 'GET',
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
        }))
      // @ts-ignore
      const adyenAction = pSource?.payment_response?.action
      // @ts-ignore
      const resultCode = pSource?.payment_response?.resultCode
      const AdyenCheckout = require('@adyen/adyen-web')
      if (adyenAction) {
        const adyenCheckout = await AdyenCheckout(config)
        adyenCheckout
          .createFromAction(adyenAction, threeDSConfiguration)
          .mount('#adyen-action')
      }
      if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        const { placed } = (setPlaceOrder &&
          (await setPlaceOrder({
            // @ts-ignore
            paymentSource: pSource,
          }))) || { placed: false }
        placed && placeOrderCallback && placeOrderCallback({ placed })
      }
    } catch (error) {
      console.error('Adyen additional details error:', error)
    }
  }
  useEffect(() => {
    // @ts-ignore
    const paymentMethodsResponse = !isEmpty(paymentSource?.payment_methods)
      ? // @ts-ignore
        paymentSource?.payment_methods
      : {}
    if (isEmpty(paymentMethodsResponse))
      console.error(
        'Payment methods are not available. Please, check your Adyen configuration.'
      )
    const options: CoreOptions = {
      locale,
      environment,
      clientKey,
      paymentMethodsResponse,
    }
    options.onChange = (s: any, c: any) =>
      handleChange(s, c, options, paymentSource)
    options.onAdditionalDetails = (s: any, c: any) =>
      handleOnAdditionalDetails(s, c, options)
    if (!ref && clientKey)
      setCustomerOrderParam('_save_payment_source_to_customer_wallet', 'false')
    if (clientKey && !loadAdyen && !isEmpty(window)) {
      const AdyenCheckout = require('@adyen/adyen-web')
      AdyenCheckout(options).then((adyenCheckout: any) => {
        const card = adyenCheckout
          .create('card', { styles })
          .mount('#adyen-card')
        if (card) {
          setCheckout(adyenCheckout)
          setLoadAdyen(true)
        }
      })
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

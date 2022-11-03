import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentSourceProps } from './PaymentSource'
import { setCustomerOrderParam } from '#utils/localStorage'
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types'
import Parent from '#components/utils/Parent'
import getBrowserInfo, { cleanUrlBy } from '#utils/browserInfo'
import PlaceOrderContext from '#context/PlaceOrderContext'
import OrderContext from '#context/OrderContext'
import type Dropin from '@adyen/adyen-web/dist/types/components/Dropin'
import type Card from '@adyen/adyen-web/dist/types/components/Card'

const threeDSConfiguration = {
  challengeWindowSize: '05'
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

type PaypalStyle = Partial<{
  /**
   * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#color}
   */
  color: 'gold' | 'blue' | 'silver' | 'white' | 'black'
  /**
   * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#shape}
   */
  shape: 'rect' | 'pill'
  /**
   * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#height}
   */
  height: string | number
  /**
   * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#label}
   */
  label: 'paypal' | 'checkout' | 'buynow' | 'pay'
  /**
   * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#tagline}
   */
  tagline: boolean
  /**
   * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#layout}
   */
  layout: 'vertical' | 'horizontal'
}>

interface PaymentMethodsStyle {
  card?: Styles
  paypal?: PaypalStyle
}

export interface AdyenPaymentConfig {
  cardContainerClassName?: string
  threeDSecureContainerClassName?: string
  placeOrderCallback?: (response: { placed: boolean }) => void
  styles?: PaymentMethodsStyle
}

type AdyenCheckout = Dropin | Card | null

interface Props {
  clientKey?: string
  config?: AdyenPaymentConfig
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
  locale?: string
  environment?: string
}

const defaultConfig: AdyenPaymentConfig = {}

export function AdyenPayment({
  clientKey,
  config,
  templateCustomerSaveToWallet,
  environment = 'test',
  locale = 'en_US'
}: Props): JSX.Element | null {
  const { cardContainerClassName, threeDSecureContainerClassName, styles } = {
    ...defaultConfig,
    ...config
  }
  const [loadAdyen, setLoadAdyen] = useState(false)
  const [checkout, setCheckout] = useState<AdyenCheckout>(null)
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const { placeOrderButtonRef } = useContext(PlaceOrderContext)
  const ref = useRef<null | HTMLFormElement>(null)
  const handleSubmit = async (
    e: any,
    component: AdyenCheckout
  ): Promise<boolean> => {
    const savePaymentSourceToCustomerWallet =
      e?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
        savePaymentSourceToCustomerWallet
      )
    if (component?.submit) {
      component.submit()
    }
    return false
  }
  const handleChange = async (
    state: any,
    checkout: AdyenCheckout
  ): Promise<void> => {
    if (state.isValid) {
      if (ref.current) {
        ref.current.onsubmit = async () =>
          await handleSubmit(ref.current as any, checkout)
        setPaymentRef({ ref })
      }
      const browserInfo = getBrowserInfo()
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
            ...browserInfo
          }
        }
      }
      paymentSource &&
        (await setPaymentSource({
          paymentSourceId: paymentSource.id,
          paymentResource: 'adyen_payments',
          attributes
        }))
    }
  }
  const handleOnAdditionalDetails = async (
    state: any,
    component: AdyenCheckout
  ): Promise<boolean> => {
    const attributes = {
      payment_request_details: state.data,
      _details: 1
    }
    try {
      const pSource =
        paymentSource &&
        (await setPaymentSource({
          paymentSourceId: paymentSource.id,
          paymentResource: 'adyen_payments',
          attributes
        }))
      // @ts-expect-error
      const adyenAction = pSource?.payment_response?.action
      // @ts-expect-error
      const resultCode = pSource?.payment_response?.resultCode
      if (adyenAction && component) {
        component.handleAction(adyenAction)
        return false
      }
      if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        if (placeOrderButtonRef?.current != null) {
          if (placeOrderButtonRef.current.disabled) {
            placeOrderButtonRef.current.disabled = false
          }
          placeOrderButtonRef.current?.click()
        }
        return true
      }
      if (['Cancelled', 'Refused'].includes(resultCode)) {
        // @ts-expect-error
        const message = pSource?.payment_response?.refusalReason
        setPaymentMethodErrors([
          {
            code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
            resource: 'payment_methods',
            field: currentPaymentMethodType,
            message
          }
        ])
        if (component) {
          component.mount('#adyen-dropin')
        }
      }
      return false
    } catch (error) {
      console.error('Adyen additional details error:', error)
      return false
    }
  }
  const onSubmit = async (
    state: any,
    component: AdyenCheckout
  ): Promise<boolean> => {
    const browserInfo = getBrowserInfo()
    const url = cleanUrlBy()
    let control = await setPaymentSource({
      paymentSourceId: paymentSource?.id,
      paymentResource: 'adyen_payments'
    })
    // @ts-expect-error
    const controlCode = control?.payment_response?.resultCode
    if (controlCode === 'Authorised') {
      return true
    }
    const paymentDataAvailable =
      // @ts-expect-error
      Object.keys(control?.payment_request_data).length > 0
    const paymentMethodSelected =
      // @ts-expect-error
      control?.payment_request_data?.payment_method?.type
    if (
      !paymentDataAvailable ||
      paymentMethodSelected !== state.data.paymentMethod.type
    ) {
      control = await setPaymentSource({
        paymentSourceId: paymentSource?.id,
        paymentResource: 'adyen_payments',
        attributes: {
          payment_request_data: {
            ...state.data,
            payment_method: state.data.paymentMethod,
            return_url: url,
            origin: window.location.origin,
            redirect_from_issuer_method: 'GET',
            browser_info: {
              acceptHeader:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              ...browserInfo
            }
          }
        }
      })
    }
    const attributes: any = {
      payment_request_data: {
        ...state.data,
        payment_method: state.data.paymentMethod,
        return_url: url,
        origin: window.location.origin,
        redirect_from_issuer_method: 'GET',
        browser_info: {
          acceptHeader:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          ...browserInfo
        }
      },
      _authorize: 1
    }
    delete attributes.payment_request_data.paymentMethod
    try {
      const res = await setPaymentSource({
        paymentSourceId: paymentSource?.id,
        paymentResource: 'adyen_payments',
        attributes
      })
      // @ts-expect-error
      const action = res?.payment_response?.action
      if (component && action) {
        component.handleAction(action)
        return false
      }
      // @ts-expect-error
      const resultCode = res?.payment_response?.resultCode
      if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        if (placeOrderButtonRef?.current != null) {
          if (placeOrderButtonRef.current.disabled) {
            placeOrderButtonRef.current.disabled = false
          }
          placeOrderButtonRef.current?.click()
        }
        return true
      }
      if (['Cancelled'].includes(resultCode)) {
        // @ts-expect-error
        const message = res?.payment_response?.refusalReason
        setPaymentMethodErrors([
          {
            code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
            resource: 'payment_methods',
            field: currentPaymentMethodType,
            message
          }
        ])
      }
      // @ts-expect-error
      const errorType = res?.payment_response?.errorType
      if (errorType) {
        // @ts-expect-error
        const errorCode = res?.payment_response?.errorCode
        if (errorCode === '14_006') {
          void onSubmit(state, component)
        } else {
          // @ts-expect-error
          const message = res?.payment_response?.message
          setPaymentMethodErrors([
            {
              code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
              resource: 'payment_methods',
              field: currentPaymentMethodType,
              message
            }
          ])
        }
      }
      return false
    } catch (error: any) {
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
  useEffect(() => {
    // @ts-expect-error
    const paymentMethodsResponse = paymentSource?.payment_methods
      ?.paymentMethods
      ? // @ts-expect-error
        paymentSource?.payment_methods.paymentMethods
      : []
    const [firstPaymentMethod] = paymentMethodsResponse
    const isOnlyCard =
      paymentMethodsResponse?.length === 1 &&
      firstPaymentMethod.type === 'scheme'
    if (paymentMethodsResponse.length === 0) {
      console.error(
        'Payment methods are not available. Please, check your Adyen configuration.'
      )
    }
    const options: CoreOptions = {
      locale,
      environment,
      clientKey,
      amount: {
        currency: order?.currency_code || '',
        value: order?.total_amount_with_taxes_cents || 0
      },
      countryCode: order?.country_code || '',
      paymentMethodsResponse: {
        paymentMethods: paymentMethodsResponse
      },
      showPayButton: false,
      paymentMethodsConfiguration: {
        threeDS2: threeDSConfiguration,
        paypal: {
          showPayButton: true,
          style: styles?.paypal
        },
        card: {
          styles: styles?.card,
          holderNameRequired: false
        }
      },
      onAdditionalDetails: handleOnAdditionalDetails,
      onChange: handleChange,
      onSubmit
    }
    if (!ref && clientKey)
      setCustomerOrderParam('_save_payment_source_to_customer_wallet', 'false')
    if (clientKey && !loadAdyen && window && !checkout) {
      void import('@adyen/adyen-web').then(({ default: AdyenCheckout }) => {
        const type = isOnlyCard ? 'card' : 'dropin'
        void AdyenCheckout(options).then((adyenCheckout) => {
          const component = adyenCheckout
            .create(type, {
              onSelect: (component) => {
                const id: string = component._id
                if (id.search('scheme') === -1) {
                  if (ref.current) {
                    if (id.search('paypal') === -1) {
                      ref.current.onsubmit = async () =>
                        await handleSubmit(ref.current as any, component)
                    } else {
                      ref.current.onsubmit = null
                    }
                    setPaymentRef({ ref })
                  }
                }
              }
            })
            .mount('#adyen-dropin')
          if (component) {
            setCheckout(component)
            setLoadAdyen(true)
          }
        })
      })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
      setLoadAdyen(false)
    }
  }, [clientKey, ref])
  return !clientKey && !loadAdyen && !checkout ? null : (
    <form
      ref={ref}
      onSubmit={(e) => {
        void handleSubmit(e, checkout)
      }}
    >
      <div className={cardContainerClassName} id='adyen-dropin' />
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: 'save_payment_source_to_customer_wallet' }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
      <div className={threeDSecureContainerClassName} id='adyen-action' />
    </form>
  )
}

export default AdyenPayment

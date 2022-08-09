import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentSourceProps } from './PaymentSource'
import { setCustomerOrderParam } from '#utils/localStorage'
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types'
import Parent from '#components/utils/Parent'
import getBrowserInfo from '../utils/browserInfo'
import PlaceOrderContext from '#context/PlaceOrderContext'
import OrderContext from '#context/OrderContext'
import type Dropin from '@adyen/adyen-web/dist/types/components/Dropin'
import type Card from '@adyen/adyen-web/dist/types/components/Card'

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

type AdyenCheckout = Dropin | Card | null

type Props = {
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
  locale = 'en_US',
}: Props) {
  const {
    cardContainerClassName,
    threeDSecureContainerClassName,
    styles,
  } = {
    ...defaultConfig,
    ...config,
  }
  const [loadAdyen, setLoadAdyen] = useState(false)
  const [checkout, setCheckout] = useState<AdyenCheckout>(null)
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const { placeOrderButtonRef } = useContext(PlaceOrderContext)
  const ref = useRef<null | HTMLFormElement>(null)
  const handleSubmit = async (
    e: any,
    component: AdyenCheckout
  ): Promise<boolean> => {
    const savePaymentSourceToCustomerWallet =
      // @ts-ignore
      e?.elements?.['save_payment_source_to_customer_wallet']?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        '_save_payment_source_to_customer_wallet',
        savePaymentSourceToCustomerWallet
      )
    if (component && component.submit) {
      component.submit()
    }
    return false
  }
  const handleChange = async (state: any, checkout: AdyenCheckout) => {
    if (state.isValid) {
      if (ref.current) {
        ref.current.onsubmit = () => handleSubmit(ref.current as any, checkout)
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
            ...browserInfo,
          },
        },
      }
      paymentSource &&
        (await setPaymentSource({
          paymentSourceId: paymentSource.id,
          paymentResource: 'adyen_payments',
          attributes,
        }))
    }
  }
  const handleOnAdditionalDetails = async (
    state: any,
    component: AdyenCheckout
  ): Promise<boolean> => {
    const attributes = {
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
      if (adyenAction && component) {
        component.handleAction(adyenAction)
      }
      if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
        if (placeOrderButtonRef !== null && placeOrderButtonRef?.current != null) {
          if (placeOrderButtonRef.current.disabled === true) {
            placeOrderButtonRef.current.disabled = false
          }
          placeOrderButtonRef.current?.click()
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Adyen additional details error:', error)
      return false
    }
  }
  const onSubmit = async (state: any, component: AdyenCheckout) => {
    const attributes: any = {
      payment_request_data: {
        ...state.data,
        payment_method: state.data.paymentMethod,
        return_url: window.location.href,
      },
      _authorize: 1,
    }
    delete attributes.payment_request_data.paymentMethod
    try {
      const res = await setPaymentSource({
        paymentSourceId: paymentSource?.id,
        paymentResource: 'adyen_payments',
        attributes,
      })
      // @ts-ignore
      const action = res?.payment_response?.action
      if (component && action) {
        component.handleAction(action)
        return false
      }
      // @ts-ignore
      const resultCode = res?.payment_response?.resultCode
      if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
          if (placeOrderButtonRef !== null && placeOrderButtonRef?.current != null) {
            if (placeOrderButtonRef.current.disabled === true) {
              placeOrderButtonRef.current.disabled = false
            }
            placeOrderButtonRef.current?.click()
          }
        return true
      }
      // @ts-ignore
      const errorType = res?.payment_response?.errorType
      if (errorType) {
        // @ts-ignore
        const errorCode = res?.payment_response?.errorCode
        if (errorCode === '14_006') {
          onSubmit(state, component)
        } else {
          // @ts-ignore
          const message = res?.payment_response?.message
          setPaymentMethodErrors([
            {
              code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
              resource: 'payment_methods',
              field: currentPaymentMethodType,
              message,
            },
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
          message: error.message as string,
        },
      ])
      return false
    }
  }
  useEffect(() => {
    // @ts-ignore
    const paymentMethodsResponse = paymentSource?.payment_methods
      ?.paymentMethods
      ? // @ts-ignore
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
        value: order?.total_amount_with_taxes_cents || 0,
      },
      countryCode: order?.country_code || '',
      paymentMethodsResponse: {
        paymentMethods: paymentMethodsResponse,
      },
      showPayButton: false,
      paymentMethodsConfiguration: {
        threeDS2: threeDSConfiguration,
        paypal: {
          showPayButton: true,
        },
        card: {
          holderNameRequired: false,
        },
      },
      onAdditionalDetails: handleOnAdditionalDetails,
      onChange: handleChange,
      onSubmit,
    }
    if (!ref && clientKey)
      setCustomerOrderParam('_save_payment_source_to_customer_wallet', 'false')
    if (clientKey && !loadAdyen && window && !checkout) {
      import('@adyen/adyen-web').then(({ default: AdyenCheckout }) => {
        const type = isOnlyCard ? 'card' : 'dropin'
        AdyenCheckout(options).then((adyenCheckout) => {
          const component = adyenCheckout
            .create(type, {
              styles,
              onSelect: (component) => {
                const id: string = component._id
                if (id.search('scheme') === -1) {
                  if (ref.current) {
                    if (id.search('paypal') === -1) {
                      ref.current.onsubmit = () =>
                        handleSubmit(ref.current as any, component)
                    } else {
                      ref.current.onsubmit = null
                    }
                    setPaymentRef({ ref })
                  }
                }
              },
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
    <form ref={ref} onSubmit={(e) => handleSubmit(e, checkout)}>
      <div className={cardContainerClassName} id="adyen-dropin"></div>
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

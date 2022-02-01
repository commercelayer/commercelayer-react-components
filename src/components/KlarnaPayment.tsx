import React, {
  // FunctionComponent,
  // SyntheticEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentMethodConfig } from '#reducers/PaymentMethodReducer'
import { PaymentSourceProps } from './PaymentSource'
// import Parent from './utils/Parent'
import OrderContext from '#context/OrderContext'
// import { setCustomerOrderParam } from '#utils/localStorage'
import useExternalScript from '#utils/hooks/useExternalScript'
// import Klarna from '@adyen/adyen-web/dist/types/components/Klarna'

export type KlarnaConfig = {
  // containerClassName?: string
  // hintLabel?: string
  // name?: string
  // options?: StripeCardElementOptions
  [key: string]: any
}

type KlarnaResponse = {
  show_form: boolean
  approved: boolean
  authorization_token?: string
  Error?: { invalid_fields: string[] }
}

type KlarnaPaymentProps = PaymentMethodConfig['klarnaPayment'] &
  JSX.IntrinsicElements['div'] &
  Partial<PaymentSourceProps['templateCustomerSaveToWallet']> & {
    show?: boolean
    clientToken: string
    locale?: string
  }

export default function KlarnaPayment({
  clientToken,
  show,
  options,
  locale = 'EN',
  ...p
}: KlarnaPaymentProps) {
  const ref = useRef<null | HTMLFormElement>(null)
  const { paymentSource, currentPaymentMethodType, setPaymentRef } =
    useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const loaded = useExternalScript('https://x.klarnacdn.net/kp/lib/v1/api.js')
  const [klarna, setKlarna] = useState<any>()
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    ...divProps
  } = p
  useEffect(() => {
    if (loaded && window?.Klarna !== undefined) {
      setKlarna(window.Klarna)
    }
  }, [loaded, window.Klarna])
  useEffect(() => {
    if (
      ref.current &&
      paymentSource &&
      currentPaymentMethodType &&
      loaded &&
      klarna
    ) {
      ref.current.onsubmit = () => handleClick(klarna)
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, paymentSource, currentPaymentMethodType, loaded, klarna])
  const handleClick = (kl: any) => {
    console.log('klarna', kl, order, paymentSource)
    // @ts-ignore
    const [first] = paymentSource?.payment_methods || undefined
    const payment_method_category = first?.identifier
    const billing_address = {
      given_name: order?.billing_address?.first_name,
      family_name: order?.billing_address?.last_name,
      email: order?.customer_email,
      street_address: order?.billing_address?.line_1,
      street_address2: order?.billing_address?.line_2,
      postal_code: order?.billing_address?.zip_code,
      city: order?.billing_address?.city,
      region: order?.billing_address?.state_code,
      // phone: order?.billing_address?.phone,
      country: order?.billing_address?.country_code,
    }
    const shipping_address = {
      given_name: order?.shipping_address?.first_name,
      family_name: order?.shipping_address?.last_name,
      street_address: order?.shipping_address?.line_1,
      street_address2: order?.shipping_address?.line_2,
      postal_code: order?.shipping_address?.zip_code,
      city: order?.shipping_address?.city,
      region: order?.shipping_address?.state_code,
      // phone: order?.shipping_address?.phone,
      country: order?.shipping_address?.country_code,
    }
    // const order_lines = order?.line_items?.map((item) => {
    //   return {
    //     name: item.name,
    //     reference: item.reference,
    //     type: item.type,
    //     quantity: item.quantity,
    //     unit_price: item.unit_amount_cents,
    //     tax_rate: item.tax_rate,
    //     total_amount: item.total_amount_cents,
    //     total_discount_amount: item.discount_cents,
    //     total_tax_amount: item.tax_amount_cents,
    //     image_url: item.image_url,
    //   }
    // })
    // console.log('order_lines', order_lines)
    console.log('order', order)
    kl.Payments.load(
      {
        container: '#klarna-payments-container',
        payment_method_category,
      },
      {
        billing_address,
        shipping_address,
      },
      function ({ show_form }: Pick<KlarnaResponse, 'show_form' | 'Error'>) {
        if (show_form) {
          try {
            kl.Payments.authorize(
              {
                payment_method_category,
              },
              {},
              // {
              //   purchase_country: 'ES',
              //   purchase_currency: 'EUR',
              //   locale,
              //   shipping_address,
              //   order_amount: order?.total_amount_cents,
              //   order_tax_amount: order?.total_amount_with_taxes_cents,
              //   order_lines: [
              //     {
              //       type: 'physical',
              //       reference: '19-402',
              //       name: 'Battery Power Pack',
              //       quantity: 1,
              //       unit_price: 29.95,
              //       tax_rate: 0,
              //       total_amount: 29.95,
              //       total_discount_amount: 0,
              //       total_tax_amount: 0,
              //       product_url: 'https://www.estore.com/products/f2a8d7e34',
              //       image_url: 'https://www.exampleobjects.com/logo.png',
              //     },
              //   ],
              // },
              function (res: KlarnaResponse) {
                console.log('res', res)
                debugger
              }
            )
          } catch (e) {
            console.error('e', e)
            debugger
          }
        }
      }
    )
  }
  if (klarna && clientToken) {
    // @ts-ignore
    const [first] = paymentSource?.payment_methods || undefined
    klarna.Payments.init({
      client_token: clientToken,
    })
    klarna.Payments.load(
      {
        container: '#klarna-payments-container',
        payment_method_category: first?.identifier,
      },
      {
        billing_address: {
          given_name: order?.billing_address?.first_name,
          family_name: order?.billing_address?.last_name,
          email: order?.customer_email,
          street_address: order?.billing_address?.line_1,
          street_address2: order?.billing_address?.line_2,
          postal_code: order?.billing_address?.zip_code,
          city: order?.billing_address?.city,
          region: order?.billing_address?.state_code,
          phone: order?.billing_address?.phone,
          country: order?.billing_address?.country_code,
        },
        shipping_address: {
          given_name: order?.shipping_address?.first_name,
          family_name: order?.shipping_address?.last_name,
          street_address: order?.shipping_address?.line_1,
          street_address2: order?.shipping_address?.line_2,
          postal_code: order?.shipping_address?.zip_code,
          city: order?.shipping_address?.city,
          region: order?.shipping_address?.state_code,
          phone: order?.shipping_address?.phone,
          country: order?.shipping_address?.country_code,
        },
      },
      (res: any) => {
        console.log('res', res)
      }
    )
  }
  console.log('Klarna', klarna, clientToken)
  // const [isLoaded, setIsLoaded] = useState(false)
  // const [stripe, setStripe] = useState(null)
  return (
    <form ref={ref}>
      <div className={containerClassName} {...divProps}>
        <div id="klarna-payments-container"></div>
      </div>
    </form>
  )
}

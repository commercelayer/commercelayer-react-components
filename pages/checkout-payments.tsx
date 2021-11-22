import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  Errors,
  OrderContainer,
  PaymentMethod,
  PaymentMethodName,
  PaymentMethodPrice,
  PaymentMethodRadioButton,
  PaymentMethodsContainer,
  PaymentSource,
  PaymentSourceBrandIcon,
  PaymentSourceBrandName,
  PaymentSourceDetail,
  PaymentSourceEditButton,
  PlaceOrderButton,
  PlaceOrderContainer,
  PrivacyAndTermsCheckbox,
} from '@commercelayer/react-components'
import { Order } from '@commercelayer/js-sdk'
import { useRouter } from 'next/router'
import '@adyen/adyen-web/dist/adyen.css'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string
const username = process.env.NEXT_PUBLIC_CUSTOMER_USERNAME as string
const password = process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD as string

let orderId = 'PDerhJplRp'
let paypalPayerId = ''
let paypalReturnUrl = ''

const messages: any = [
  {
    code: 'VALIDATION_ERROR',
    resource: 'order',
    field: 'status',
    message: 'test 1',
  },
  {
    code: 'VALIDATION_ERROR',
    resource: 'order',
    field: 'billingAddress',
    message: 'test 2',
  },
  {
    code: 'INVALID_RESOURCE_ID',
    resource: 'order',
    field: 'base',
    message: 'Paypal error',
  },
  {
    code: 'PAYMENT_NOT_APPROVED_FOR_EXECUTION',
    resource: 'order',
    field: 'base',
    message: 'Paypal payment not approved for execution',
  },
]

export default function Main() {
  const [token, setToken] = useState('')
  const [paymentSource, setPaymentSource] = useState<any>(null)
  const { query } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
  }
  if (query.PayerID) {
    paypalPayerId = query.PayerID as string
  }
  if (typeof window !== 'undefined') {
    paypalReturnUrl = window.location.href
  }
  // const [shippingMethodId, setShippingMethodId] = useState<string>('')
  const getOrder = async () => {
    const config = { accessToken: token, endpoint }
    const order = await Order.withCredentials(config)
      .includes('paymentSource')
      .find(orderId)
    // @ts-ignore
    if (order.paymentSource()) setPaymentSource(order.paymentSource()?.options)
  }
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getCustomerToken(
        {
          clientId,
          endpoint,
          scope,
        },
        {
          username,
          password,
        }
      )
      if (token) setToken(token.accessToken)
    }
    if (!token) getToken()
    if (token) getOrder()
  }, [token])
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId}>
            <PaymentMethodsContainer
              config={{
                stripePayment: {
                  // fonts: [
                  //   {
                  //     cssSrc:
                  //       'https://fonts.googleapis.com/css2?family=Josefin+Slab:ital,wght@0,100;1,100&display=swap',
                  //   },
                  // ],
                  options: {
                    // style: {
                    //   base: {
                    //     color: '#000',
                    //     fontWeight: '400',
                    //     fontFamily: 'Josefin Slab',
                    //     ':-webkit-autofill': {
                    //       color: '#fce883',
                    //     },
                    //     '::placeholder': {
                    //       color: '#e0e0e0',
                    //     },
                    //   },
                    //   invalid: {
                    //     iconColor: '#FFC7EE',
                    //     color: '#FFC7EE',
                    //   },
                    // },
                    hideIcon: false,
                    hidePostalCode: true,
                  },
                  containerClassName: 'w-1/2 px-3',
                },
                paypalPayment: {
                  cancel_url: paypalReturnUrl,
                  return_url: paypalReturnUrl,
                },
              }}
            >
              <PlaceOrderContainer options={{ paypalPayerId }}>
                <PaymentMethod
                  className="p-2 my-1 flex items-center justify-items-center bg-gray-300 cursor-pointer"
                  activeClass="bg-opacity-25"
                  clickableContainer
                >
                  <PaymentMethodRadioButton data-cy="payment-radio-button" />
                  <PaymentMethodName className="pl-3" />
                  <PaymentMethodPrice className="pl-3" />
                  <PaymentSource
                    data-cy="payment-source"
                    className="p-5 my-2"
                    loader={'Caricamento...'}
                  >
                    <div className="flex flex-row items-center justify-start bg-gray-100 p-5 my-10">
                      <div className="flex flex-row items-center">
                        <PaymentSourceBrandIcon className="mr-3" />
                        <PaymentSourceBrandName
                          className="mr-1"
                          data-cy="payment-brand-name-card"
                        />
                        ending in
                        <PaymentSourceDetail
                          data-cy="payment-last4"
                          className="ml-1"
                          type="last4"
                        />
                      </div>
                      <div className="text-gray-500 ml-5">
                        <PaymentSourceDetail
                          data-cy="payment-exp-month"
                          type="expMonth"
                        />
                        <PaymentSourceDetail
                          data-cy="payment-exp-year"
                          type="expYear"
                        />
                      </div>
                      <div className="ml-5">
                        <PaymentSourceEditButton
                          data-cy="payment-edit-button"
                          className="text-blue-500 hover:underline hover:text-blue-600"
                        />
                      </div>
                    </div>
                  </PaymentSource>
                  <Errors
                    className="text-red-600 block"
                    resource="payment_methods"
                  />
                </PaymentMethod>

                <div className="flex flex-row-reverse justify-end">
                  <label
                    htmlFor="privacy-terms"
                    className="block text-sm font-medium text-gray-700 ml-3 self-end"
                  >
                    Accept privacy and terms
                  </label>
                  <div className="mt-1">
                    <PrivacyAndTermsCheckbox
                      id="privacy-terms"
                      className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <PlaceOrderButton
                    onClick={(res: any) => {
                      console.log('res', res)
                    }}
                    className="mt-5 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  />
                </div>
              </PlaceOrderContainer>
            </PaymentMethodsContainer>
            <div className="flex flex-col text-red-600 mt-5">
              <Errors resource="orders" messages={messages} />
            </div>
            {/* <PaymentMethodsContainer>
              <PaymentSource readonly>
                <div className="flex flex-row items-center bg-gray-100 p-5 my-10 w-full">
                  <div className="flex flex-row items-center w-full">
                    <PaymentSourceBrandIcon className="mr-3" />
                    <PaymentSourceBrandName className="mr-1" />
                    ending in
                    <PaymentSourceDetail className="ml-1" type="last4" />
                  </div>
                  <div className="text-gray-500 w-full self-end">
                    <PaymentSourceDetail type="expMonth" />/
                    <PaymentSourceDetail type="expYear" />
                  </div>
                  <div>
                    <PaymentSourceEditButton />
                  </div>
                </div>
              </PaymentSource>
            </PaymentMethodsContainer> */}
          </OrderContainer>
          <div className="mt-5">
            <pre data-cy="current-shipping-method">{`Current payment source options: ${JSON.stringify(
              paymentSource,
              null,
              2
            )}`}</pre>
          </div>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
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
} from '@commercelayer/react-components'
import { Order } from '@commercelayer/js-sdk'
import { useRouter } from 'next/router'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'
let orderId = 'PDerhJplRp'

export default function Main() {
  const [token, setToken] = useState('')
  const [paymentSource, setPaymentSource] = useState<any>(null)
  const { query } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
  }
  // const [shippingMethodId, setShippingMethodId] = useState<string>('')
  const getOrder = async () => {
    const config = { accessToken: token, endpoint }
    const order = await Order.withCredentials(config)
      .includes('paymentSource')
      .find(orderId)
    // @ts-ignore
    if (order.paymentSource()) setPaymentSource(order.paymentSource()?.options)
    // const shipments = await order
    //   .withCredentials(config)
    //   .shipments()
    //   ?.includes('payment_method', 'payment_source')
    //   .load()
    // if (!_.isEmpty(shipments) && shipments) {
    //   const name = shipments.first()?.shippingMethod()?.name
    //   const id = shipments.first()?.shippingMethod()?.id as string
    //   console.log('shipping method name', name)
    //   setShippingMethodName(name as string)
    //   setShippingMethodId(id)
    // }
  }
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getCustomerToken(
        {
          clientId:
            '48ee4802f8227b04951645a9b7c8af1e3943efec7edd1dcfd04b5661bf1da5db',
          endpoint,
          scope: 'market:58',
        },
        {
          username: 'bruce@wayne.com',
          password: '123456',
        }
      )
      if (token) setToken(token.accessToken)
    }
    if (!token) getToken()
    if (token) getOrder()
  }, [token])
  const handleSubmit = (response: any) => {
    setPaymentSource(response.paymentSource.options)
  }
  const submitLabel = (
    <Fragment>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <span className="ml-1">Set payment method</span>
    </Fragment>
  )
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
                  publishableKey: 'pk_test_UArgJuzBMSppFkvAkATXTNT5',
                  handleSubmit: handleSubmit,
                  submitLabel: submitLabel,
                  submitClassName:
                    'mt-5 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                },
              }}
            >
              <PaymentMethod
                className="p-2 my-1 flex items-center justify-items-center bg-gray-300"
                activeClass="bg-opacity-25"
              >
                <PaymentMethodRadioButton data-cy="payment-radio-button" />
                <PaymentMethodName className="pl-3" />
                <PaymentMethodPrice className="pl-3" />
                <PaymentSource data-cy="payment-source" className="p-5 my-2">
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
              </PaymentMethod>
            </PaymentMethodsContainer>
            <PlaceOrderContainer
              options={{
                stripePayment: {
                  publishableKey: 'pk_test_UArgJuzBMSppFkvAkATXTNT5',
                },
                // saveShippingAddressToCustomerBook: true,
                // saveBillingAddressToCustomerBook: true,
                // @ts-ignore
                // savePaymentSourceToCustomerWallet: 1,
              }}
            >
              <div>
                <PlaceOrderButton
                  onClick={(res: any) => {
                    console.log('res', res)
                    debugger
                  }}
                  className="mt-5 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                />
              </div>
            </PlaceOrderContainer>
            <PaymentMethodsContainer>
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
            </PaymentMethodsContainer>
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

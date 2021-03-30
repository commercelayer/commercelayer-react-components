import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  PaymentMethod,
  PaymentMethodAmount,
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
                  submitLabel: 'Set payment method',
                  submitClassName:
                    'mt-5 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                },
              }}
            >
              <PaymentMethod>
                <PaymentMethodRadioButton />
                <PaymentMethodName />
                <PaymentMethodPrice />
                <PaymentSource className="p-5 my-2 bg-gray-50">
                  <div className="flex flex-row items-center justify-start bg-gray-100 p-5 my-10">
                    <div className="flex flex-row items-center">
                      <PaymentSourceBrandIcon className="mr-3" />
                      <PaymentSourceBrandName className="mr-1" />
                      ending in
                      <PaymentSourceDetail className="ml-1" type="last4" />
                    </div>
                    <div className="text-gray-500 ml-5">
                      <PaymentSourceDetail type="expMonth" />/
                      <PaymentSourceDetail type="expYear" />
                    </div>
                    <div className="ml-5">
                      <PaymentSourceEditButton className="text-blue-500 hover:underline hover:text-blue-600" />
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
                saveShippingAddressToCustomerBook: true,
                saveBillingAddressToCustomerBook: true,
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
            <PaymentMethodAmount />
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

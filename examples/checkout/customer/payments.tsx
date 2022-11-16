import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import Head from 'next/head'
import {
  CommerceLayer,
  CustomerContainer,
  Errors,
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
  CustomerCardsType,
} from 'packages/react-components/src'
import { useRouter } from 'next/router'
import '@adyen/adyen-web/dist/adyen.css'
import getSdk from '#utils/getSdk'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string
const username = process.env.NEXT_PUBLIC_CUSTOMER_USERNAME as string
const password = process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD as string

let orderId = 'PDerhJplRp'

let paypalPayerId = ''
let paypalReturnUrl = ''
let checkoutComSession = ''

const TemplateCustomerCards = ({
  customerPayments,
  PaymentSourceProvider,
}: CustomerCardsType) => {
  const components = customerPayments.map((p, k) => {
    return (
      <div
        key={k}
        onClick={p.handleClick}
        className="bg-red-100 p-3 text-sm border ml-2 hover:border-blue-500 cursor-pointer"
      >
        <PaymentSourceProvider value={{ ...p.card }}>
          <div className="flex flex-row items-center">
            <PaymentSourceBrandIcon className="mr-2" />
            <PaymentSourceBrandName className="mr-1" />
            ending in
            <PaymentSourceDetail className="ml-1" type="last4" />
          </div>
          <div className="text-gray-500 ml-3">
            <PaymentSourceDetail type="exp_month" />
            /
            <PaymentSourceDetail type="exp_year" />
          </div>
        </PaymentSourceProvider>
      </div>
    )
  })

  return <>{components}</>
}

const TemplateSaveToWalletCheckbox = ({ name }: any) => (
  <div className="flex flex-row-reverse justify-end">
    <label
      htmlFor="billing_address_save_to_customer_book"
      className="block text-sm font-medium text-gray-700 ml-3 self-end"
    >
      Save new card on your wallet
    </label>
    <div className="mt-1">
      <input
        name={name}
        data-cy="save-to-wallet"
        type="checkbox"
        className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
      />
    </div>
  </div>
)

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
  if (query['cko-session-id']) {
    checkoutComSession = query['cko-session-id'] as string
  }
  // const [shippingMethodId, setShippingMethodId] = useState<string>('')
  const getOrder = async () => {
    const config = { accessToken: token, endpoint }
    const sdk = getSdk(config)
    const order = await sdk.orders.retrieve(orderId, {
      include: ['payment_source'],
    })
    // @ts-ignore
    if (order.payment_source) setPaymentSource(order.payment_source?.options)
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
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId}>
            <CustomerContainer>
              <PaymentMethodsContainer
                config={{
                  stripePayment: {
                    containerClassName: 'p-5 my-2',
                  },
                  paypalPayment: {
                    cancel_url: paypalReturnUrl,
                    return_url: paypalReturnUrl,
                  },
                }}
              >
                <PlaceOrderContainer
                  options={{
                    paypalPayerId,
                    checkoutCom: { session_id: checkoutComSession },
                  }}
                >
                  <div className="flex flex-col">
                    <PaymentMethod
                      className="p-2 my-1 flex flex-wrap w-1/2 items-center justify-items-center bg-gray-300"
                      activeClass="bg-opacity-25"
                      onClick={() => {
                        console.log('custom click payment method')
                      }}
                      clickableContainer
                    >
                      <PaymentMethodRadioButton />
                      <PaymentMethodName className="pl-3" />
                      <PaymentMethodPrice className="pl-3 text-xs text-gray-500" />
                      <PaymentSource
                        className="py-2 my-2 flex flex-row"
                        templateCustomerCards={(props) => (
                          <TemplateCustomerCards {...props} />
                        )}
                        templateCustomerSaveToWallet={(props) => (
                          <TemplateSaveToWalletCheckbox {...props} />
                        )}
                        onClickCustomerCards={() => console.log('clicked')}
                      >
                        <div className="flex flex-row items-center justify-start bg-gray-100 p-3 text-sm border">
                          <div className="flex flex-row items-center">
                            <PaymentSourceBrandIcon className="mr-2" />
                            <PaymentSourceBrandName className="mr-1" />
                            ending in
                            <PaymentSourceDetail
                              className="ml-1"
                              type="last4"
                            />
                          </div>
                          <div className="text-gray-500 ml-3">
                            <PaymentSourceDetail type="exp_month" />
                            /
                            <PaymentSourceDetail type="exp_year" />
                          </div>
                          <div className="ml-3">
                            <PaymentSourceEditButton className="text-blue-500 hover:underline hover:text-blue-600" />
                          </div>
                        </div>
                      </PaymentSource>
                      <Errors
                        className="text-red-600"
                        resource="payment_methods"
                      />
                    </PaymentMethod>
                  </div>

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
              </PaymentMethodsContainer>
            </CustomerContainer>
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

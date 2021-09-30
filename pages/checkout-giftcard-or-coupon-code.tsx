import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  GiftCardOrCouponForm,
  GiftCardOrCouponInput,
  GiftCardOrCouponSubmit,
  DiscountAmount,
  Errors,
  OrderContainer,
  GiftCardOrCouponCode,
  GiftCardOrCouponRemoveButton,
} from '@commercelayer/react-components'
import { useRouter } from 'next/router'
// import { Order } from '@commercelayer/js-sdk'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string
const username = process.env.NEXT_PUBLIC_CUSTOMER_USERNAME as string
const password = process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD as string

let orderId = 'PDerhJplRp'

export default function Main() {
  const [token, setToken] = useState('')
  const [codeError, setCodeError] = useState(false)
  const { query } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
  }
  const classError = codeError
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : ''
  const handleSubmit = ({ success }: { success: boolean }) => {
    console.log(`success`, success)
    if (!success) return setCodeError(true)
    return setCodeError(false)
  }
  const removeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
  // const [shippingMethodId, setShippingMethodId] = useState<string>('')
  // const getOrder = async () => {
  //   const config = { accessToken: token, endpoint }
  //   const order = await Order.withCredentials(config).find(orderId)
  // }
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
    // if (token) getOrder()
  }, [token])
  const labelButton = (
    <Fragment>
      <svg
        className="h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
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
            <GiftCardOrCouponForm onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Coupon or Gift Card code
                </label>
                <div className={`mt-1 flex rounded-md shadow-sm`}>
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    {/* <input type="text" name="email" id="email"  placeholder="John Doe"> */}
                    <GiftCardOrCouponInput
                      data-cy="code-input"
                      className={`${classError} focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300`}
                    />
                  </div>
                  <GiftCardOrCouponSubmit
                    data-cy="code-submit"
                    label={labelButton}
                    className={`${classError} -ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                </div>
              </div>
            </GiftCardOrCouponForm>
            <Errors
              data-cy="code-error"
              className={classError}
              resource="order"
              field="giftCardOrCouponCode"
            />
            <p>
              Discount <DiscountAmount />
            </p>
            <div>
              <GiftCardOrCouponCode className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 text-indigo-700">
                {(props) => {
                  const { hide, code, ...p } = props
                  return hide ? null : (
                    <Fragment>
                      <span data-cy="code-label" {...p}>
                        {code}
                        <GiftCardOrCouponRemoveButton
                          data-cy="code-remove"
                          className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                          label={removeIcon}
                        />
                      </span>
                    </Fragment>
                  )
                }}
              </GiftCardOrCouponCode>
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

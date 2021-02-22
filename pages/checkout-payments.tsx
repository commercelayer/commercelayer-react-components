import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  PaymentMethod,
  PaymentMethodName,
  PaymentMethodsContainer,
} from '@commercelayer/react-components'
import { Order } from '@commercelayer/js-sdk'
import _ from 'lodash'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'
const orderId = 'JwXQehvvyP'

export default function Main() {
  const [token, setToken] = useState('')
  // const [shippingMethodName, setShippingMethodName] = useState('')
  // const [shippingMethodId, setShippingMethodId] = useState<string>('')
  const getOrder = async () => {
    const config = { accessToken: token, endpoint }
    const order = await Order.withCredentials(config).find(orderId)
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
  // const handleChange = (shippingMethod: any) => {
  //   setShippingMethodName(shippingMethod.name)
  //   setShippingMethodId(shippingMethod.id)
  // }
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId}>
            <PaymentMethodsContainer>
              <PaymentMethod>
                <PaymentMethodName />
              </PaymentMethod>
            </PaymentMethodsContainer>
          </OrderContainer>
          {/* <div className="mt-5">
            <pre data-cy="current-shipping-method">{`Current shipping method: ${JSON.stringify(
              shippingMethodName,
              null,
              2
            )}`}</pre>
            <pre data-cy="current-shipping-method-id">{`Current shipping method ID: ${JSON.stringify(
              shippingMethodId,
              null,
              2
            )}`}</pre>
          </div> */}
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

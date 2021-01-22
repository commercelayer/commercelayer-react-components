import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  ShipmentsContainer,
} from '@commercelayer/react-components'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'
const orderId = 'JwXQehvvyP'

export default function Main() {
  const [token, setToken] = useState('')
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
    if (!token) {
      getToken()
    }
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
            <ShipmentsContainer>
              <div>Shipments</div>
            </ShipmentsContainer>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

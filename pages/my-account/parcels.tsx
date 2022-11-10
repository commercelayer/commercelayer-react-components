import { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  Shipment,
  ShipmentsContainer,
  ShipmentField,
  Errors,
  Parcels,
  ParcelField,
  ParcelLineItem,
  ParcelLineItemField,
  ShipmentsCount,
  ParcelsCount,
  ParcelLineItemsCount
} from 'packages/react-components/src'
import { useRouter } from 'next/router'

const clientId = process.env['NEXT_PUBLIC_CLIENT_ID'] as string
const endpoint = process.env['NEXT_PUBLIC_ENDPOINT'] as string
const scope = process.env['NEXT_PUBLIC_MARKET_ID'] as string
const username = process.env['NEXT_PUBLIC_USERNAME'] as string
const password = process.env['NEXT_PUBLIC_PASSWORD'] as string
let orderId = 'NrnYhAdEkx'

export default function Main() {
  const [token, setToken] = useState('')
  const { query } = useRouter()
  if (query['orderId']) {
    orderId = query['orderId'] as string
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
  }, [token])
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId} loader={<span>Caricamento...</span>}>
            <ShipmentsContainer>
              <Shipment>
                <div className="flex">
                  Shipments N:
                  <ShipmentField className="font-bold pl-1" name="key_number" />
                  /<ShipmentsCount className="font-bold pl-1" />
                </div>
                  <p>
                    Total parcels: <ParcelsCount />
                  </p>
                <Parcels>
                  <p>
                    Parcel line Items count: <ParcelLineItemsCount />
                  </p>
                  <ParcelField attribute='number' tagElement='span' />
                  <ParcelLineItem>
                    <p>{'Sku code'}</p>
                    <ParcelLineItemField tagElement='p' attribute='sku_code' data-testid="test" />
                    <p>{'Quantity'}</p>
                    <ParcelLineItemField tagElement='p' attribute='quantity' />
                    <p>{'Name'}</p>
                    <ParcelLineItemField tagElement='p' attribute='name' />
                    <p>{'Image'}</p>
                    <ParcelLineItemField tagElement='img' attribute='image_url' />
                  </ParcelLineItem>
                </Parcels>
              </Shipment>
              <Errors resource="line_items" />
              <Errors resource="shipments" />
            </ShipmentsContainer>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import LineItemsContainer from '../src/components/LineItemsContainer'
import LineItem from '../src/components/LineItem'
import LineItemImage from '../src/components/LineItemImage'
import LineItemName from '../src/components/LineItemName'
import LineItemQuantity from '../src/components/LineItemQuantity'
import LineItemAmount from '../src/components/LineItemAmount'
import SubTotalAmount from '../src/components/SubTotalAmount'
import LineItemsCount from '../src/components/LineItemsCount'
import TotalAmount from '../src/components/TotalAmount'
import DiscountAmount from '../src/components/DiscountAmount'
import ShippingAmount from '../src/components/ShippingAmount'
import TaxesAmount from '../src/components/TaxesAmount'
import GiftCardAmount from '../src/components/GiftCardAmount'
import Head from 'next/head'
import { OrderNumber } from '@commercelayer/react-components'
import { OrderStorage } from 'dist'
import { useRouter } from 'next/router'
const endpoint = 'https://the-blue-brand-3.commercelayer.co'
let orderId = 'qaMAhJzGnx'

export default function Order() {
  const [token, setToken] = useState('')
  const { query } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
  }
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getSalesChannelToken({
        clientId:
          '48ee4802f8227b04951645a9b7c8af1e3943efec7edd1dcfd04b5661bf1da5db',
        endpoint,
        scope: 'market:58',
      })
      if (token) setToken(token.accessToken)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderStorage persistKey="orderUS">
            <OrderContainer orderId={orderId}>
              <h1 className="text-4xl border-b-2 my-5">
                Order Summary n - <OrderNumber />
              </h1>
              <LineItemsContainer>
                <p className="text-sm m-2">
                  Your shopping bag contains{' '}
                  <LineItemsCount id="items-count" className="font-bold" />{' '}
                  items
                </p>
                <div className="flex flex-col p-2">
                  <LineItem>
                    <div className="flex justify-around items-center border-b p-5">
                      <LineItemImage className="p-2" width={80} />
                      <LineItemName id="line-item-name" className="p-2" />
                      <LineItemQuantity
                        id="line-item-quantity"
                        max={100}
                        className="p-2"
                        readonly
                      />
                      <LineItemAmount id="line-item-total" className="p-2" />
                    </div>
                  </LineItem>
                  <LineItem type="gift_cards">
                    <div className="flex justify-between items-center border-b p-5">
                      <LineItemImage className="p-2" width={40} />
                      <LineItemName id="line-item-name" className="p-2" />
                      <LineItemQuantity
                        id="line-item-quantity"
                        max={10}
                        className="p-2"
                        readonly
                      />
                      <LineItemAmount id="line-item-total" className="p-2" />
                    </div>
                  </LineItem>
                </div>
              </LineItemsContainer>
              <div className="flex flex-col w-1/2 m-auto">
                <div className="flex items-center p-2 justify-around font-medium text-left">
                  <div className="w-full">
                    <p className="text-lg">Subtotal </p>
                  </div>
                  <div className="text-right">
                    <SubTotalAmount />
                  </div>
                </div>
                <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                  <div className="w-full">
                    <p className="text-lg">Discount </p>
                  </div>
                  <div className="text-right">
                    <DiscountAmount>
                      {(props) => {
                        return null
                      }}
                    </DiscountAmount>
                  </div>
                </div>
                <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                  <div className="w-full">
                    <p className="text-lg">Shipping </p>
                  </div>
                  <div className="text-right">
                    <ShippingAmount />
                  </div>
                </div>
                <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                  <div className="w-full">
                    <p className="text-lg">
                      Taxes <span className="text-sm font-tin">(included)</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <TaxesAmount />
                  </div>
                </div>
                <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                  <div className="w-full">
                    <p className="text-lg">Gift card </p>
                  </div>
                  <div className="text-right">
                    <GiftCardAmount />
                  </div>
                </div>
                <div className=" flex items-center p-2 justify-around font-bold text-left">
                  <div className="w-full">
                    <p className="text-lg mr-2">Total </p>
                  </div>
                  <div className="text-right">
                    <TotalAmount id="total-amount" />
                  </div>
                </div>
              </div>
            </OrderContainer>
          </OrderStorage>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

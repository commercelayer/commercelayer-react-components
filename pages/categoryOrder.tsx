import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import PriceContainer from '../src/components/PriceContainer'
import Price from '../src/components/Price'
import AddToCart from '../src/components/AddToCart'
import LineItemsContainer from '../src/components/LineItemsContainer'
import LineItem from '../src/components/LineItem'
import LineItemImage from '../src/components/LineItemImage'
import LineItemName from '../src/components/LineItemName'
import LineItemQuantity from '../src/components/LineItemQuantity'
import LineItemPrice from '../src/components/LineItemPrice'
import LineItemRemove from '../src/components/LineItemRemove'
import Checkout from '../src/components/Checkout'
import SubTotal from '../src/components/SubTotal'
import QuantitySelector from '../src/components/QuantitySelector'
import LineItemsCount from '../src/components/LineItemsCount'
import Total from '../src/components/Total'
import Discount from '../src/components/Discount'
import Shipping from '../src/components/Shipping'
import Taxes from '../src/components/Taxes'
import GiftCard from '../src/components/GiftCardPrice'
import AvailabilityContainer from '../src/components/AvailabilityContainer'
import AvailabilityTemplate from '../src/components/AvailabilityTemplate'
import ItemContainer from '../src/components/ItemContainer'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

export default function Order() {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      const auth = await getSalesChannelToken({
        clientId:
          '4769bcf1998d700d5e159a89b24233a1ecec7e1524505fb8b7652c3e10139d78',
        endpoint,
        scope: 'market:48',
      })
      setToken(auth?.accessToken as string)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Nav links={['/']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer persistKey="orderUS">
            <ItemContainer>
              <PriceContainer>
                <div className="w-full md:flex md:flex-row justify-between">
                  <div className="flex-col border rounded-lg shadow p-3 m-3">
                    <div className="p-2">
                      <img
                        className="w-48 mx-auto"
                        src="https://img.commercelayer.io/skus/BABYONBU000000E63E74.png?fm=jpg&q=90"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-lg w-full text-center">
                        Black Baby Onesie Short Sleeve with Pink Logo (6 Months)
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="font-light text-xs text-gray-700 text-center">
                        BABYONBU000000E63E746MXX
                      </p>
                    </div>
                    <div className="pt-2 text-center">
                      <Price
                        skuCode="BABYONBU000000E63E746MXX"
                        className="text-green-600 text-xl m-1"
                        compareClassName="text-gray-600 text-xl m-1 line-through font-light"
                      />
                    </div>
                    <div className="pt-2">
                      <QuantitySelector
                        className="w-2/3 mx-auto block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        skuCode="BABYONBU000000E63E746MXX"
                      />
                    </div>
                    <div className="pt-2 w-full text-center">
                      <AddToCart
                        skuCode="BABYONBU000000E63E746MXX"
                        className="w-2/3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      />
                    </div>
                    <div className="pt-2">
                      <AvailabilityContainer>
                        <AvailabilityTemplate />
                      </AvailabilityContainer>
                    </div>
                  </div>
                  <div className="flex-col border rounded-lg shadow p-3 m-3">
                    <div className="p-2">
                      <img
                        className="w-48 mx-auto"
                        src="https://img.commercelayer.io/skus/LSLEEVMMFFFFFF000000.png?fm=jpg&q=90"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-lg w-full text-center">
                        White Long Sleeve T-shirt with Black Logo (L)
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="font-light text-xs text-gray-700 text-center">
                        LSLEEVMMFFFFFF000000LXXX
                      </p>
                    </div>
                    <div className="pt-2 text-center">
                      <Price
                        skuCode="LSLEEVMMFFFFFF000000LXXX"
                        className="text-green-600 text-xl m-1"
                        compareClassName="text-gray-600 text-xl m-1 line-through font-light"
                      />
                    </div>
                    <div className="pt-2">
                      <QuantitySelector
                        className="w-2/3 mx-auto block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        skuCode="LSLEEVMMFFFFFF000000LXXX"
                      />
                    </div>
                    <div className="pt-2 w-full text-center">
                      <AddToCart
                        skuCode="LSLEEVMMFFFFFF000000LXXX"
                        className="w-2/3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      />
                    </div>
                    <div className="pt-2">
                      <AvailabilityContainer>
                        <AvailabilityTemplate />
                      </AvailabilityContainer>
                    </div>
                  </div>
                  <div className="flex-col border rounded-lg shadow p-3 m-3">
                    <div className="p-2">
                      <img
                        className="w-48 mx-auto"
                        src="https://img.commercelayer.io/skus/CANVASAUE63E74FFFFFF.png?fm=jpg&q=90"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-lg w-full text-center">
                        Pink Canvas with White Logo (18x24)
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="font-light text-xs text-gray-700 text-center">
                        CANVASAUE63E74FFFFFF1824FAKE
                      </p>
                    </div>
                    <div className="pt-2 text-center">
                      <Price
                        skuCode="CANVASAUE63E74FFFFFF1824FAKE"
                        className="text-green-600 text-xl m-1"
                        compareClassName="text-gray-600 text-xl m-1 line-through font-light"
                      />
                    </div>
                    <div className="pt-2">
                      <QuantitySelector
                        className="w-2/3 mx-auto block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:opacity-50"
                        skuCode="CANVASAUE63E74FFFFFF1824FAKE"
                      />
                    </div>
                    <div className="pt-2 w-full text-center">
                      <AddToCart
                        skuCode="CANVASAUE63E74FFFFFF1824FAKE"
                        className="w-2/3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      />
                    </div>
                    <div className="pt-2">
                      <AvailabilityContainer>
                        <AvailabilityTemplate />
                      </AvailabilityContainer>
                    </div>
                  </div>
                </div>
              </PriceContainer>
            </ItemContainer>
            <h1 className="text-4xl border-b-2 my-5">Shopping Bag</h1>
            <LineItemsContainer>
              <p className="text-sm m-2">
                Your shopping bag contains{' '}
                <LineItemsCount id="items-count" className="font-bold" /> items
              </p>
              <LineItem type="skus">
                <div className="flex justify-around items-center border-b">
                  <LineItemImage className="p-2" width={80} />
                  <LineItemName id="line-item-name" className="p-2" />
                  <LineItemQuantity
                    id="line-item-quantity"
                    max={10}
                    className="p-2"
                  />
                  <LineItemPrice id="line-item-total" className="p-2" />
                  <LineItemRemove
                    id="line-item-remove"
                    className="p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  />
                </div>
              </LineItem>
            </LineItemsContainer>
            <div className="flex flex-col w-1/2 m-auto">
              <div className="flex items-center p-2 justify-around font-medium text-left">
                <div className="w-full">
                  <p className="text-lg">Subtotal </p>
                </div>
                <div className="text-right">
                  <SubTotal />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Discount </p>
                </div>
                <div className="text-right">
                  <Discount />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Shipping </p>
                </div>
                <div className="text-right">
                  <Shipping />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">
                    Taxes <span className="text-sm font-tin">(included)</span>
                  </p>
                </div>
                <div className="text-right">
                  <Taxes />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Gift card </p>
                </div>
                <div className="text-right">
                  <GiftCard />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around font-bold text-left">
                <div className="w-full">
                  <p className="text-lg mr-2">Total </p>
                </div>
                <div className="text-right">
                  <Total id="total-amount" />
                </div>
              </div>
            </div>
            <div className="flex justify-center p-2">
              <Checkout className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

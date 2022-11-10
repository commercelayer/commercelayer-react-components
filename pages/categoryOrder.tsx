import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../#components/auth/CommerceLayer'
import OrderContainer from '../#components/OrderContainer'
import PriceContainer from '../#components/prices/PricesContainer'
import Price from '../#components/Price'
import AddToCart from '../#components/orders/AddToCartButton'
import LineItemsContainer from '../#components/LineItemsContainer'
import LineItem from '../#components/line_items/LineItem'
import LineItemImage from '../#components/LineItemImage'
import LineItemName from '../#components/LineItemName'
import LineItemQuantity from '../#components/LineItemQuantity'
import LineItemAmount from '../#components/LineItemAmount'
import LineItemRemoveLink from '../#components/LineItemRemoveLink'
import CheckoutLink from '../#components/orders/CheckoutLink'
import SubTotalAmount from '../#components/SubTotalAmount'
import QuantitySelector from '../#components/skus/QuantitySelector'
import LineItemsCount from '../#components/LineItemsCount'
import TotalAmount from '../#components/orders/TotalAmount'
import DiscountAmount from '../#components/orders/DiscountAmount'
import ShippingAmount from '../#components/orders/ShippingAmount'
import TaxesAmount from '../#components/TaxesAmount'
import GiftCardAmount from '../#components/orders/GiftCardAmount'
import AvailabilityContainer from '../#components/AvailabilityContainer'
import AvailabilityTemplate from '../#components/skus/AvailabilityTemplate'
import ItemContainer from '../#components/orders/ItemContainer'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string
// const username = process.env.NEXT_PUBLIC_CUSTOMER_USERNAME as string
// const password = process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD as string

export default function Order() {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      const auth = await getSalesChannelToken({
        clientId,
        endpoint,
        scope,
      })
      setToken(auth?.accessToken as string)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer>
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
                    <div
                      data-cy="price-BABYONBU000000E63E746MXX"
                      className="pt-2 text-center"
                    >
                      <Price
                        skuCode="BABYONBU000000E63E746MXX"
                        className="text-green-600 text-xl m-1"
                        compareClassName="text-gray-600 text-xl m-1 line-through font-light"
                      />
                    </div>
                    <div className="pt-2">
                      <QuantitySelector
                        data-cy="BABYONBU000000E63E746MXX-quantity-selector"
                        className="w-2/3 mx-auto block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        skuCode="BABYONBU000000E63E746MXX"
                      />
                    </div>
                    <div className="pt-2 w-full text-center">
                      <AddToCart
                        data-cy="BABYONBU000000E63E746MXX-button"
                        skuCode="BABYONBU000000E63E746MXX"
                        className="w-2/3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      />
                    </div>
                    <div className="pt-2">
                      <AvailabilityContainer skuCode="BABYONBU000000E63E746MXX">
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
                        data-cy="LSLEEVMMFFFFFF000000LXXX-price"
                        skuCode="LSLEEVMMFFFFFF000000LXXX"
                        className="text-green-600 text-xl m-1"
                        compareClassName="text-gray-600 text-xl m-1 line-through font-light"
                      />
                    </div>
                    <div className="pt-2">
                      <QuantitySelector
                        data-cy="LSLEEVMMFFFFFF000000LXXX-quantity-selector"
                        className="w-2/3 mx-auto block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        skuCode="LSLEEVMMFFFFFF000000LXXX"
                      />
                    </div>
                    <div className="pt-2 w-full text-center">
                      <AddToCart
                        data-cy="LSLEEVMMFFFFFF000000LXXX-add-to-cart"
                        skuCode="LSLEEVMMFFFFFF000000LXXX"
                        className="w-2/3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        lineItem={{
                          name: 'Darth Vader Sleeve',
                          imageUrl:
                            'https://i.pinimg.com/736x/a5/32/de/a532de337eff9b1c1c4bfb8df73acea4--darth-vader-stencil-darth-vader-head.jpg?b=t',
                        }}
                      />
                    </div>
                    <div className="pt-2">
                      <AvailabilityContainer skuCode="LSLEEVMMFFFFFF000000LXXX">
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
                  <LineItemAmount id="line-item-total" className="p-2" />
                  <LineItemRemoveLink
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
                  <SubTotalAmount />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Discount </p>
                </div>
                <div className="text-right">
                  <DiscountAmount />
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
            <div className="flex justify-center p-2">
              <CheckoutLink className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

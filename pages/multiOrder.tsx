import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import VariantContainer from '../src/components/VariantsContainer'
import VariantSelector from '../src/components/VariantSelector'
import PriceContainer from '../src/components/PricesContainer'
import Price from '../src/components/Price'
import AddToCart from '../src/components/AddToCartButton'
import LineItemsContainer from '../src/components/LineItemsContainer'
import LineItem from '../src/components/LineItem'
import LineItemImage from '../src/components/LineItemImage'
import LineItemName from '../src/components/LineItemName'
import LineItemQuantity from '../src/components/LineItemQuantity'
import LineItemPrice from '../src/components/LineItemAmount'
import LineItemRemove from '../src/components/LineItemRemoveLink'
import Checkout from '../src/components/CheckoutLink'
import SubTotal from '../src/components/SubTotalAmount'
import QuantitySelector from '../src/components/QuantitySelector'
import LineItemsCount from '../src/components/LineItemsCount'
import Total from '../src/components/TotalAmount'
import Discount from '../src/components/DiscountAmount'
import Shipping from '../src/components/ShippingAmount'
import Taxes from '../src/components/TaxesAmount'
import GiftCardPrice from '../src/components/GiftCardAmount'
import ItemContainer from '../src/components/ItemContainer'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

const CustomAddToCart = (props) => {
  const classes = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  return (
    <button
      name={props.name}
      className={`${classes} ${props.className}`}
      onClick={props.handleClick}
      disabled={props.disabled}
    >
      Custom add to cart
    </button>
  )
}

export default function Order() {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const { accessToken } = await getSalesChannelToken({
        clientId:
          '4769bcf1998d700d5e159a89b24233a1ecec7e1524505fb8b7652c3e10139d78',
        endpoint,
        scope: 'market:48',
      })
      setToken(accessToken)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Nav links={['/']} />
      <CommerceLayer accessToken={token} endpoint={endpoint} cache>
        <div className="max-w-full mx-auto mt-5 p-5">
          <OrderContainer persistKey="orderUS">
            <ItemContainer>
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    className="rounded-lg md:w-56"
                    src="https://img.commercelayer.io/skus/BABYONBU000000E63E74.png?fm=jpg&q=90"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-6">
                  <h1 className="text-4xl">Tutina da Bambino</h1>
                  <VariantContainer>
                    <div className="w-auto m-2">
                      <PriceContainer skuCode="BABYONBU000000E63E746MXX">
                        <Price
                          className="text-green-600 text-2xl m-1"
                          compareClassName="text-gray-500 text-2xl m-1 line-through"
                        />
                      </PriceContainer>
                    </div>
                    <div className="m-2">
                      <VariantSelector
                        className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        name="selector-us"
                        skuCodes={[
                          {
                            label: '6 months',
                            code: 'BABYONBU000000E63E746MXX',
                          },
                          {
                            label: '12 months',
                            code: 'BABYONBU000000E63E7412MX',
                          },
                          {
                            label: '24 months',
                            code: 'BABYONBU000000E63E746MXXFAKE',
                          },
                        ]}
                      />
                    </div>
                    <div className="m-2">
                      <QuantitySelector
                        name="qty-us"
                        className="w-full block w-1/2 bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      />
                    </div>
                    <div className="m-2">
                      <AddToCart
                        name="add-us"
                        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        {CustomAddToCart}
                      </AddToCart>
                    </div>
                  </VariantContainer>
                </div>
              </div>
            </ItemContainer>
            <h1 className="text-4xl border-b-2 my-5">Shopping Bag</h1>
            <LineItemsContainer>
              <p className="text-sm m-2">
                Your shopping bag contains{' '}
                <LineItemsCount name="count-us" className="font-bold" /> items
              </p>
              <div className="flex flex-col p-2">
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
              </div>
            </LineItemsContainer>
            <div className="flex flex-col w-1/2 m-auto">
              <div className="flex items-center p-2 justify-around font-medium text-left">
                <div className="w-full">
                  <p className="text-lg">Subtotal </p>
                </div>
                <div className="text-right">
                  <SubTotal name="subtotal-us" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Discount </p>
                </div>
                <div className="text-right">
                  <Discount name="discount-us" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Shipping </p>
                </div>
                <div className="text-right">
                  <Shipping name="shipping-us" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">
                    Taxes <span className="text-sm font-tin">(included)</span>
                  </p>
                </div>
                <div className="text-right">
                  <Taxes name="taxes-us" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Gift card </p>
                </div>
                <div className="text-right">
                  <GiftCardPrice name="shipping-us" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around font-bold text-left">
                <div className="w-full">
                  <p className="text-lg mr-2">Total </p>
                </div>
                <div className="text-right">
                  <Total name="total-us" />
                </div>
              </div>
            </div>
            <div className="flex justify-center p-2">
              <Checkout className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" />
            </div>
          </OrderContainer>
        </div>
        <div className="max-w-full p-5 mx-auto mt-5 bg-gray-900 text-gray-300">
          <OrderContainer persistKey="orderIT">
            <ItemContainer>
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    className="rounded-lg md:w-56"
                    src="https://img.commercelayer.io/skus/BABYONBUFFFFFF000000.png?fm=png&q=90"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-6">
                  <h1 className="text-4xl">Tutina da Bambino</h1>
                  <VariantContainer>
                    <div className="w-auto m-2">
                      <PriceContainer skuCode="BABYONBUFFFFFF00000012MX">
                        <Price
                          className="text-green-600 text-2xl m-1"
                          compareClassName="text-gray-500 text-2xl m-1 line-through"
                        />
                      </PriceContainer>
                    </div>
                    <div className="m-2">
                      <VariantSelector
                        className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        name="selector-it"
                        skuCodes={[
                          {
                            label: '12 months',
                            code: 'BABYONBUFFFFFF00000012MX',
                          },
                          {
                            label: '6 months',
                            code: 'BABYONBUFFFFFF0000006MXX',
                          },
                          {
                            label: '24 months',
                            code: 'BABYONBUFFFFFF00000012MXFAKE',
                          },
                        ]}
                      />
                    </div>
                    <div className="m-2">
                      <QuantitySelector
                        name="qty-it"
                        className="w-full block w-1/2 bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      />
                    </div>
                    <div className="m-2">
                      <AddToCart
                        name="add-it"
                        className="w-full bg-green-500 hover:bg-green-700 text-gray-900 font-bold py-2 px-4 rounded"
                      >
                        {CustomAddToCart}
                      </AddToCart>
                    </div>
                  </VariantContainer>
                </div>
              </div>
            </ItemContainer>
            <h1 className="text-4xl border-b-2 my-5">Shopping Bag</h1>
            <LineItemsContainer>
              <p className="text-sm m-2">
                Your shopping bag contains{' '}
                <LineItemsCount name="count-it" className="font-bold" /> items
              </p>
              <div className="flex flex-col p-2">
                <LineItem type="skus">
                  <div className="flex justify-around items-center border-b">
                    <LineItemImage className="p-2" width={80} />
                    <LineItemName id="line-item-name" className="p-2" />
                    <LineItemQuantity
                      id="line-item-quantity"
                      max={10}
                      className="p-2 text-gray-900"
                    />
                    <LineItemPrice id="line-item-total" className="p-2" />
                    <LineItemRemove
                      id="line-item-remove"
                      className="p-2 bg-red-500 hover:bg-red-700 text-gray-900 font-bold py-2 px-4 rounded"
                    />
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
                  <SubTotal name="subtotal-it" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Discount </p>
                </div>
                <div className="text-right">
                  <Discount name="discount-it" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Shipping </p>
                </div>
                <div className="text-right">
                  <Shipping name="shipping-it" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">
                    Taxes <span className="text-sm font-tin">(included)</span>
                  </p>
                </div>
                <div className="text-right">
                  <Taxes name="taxes-it" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Gift card </p>
                </div>
                <div className="text-right">
                  <GiftCardPrice name="giftcard-it" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around font-bold text-left">
                <div className="w-full">
                  <p className="text-lg mr-2">Total </p>
                </div>
                <div className="text-right">
                  <Total name="total-it" />
                </div>
              </div>
            </div>
            <div className="flex justify-center p-2">
              <Checkout className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-gray-900 font-bold py-2 px-4 rounded" />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

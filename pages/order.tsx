import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/CommerceLayer'
import { Nav, Title, Type } from '.'
import OrderContainer from '../src/components/OrderContainer'
import VariantContainer from '../src/components/VariantContainer'
import VariantSelector from '../src/components/VariantSelector'
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
import Total from '../src/components/Total'
import Checkout from '../src/components/Checkout'
import SubTotal from '../src/components/SubTotal'
import QuantitySelector from '../src/components/QuantitySelector'
import TaxAmount from '../src/components/TaxAmount'
import LineItemsCount from '../src/components/LineItemsCount'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

const CustomAddToCart = props => {
  const classes = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  return (
    <button
      className={`${classes} ${props.className}`}
      onClick={props.handleClick}
    >
      Custom add to cart
    </button>
  )
}

export default function Order() {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      const { accessToken } = await getSalesChannelToken({
        clientId:
          '4769bcf1998d700d5e159a89b24233a1ecec7e1524505fb8b7652c3e10139d78',
        endpoint,
        scope: 'market:48'
      })
      setToken(accessToken)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Nav links={['/']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5">
          <OrderContainer persistKey="orderUS">
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
                        amountClassName="text-green-600 text-2xl m-1"
                        compareClassName="text-gray-500 text-2xl m-1 line-through"
                      />
                    </PriceContainer>
                  </div>
                  <div className="m-2">
                    <VariantSelector
                      className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      name="variant1"
                      skuCodes={[
                        'BABYONBU000000E63E746MXX',
                        'BABYONBU000000E63E7412MX'
                      ]}
                      variantLabels={['6 months', '12 months']}
                    />
                  </div>
                  <div className="m-2">
                    <QuantitySelector className="w-full block w-1/2 bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
                  </div>
                  <div className="m-2">
                    <AddToCart className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                      {CustomAddToCart}
                    </AddToCart>
                  </div>
                </VariantContainer>
              </div>
            </div>
            <h1 className="text-4xl border-b-2 my-5">Shopping Bag</h1>
            <p className="text-sm m-2">
              Your shopping bag contains{' '}
              <LineItemsCount className="font-bold" /> items
            </p>
            <div className="flex items-center m-2">
              <h1 className="text-lg mr-2">Total: </h1>
              <Total />
            </div>
            <div className="flex flex-col p-2">
              <LineItemsContainer>
                <LineItem type="skus">
                  <div className="flex justify-around items-center border-t">
                    <LineItemImage className="p-2" width={80} />
                    <LineItemName className="p-2" />
                    <LineItemQuantity className="p-2" />
                    <LineItemPrice className="p-2" />
                    <LineItemRemove className="p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" />
                  </div>
                </LineItem>
              </LineItemsContainer>
            </div>
            <div className="flex flex-row-reverse border-t p-2">
              <Checkout className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

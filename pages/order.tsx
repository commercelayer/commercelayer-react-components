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

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

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
        <div>
          <OrderContainer persistKey="orderUS">
            <Title title="Order Container" />
            <VariantContainer>
              <Type text="select type" />
              <VariantSelector
                name="variant1"
                skuCodes={[
                  'BABYONBU000000E63E746MXX',
                  'BABYONBU000000E63E7412MX'
                ]}
                variantLabels={['6 months', '12 months']}
              />
              <div>
                <PriceContainer skuCode="BABYONBU000000E63E746MXX">
                  <Price />
                </PriceContainer>
              </div>
              <QuantitySelector />
              <AddToCart className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
            </VariantContainer>
            <div className="flex mb-4">
              <Total className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" />
              <SubTotal className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" />
            </div>
            <LineItemsContainer>
              <LineItem type="skus">
                <div>
                  <LineItemImage width={80} />
                </div>
                <LineItemName />
                <LineItemQuantity />
                <LineItemPrice />
                <LineItemRemove className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" />
              </LineItem>
            </LineItemsContainer>
            <Checkout className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" />
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

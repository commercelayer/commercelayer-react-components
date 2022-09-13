import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/auth/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import VariantsContainer from '../src/components/skus/VariantsContainer'
import VariantSelector from '../src/components/VariantSelector'
import PricesContainer from '../src/components/prices/PricesContainer'
import Price from '../src/components/Price'
import AddToCartButton, {
  AddToCartButtonTemplate,
} from '../src/components/orders/AddToCartButton'
import LineItemsContainer from '../src/components/LineItemsContainer'
import LineItem from '../src/components/line_items/LineItem'
import LineItemImage from '../src/components/LineItemImage'
import LineItemName from '../src/components/LineItemName'
import LineItemQuantity from '../src/components/LineItemQuantity'
import LineItemAmount from '../src/components/LineItemAmount'
import LineItemRemoveLink from '../src/components/LineItemRemoveLink'
import CheckoutLink from '../src/components/orders/CheckoutLink'
import SubTotalAmount from '../src/components/SubTotalAmount'
import QuantitySelector from '../src/components/skus/QuantitySelector'
import LineItemsCount from '../src/components/LineItemsCount'
import TotalAmount from '../src/components/orders/TotalAmount'
import DiscountAmount from '../src/components/orders/DiscountAmount'
import ShippingAmount from '../src/components/orders/ShippingAmount'
import TaxesAmount from '../src/components/TaxesAmount'
import GiftCardAmount from '../src/components/orders/GiftCardAmount'
import AvailabilityContainer from '../src/components/skus/AvailabilityContainer'
import AvailabilityTemplate from '../src/components/AvailabilityTemplate'
import ItemContainer from '../src/components/orders/ItemContainer'
import Errors from '../src/components/Errors'
import SkuOptionsContainer from '../src/components/SkuOptionsContainer'
import SkuOption from '../src/components/SkuOption'
import SkuOptionInput from '../src/components/SkuOptionInput'
import LineItemOptions from '../src/components/LineItemOptions'
import LineItemOption from '../src/components/LineItemOption'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string

const CustomAddToCart = (props: AddToCartButtonTemplate) => {
  const classes = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  const myClick = () => {
    props.handleClick()
  }
  return (
    <button
      id="add-to-bag"
      className={`${classes} ${props.className}`}
      onClick={myClick}
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
        clientId,
        endpoint,
        scope,
      })
      if (accessToken) setToken(accessToken)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer>
            <ItemContainer>
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    alt=""
                    className="rounded-lg md:w-56"
                    src="https://img.commercelayer.io/skus/BABYONBU000000E63E74.png?fm=jpg&q=90"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-6">
                  <h1 className="text-4xl">Tutina da Bambino</h1>
                  <div className="w-auto m-2">
                    <PricesContainer skuCode="BABYONBU000000E63E746MXX">
                      <Price
                        className="text-green-600 text-2xl m-1"
                        compareClassName="text-gray-500 text-2xl m-1 line-through"
                      />
                    </PricesContainer>
                  </div>
                  <VariantsContainer>
                    <div className="m-2">
                      <VariantSelector
                        id="variant-selector"
                        className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        name="variant1"
                        options={[
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
                  </VariantsContainer>
                  <div className="m-2">
                    <SkuOptionsContainer>
                      <SkuOption id="mNJEgsJwBn">
                        <SkuOptionInput
                          name="message"
                          type="text"
                          className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          placeholder="Message"
                        />
                        <SkuOptionInput
                          name="size"
                          type="text"
                          className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          placeholder="Text size"
                        />
                      </SkuOption>
                      <SkuOption id="gNlGlsAOBk">
                        <SkuOptionInput
                          name="back"
                          type="text"
                          className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          placeholder="Back color"
                        />
                      </SkuOption>
                    </SkuOptionsContainer>
                  </div>
                  <div className="m-2">
                    <QuantitySelector
                      max={12}
                      id="quantity-selector"
                      className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                  </div>
                  <div className="m-2">
                    <AddToCartButton className="w-full primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                      {CustomAddToCart}
                    </AddToCartButton>
                  </div>
                  <div className="m-2">
                    <AvailabilityContainer>
                      <AvailabilityTemplate showShippingMethodName />
                    </AvailabilityContainer>
                  </div>
                </div>
              </div>
            </ItemContainer>
            <h1 className="text-4xl border-b-2 my-5">Shopping Bag</h1>
            <LineItemsContainer>
              <p className="text-sm m-2">
                Your shopping bag contains{' '}
                <LineItemsCount id="items-count" className="font-bold" /> items
              </p>
              <div className="flex flex-col p-2">
                <LineItem>
                  <div className="flex justify-around items-center border-b p-5">
                    <LineItemImage className="p-2" width={80} />
                    <LineItemName id="line-item-name" className="p-2" />
                    <div>
                      <LineItemOptions titleClassName="font-bold" showAll>
                        <LineItemOption
                          className="font-bold capitalize"
                          valueClassName="ml-2 font-normal"
                        />
                      </LineItemOptions>
                    </div>
                    <LineItemQuantity
                      id="line-item-quantity"
                      max={100}
                      className="p-2"
                    />
                    <Errors
                      className="text-red-700 p-2"
                      resource="line_items"
                      field="quantity"
                    />
                    <LineItemAmount id="line-item-total" className="p-2" />
                    <LineItemRemoveLink
                      id="line-item-remove"
                      className="p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    />
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
                      disabled
                    />
                    <LineItemAmount id="line-item-total" className="p-2" />
                    <LineItemRemoveLink
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
              <CheckoutLink
                className="mt-2 primary font-bold py-2 px-4 rounded"
                label="CheckoutLink"
              />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import VariantsContainer from '../src/components/VariantsContainer'
import VariantSelector from '../src/components/VariantSelector'
import PricesContainer from '../src/components/PricesContainer'
import Price from '../src/components/Price'
import AddToCartButton from '../src/components/AddToCartButton'
import LineItemsContainer from '../src/components/LineItemsContainer'
import LineItem from '../src/components/LineItem'
import LineItemImage from '../src/components/LineItemImage'
import LineItemName from '../src/components/LineItemName'
import LineItemQuantity from '../src/components/LineItemQuantity'
import LineItemAmount from '../src/components/LineItemAmount'
import LineItemRemoveLink from '../src/components/LineItemRemoveLink'
import CheckoutLink from '../src/components/CheckoutLink'
import SubTotalAmount from '../src/components/SubTotalAmount'
import QuantitySelector from '../src/components/QuantitySelector'
import LineItemsCount from '../src/components/LineItemsCount'
import TotalAmount from '../src/components/TotalAmount'
import DiscountAmount from '../src/components/DiscountAmount'
import ShippingAmount from '../src/components/ShippingAmount'
import TaxesAmount from '../src/components/TaxesAmount'
import GiftCardAmount from '../src/components/GiftCardAmount'
import AvailabilityContainer from '../src/components/AvailabilityContainer'
import AvailabilityTemplate from '../src/components/AvailabilityTemplate'
import ItemContainer from '../src/components/ItemContainer'
import Errors from '../src/components/Errors'
import OrderStorage from '#components/OrderStorage'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'

const CustomAddToCart = (props) => {
  const classes = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  const myClick = async () => {
    const { success } = await props.handleClick()
    if (success) {
      // NOTE: dispatch your callback or animation
    }
  }
  return (
    <button
      className={`${classes} ${props.className}`}
      onClick={myClick}
      disabled={props.disabled}
      data-cy={props['data-cy']}
    >
      Custom add to cart
    </button>
  )
}

// const CustomQuantity = (props: any) => {
//   // console.log('props', props)
//   const myIncrease = (event: any) => {
//     event.target.value = props.value + 1
//     props.handleChange(event)
//   }
//   return (
//     <Fragment>
//       <button>-</button>
//       <input value={props.value} disabled={true} />
//       <button onClick={myIncrease}>+</button>
//     </Fragment>
//   )
// }

export default function Order() {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getSalesChannelToken({
        clientId:
          '48ee4802f8227b04951645a9b7c8af1e3943efec7edd1dcfd04b5661bf1da5db',
        endpoint,
        scope: 'market:58',
      })
      // const token = await getIntegrationToken({
      //   clientId:
      //     'b1aa32826ce12ba2f74c59a555e3ed98a7db4ec710b14575b7e97f0a49fb9a4d',
      //   clientSecret:
      //     '8fed019759490ba13c482cc2541ef77c6b8d0b3df04db80807110784fbfec021',
      //   endpoint,
      //   scope: 'market:58',
      // })
      if (token) setToken(token.accessToken)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderStorage persistKey="orderUS">
            <OrderContainer attributes={{ returnUrl: 'https://test.co' }}>
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
                          data-cy="variant-selector"
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
                              lineItem: {
                                name: 'Darth Vader (12 Months)',
                                imageUrl:
                                  'https://i.pinimg.com/736x/a5/32/de/a532de337eff9b1c1c4bfb8df73acea4--darth-vader-stencil-darth-vader-head.jpg?b=t',
                              },
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
                      <QuantitySelector
                        max={12}
                        data-cy="quantity-selector"
                        className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      />
                    </div>
                    <div className="m-2">
                      <AddToCartButton
                        data-cy="add-to-cart"
                        className="w-full primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
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
                  <LineItemsCount data-cy="items-count" className="font-bold" />{' '}
                  items
                </p>
                <div className="flex flex-col p-2">
                  <LineItem>
                    <div className="flex justify-around items-center border-b p-5">
                      <LineItemImage className="p-2" width={80} />
                      <LineItemName data-cy="line-item-name" className="p-2" />
                      <LineItemQuantity
                        data-cy="line-item-quantity"
                        max={100}
                        className="p-2"
                      />
                      <Errors
                        className="text-red-700 p-2"
                        resource="lineItem"
                        field="quantity"
                      />
                      <LineItemAmount
                        data-cy="line-item-total"
                        className="p-2"
                      />
                      <LineItemRemoveLink
                        data-cy="line-item-remove"
                        className="p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      />
                    </div>
                  </LineItem>
                  <LineItem type="gift_cards">
                    <div className="flex justify-between items-center border-b p-5">
                      <LineItemImage className="p-2" width={40} />
                      <LineItemName data-cy="line-item-name" className="p-2" />
                      <LineItemQuantity
                        data-cy="line-item-quantity"
                        max={10}
                        className="p-2"
                        disabled
                      />
                      <LineItemAmount
                        data-cy="line-item-total"
                        className="p-2"
                      />
                      <LineItemRemoveLink
                        data-cy="line-item-remove"
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
                    <TotalAmount data-cy="total-amount" />
                  </div>
                </div>
              </div>
              <div className="flex justify-center p-2">
                <CheckoutLink
                  className="mt-2 primary font-bold py-2 px-4 rounded"
                  label="Checkout"
                />
              </div>
            </OrderContainer>
          </OrderStorage>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

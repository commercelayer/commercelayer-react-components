import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../#components/auth/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../#components/orders/OrderContainer'
import VariantsContainer from '../#components/skus/VariantsContainer'
import VariantSelector from '../#components/skus/VariantSelector'
import PricesContainer from '../#components/prices/PricesContainer'
import Price from '../#components/prices/Price'
import AddToCartButton from '../#components/orders/AddToCartButton'
import LineItemsContainer from '../#components/line_items/LineItemsContainer'
import LineItem from '../#components/line_items/LineItem'
import LineItemImage from '../#components/line_items/LineItemImage'
import LineItemName from '../#components/line_items/LineItemName'
import LineItemQuantity from '../#components/line_items/LineItemQuantity'
import LineItemAmount from '../#components/line_items/LineItemAmount'
import LineItemRemoveLink from '../#components/line_items/LineItemRemoveLink'
import CheckoutLink from '../#components/orders/CheckoutLink'
import SubTotalAmount from '../#components/orders/SubTotalAmount'
import QuantitySelector from '../#components/skus/QuantitySelector'
import LineItemsCount from '../#components/line_items/LineItemsCount'
import TotalAmount from '../#components/orders/TotalAmount'
import DiscountAmount from '../#components/orders/DiscountAmount'
import ShippingAmount from '../#components/orders/ShippingAmount'
import TaxesAmount from '../#components/orders/TaxesAmount'
import GiftCardAmount from '../#components/orders/GiftCardAmount'
import AvailabilityContainer from '../#components/skus/AvailabilityContainer'
import AvailabilityTemplate from '../#components/skus/AvailabilityTemplate'
import ItemContainer from '../#components/orders/ItemContainer'
import Errors from '../#components/Errors'
import OrderStorage from '#components/orders/OrderStorage'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_INTEGRATION as string
const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string

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
        clientId,
        endpoint,
        scope,
      })
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
                        >
                          {(props) => {
                            const {
                              variants,
                              skuCode,
                              options,
                              handleSelect,
                              placeholder,
                              id,
                              loading,
                              ...p
                            } = props
                            const selectOptions = keys(variants).map((v, k) => {
                              return (
                                <option
                                  key={variants[v].id}
                                  data-sku-id={variants[v].id}
                                  value={variants[v].code}
                                >
                                  {options.length > 0
                                    ? options[k].label
                                    : variants[v].name}
                                </option>
                              )
                            })
                            return loading ? (
                              'Loading...'
                            ) : (
                              <select
                                id={id}
                                onChange={(e): void => {
                                  const v = e.target.value
                                  const i = e.target.selectedIndex
                                  const id = e.target[i].dataset.skuId as string
                                  handleSelect && handleSelect(v, id)
                                }}
                                value={skuCode || ''}
                                {...p}
                              >
                                <option disabled={!!skuCode}>
                                  {placeholder}
                                </option>
                                {selectOptions}
                              </select>
                            )
                          }}
                        </VariantSelector>
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

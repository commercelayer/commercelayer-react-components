import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import CommerceLayer from '../#components/auth/CommerceLayer'
import GiftCardContainer from '../#components/GiftCardContainer'
import SubmitButton from '../#components/SubmitButton'
import GiftCard from '../#components/gift_cards/GiftCard'
import GiftCardInput from '../#components/GiftCardInput'
import GiftCardCurrencySelector from '../#components/GiftCardCurrencySelector'
import MetadataInput from '../#components/MetadataInput'
import Errors from '../#components/Errors'
import { Nav } from '.'
import OrderContainer from '../#components/OrderContainer'
import { BaseError } from '../#typings/errors'
import {
  LineItemsContainer,
  LineItemsCount,
  LineItem,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  LineItemAmount,
  LineItemRemoveLink,
  SubTotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
  GiftCardAmount,
  TotalAmount,
  CheckoutLink,
  OrderStorage,
} from '../packages/react-components/src'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string
// const username = process.env.NEXT_PUBLIC_CUSTOMER_USERNAME as string
// const password = process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD as string

const messages = [
  {
    code: 'VALIDATION_ERROR',
    message: 'La email non ha un formato valido',
    field: 'email',
  },
  { code: 'VALIDATION_ERROR', message: 'Errore di validazione' },
]

export const Title = ({ title }) => (
  <div className="font-bold text-2xl mb-2 bg-red-500 text-gray-800 p-3">
    {title}
  </div>
)

export const Type = ({ text }) => (
  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
    #{text}
  </span>
)

const Home = () => {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      const token = await getSalesChannelToken({
        clientId,
        endpoint,
        scope,
      })
      setToken(token?.accessToken as string)
    }
    getToken()
  }, [])
  return (
    <Fragment>
      <Nav links={['/order', '/multiOrder', '/multiApp']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <OrderStorage persistKey="orderUS">
          <OrderContainer>
            <div className="container mx-auto p-2">
              <GiftCardContainer>
                <GiftCard>
                  <h2 className="text-xl">Create a GiftCard</h2>
                  <div className="p-2">
                    <GiftCardCurrencySelector className="block w-1/3  border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
                  </div>
                  <div className="p-2">
                    <GiftCardInput
                      className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="number"
                      name="balanceCents"
                      placeholder="Amount*"
                    />
                    <Errors resource="gift_cards" field="balanceCents" />
                  </div>
                  <div className="p-2">
                    <GiftCardInput
                      className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      name="email"
                      placeholder="Email*"
                    />
                    <Errors
                      resource="gift_cards"
                      field="email"
                      messages={messages}
                    />
                  </div>
                  <div className="p-2">
                    <GiftCardInput
                      className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      name="imageUrl"
                      placeholder="Card image"
                    />
                  </div>
                  <div className="p-2">
                    <GiftCardInput
                      className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      name="firstName"
                      placeholder="First name"
                    />
                  </div>
                  <div className="p-2">
                    <GiftCardInput
                      className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                    />
                  </div>
                  <div className="p-2">
                    <MetadataInput
                      className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="textarea"
                      name="message"
                      placeholder="Message"
                    />
                  </div>
                  <div className="p-2">
                    <GiftCardInput
                      className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="checkbox"
                      name="singleUse"
                    />
                    <span className="ml-2 align-middle">Single use</span>
                  </div>
                  <div className="p-2">
                    <SubmitButton
                      label="Create"
                      className="shadow primary focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                    />
                  </div>
                </GiftCard>
                <Errors resource="gift_cards" />
              </GiftCardContainer>
            </div>
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
                label="Checkout"
              />
            </div>
          </OrderContainer>
        </OrderStorage>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

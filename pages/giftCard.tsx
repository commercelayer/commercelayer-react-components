import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import CommerceLayer from '../src/components/CommerceLayer'
import GiftCardContainer from '../src/components/GiftCardContainer'
import SubmitButton from '../src/components/SubmitButton'
import GiftCard from '../src/components/GiftCard'
import GiftCardInput from '../src/components/GiftCardInput'
import GiftCardCurrencySelector from '../src/components/GiftCardCurrencySelector'
import MetadataInput from '../src/components/MetadataInput'
import Errors from '../src/components/Errors'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import { BaseError } from '../src/@types/errors'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

const messages = [
  {
    code: 'VALIDATION_ERROR',
    message: 'La email non ha un formato valido',
    field: 'email',
  },
  { code: 'VALIDATION_ERROR', message: 'Errore di validazione' },
] as BaseError[]

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
      <Nav links={['/order', '/multiOrder', '/multiApp']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <OrderContainer persistKey="orderUS">
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
                  <Errors resource="giftCard" field="balanceCents" />
                </div>
                <div className="p-2">
                  <GiftCardInput
                    className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    name="email"
                    placeholder="Email*"
                  />
                  <Errors
                    resourceKey="giftCard"
                    field="email"
                    messages={messages}
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
              <Errors resourceKey="giftCard" />
            </GiftCardContainer>
          </div>
        </OrderContainer>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

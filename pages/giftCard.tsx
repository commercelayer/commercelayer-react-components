import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import CommerceLayer from '../src/components/CommerceLayer'
import '../styles/styles.css'
import GiftCardRecipient from '../src/components/GiftCardRecipient'
import GiftCardContainer from '../src/components/GiftCardContainer'
import GiftCardRecipientInput from '../src/components/GiftCardRecipientInput'
import SubmitButton from '../src/components/SubmitButton'
import GiftCard from '../src/components/GiftCard'
import GiftCardInput from '../src/components/GiftCardInput'
import GiftCardCurrencySelector from '../src/components/GiftCardCurrencySelector'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

export const Nav = ({ links }) => (
  <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6 text-gray-200">
    <ul className="flex">
      {links.map((l: string, i: number) => {
        return (
          <li key={i} className="mr-6">
            <a className="hover:text-gray-400 capitalize" href={l}>
              {l === '/' ? 'home' : l.replace('/', ' ')}
            </a>
          </li>
        )
      })}
    </ul>
  </nav>
)

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
      <Nav links={['/order']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <Title title="Gift Card" />
        <div className="p-2">
          <GiftCardContainer>
            <h2>GiftCard Recipient</h2>
            <GiftCardRecipient>
              <div className="p-2">
                <GiftCardRecipientInput
                  className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  name="email"
                  type="email"
                  placeholder="Email"
                />
              </div>
              <div className="p-2">
                <GiftCardRecipientInput
                  className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  name="firstName"
                  type="text"
                  placeholder="Firstname"
                />
              </div>
              <div className="p-2">
                <GiftCardRecipientInput
                  className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  name="lastName"
                  type="text"
                  placeholder="Lastname"
                />
              </div>
              <div className="p-2">
                <SubmitButton className="shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" />
              </div>
            </GiftCardRecipient>
            <GiftCard>
              <h2>Create a GiftCard</h2>
              <div className="p-2">
                <GiftCardCurrencySelector className="block w-1/3  border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
              </div>
              <div className="p-2">
                <GiftCardInput
                  className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="number"
                  name="balanceCents"
                  placeholder="Insert a number"
                />
              </div>
              <div className="p-2">
                <SubmitButton className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" />
              </div>
            </GiftCard>
          </GiftCardContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

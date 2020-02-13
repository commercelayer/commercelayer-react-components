import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PriceContainer from '../src/components/PriceContainer'
import CommerceLayer from '../src/components/CommerceLayer'
import '../styles/styles.css'
import VariantContainer from '../src/components/VariantContainer'
import VariantSelector from '../src/components/VariantSelector'
import GiftCardRecipient from '../src/components/GiftCardRecipient'
import GiftCardContainer from '../src/components/GiftCardContainer'
import GiftCardRecipientInput from '../src/components/GiftCardRecipientInput'
import SubmitButton from '../src/components/SubmitButton'
import GiftCard from '../src/components/GiftCard'
import GiftCardInput from '../src/components/GiftCardInput'

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
        <GiftCardContainer>
          <h2>GiftCard Recipient</h2>
          <GiftCardRecipient>
            <GiftCardRecipientInput
              name="email"
              type="email"
              placeholder="insert your email"
            />
            <SubmitButton />
          </GiftCardRecipient>
          <GiftCard>
            <h2>Create a GiftCard</h2>
            <GiftCardInput
              type="number"
              name="balanceCents"
              placeholder="Insert a number"
            />
          </GiftCard>
        </GiftCardContainer>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

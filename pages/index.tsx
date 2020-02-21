import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PriceContainer from '../src/components/PriceContainer'
import CommerceLayer from '../src/components/CommerceLayer'
import '../styles/styles.css'
import VariantContainer from '../src/components/VariantContainer'
import VariantSelector from '../src/components/VariantSelector'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

export const Nav = ({ links }) => (
  <header className="dark p-6">
    <div className="container mx-auto">
      <nav className="flex flex-row items-center">
        <div className="flex items-center mr-10">
          <a href="/" className="w-48">
            <img src="//commercelayer.io/assets/img/commercelayer_logo_white.svg?v=2" />
          </a>
        </div>
        <div className="flex w-full justify-end">
          <div className="">
            {links.map((l: string, i: number) => {
              return (
                <a
                  key={i}
                  className="dark capitalize text-base font-normal mr-5"
                  href={l}
                >
                  {l === '/' ? 'home' : l.replace('/', ' ')}
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  </header>
)

export const Title = ({ title }) => (
  <div className="font-bold text-2xl mb-2 bg-green-300">{title}</div>
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
    <section className="bg-gray-100">
      <Nav links={['/order', '/multiOrder', '/multiApp', '/giftCard']} />
      <div className="container mx-auto">
        <CommerceLayer accessToken={token} endpoint={endpoint}>
          <PriceContainer>
            <Price
              skuCode="BABYONBU000000E63E746MXX"
              amountClassName="font-bold"
              compareClassName="line-through"
            />
            <Price
              skuCode="BABYONBU000000E63E7412MX"
              amountClassName="font-bold"
              compareClassName="line-through"
            />
          </PriceContainer>
          {/* <br />
        <br />
        <Title title="Preselect Prices by skuCode" />
        <PriceContainer>
          <Price
            skuCode="BABYONBU000000E63E746MXX"
            amountClassName="font-bold"
            compareClassName="line-through"
          />
        </PriceContainer>
        <br />
        <br />
        <Title title="Variant" />
        <VariantContainer>
          <Type text="select type" />
          <VariantSelector
            name="variant1"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
          <br />
          <br />
          <Type text="radio type" />
          <VariantSelector
            name="variant"
            type="radio"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
        </VariantContainer>
        <br />
        <br />
        <Title title="Preselect Variant by skuCode" />
        <VariantContainer skuCode="BABYONBU000000E63E746MXX">
          <Type text="select type" />
          <VariantSelector
            name="variant1"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
          <br />
          <br />
          <Type text="radio type" />
          <VariantSelector
            name="variant1"
            type="radio"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
        </VariantContainer> */}
        </CommerceLayer>
      </div>
    </section>
  )
}

export default Home

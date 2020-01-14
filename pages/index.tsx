import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PriceContainer from '../src/components/PriceContainer'
import CommerceLayer from '../src/components/CommerceLayer'
import '../styles/styles.css'
import VariantContainer from '../src/components/VariantContainer'
import VariantSelector from '../src/components/VariantSelector'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

const Title = ({ title }) => (
  <div className="font-bold text-2xl mb-2 bg-green-300">{title}</div>
)

const Type = ({ text }) => (
  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
    #{text}
  </span>
)

const TestTemplate = props => {
  const { prices, skuCode } = props
  const [formattedAmount, setFormattedAmount] = useState('')
  useEffect(() => {
    if (prices[skuCode]) {
      const amount = prices[skuCode].formattedAmount
      setFormattedAmount(amount)
    }
    return () => {
      setFormattedAmount('')
    }
  }, [prices])
  return (
    <Fragment>
      <div className="text-red-800">{formattedAmount}</div>
    </Fragment>
  )
}

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
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <Title title="Prices" />
        <PriceContainer skuCode="BABYONBU000000E63E7412MX">
          <Price>
            <TestTemplate />
          </Price>
          <Price
            skuCode="BABYONBU000000E63E746MXX"
            amountClassName="font-bold"
            compareClassName="line-through"
          />
        </PriceContainer>
        <br />
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
            skuCodes={['BABYONBU000000E63E746MXX', 'BABYONBU000000E63E7412MX']}
            variantLabels={['6 months', '12 months']}
          />
          <br />
          <br />
          <Type text="radio type" />
          <VariantSelector
            name="variant"
            type="radio"
            skuCodes={['BABYONBU000000E63E746MXX', 'BABYONBU000000E63E7412MX']}
            variantLabels={['6 months', '12 months']}
          />
        </VariantContainer>
        <br />
        <br />
        <Title title="Preselect Variant by skuCode" />
        <VariantContainer skuCode="BABYONBU000000E63E746MXX">
          <Type text="select type" />
          <VariantSelector
            name="variant1"
            skuCodes={['BABYONBU000000E63E746MXX', 'BABYONBU000000E63E7412MX']}
            variantLabels={['6 months', '12 months']}
          />
          <br />
          <br />
          <Type text="radio type" />
          <VariantSelector
            name="variant1"
            type="radio"
            skuCodes={['BABYONBU000000E63E746MXX', 'BABYONBU000000E63E7412MX']}
            variantLabels={['6 months', '12 months']}
          />
        </VariantContainer>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PriceContainer from '../src/components/PriceContainer'
import CommerceLayer from '../src/components/CommerceLayer'
import '../styles/styles.css'
import VariantContainer from '../src/components/VariantContainer'
import VariantSelector from '../src/components/VariantSelector'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

const Title = props => (
  <div className="font-bold text-2xl mb-2">{props.title}</div>
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
        <PriceContainer>
          <Price skuCode="BABYONBU000000E63E7412MX">
            <TestTemplate />
          </Price>
          <Price
            skuCode="BABYONBU000000E63E746MXX"
            amountClassName="font-bold"
            compareClassName="line-through"
          />
        </PriceContainer>
        <Title title="Preselect Prices by skuCode" />
        <PriceContainer skuCode="BABYONBU000000E63E7412MX">
          <Price amountClassName="font-bold" compareClassName="line-through" />
        </PriceContainer>
        <VariantContainer>
          <VariantSelector
            type="select"
            skuCodes={['BABYONBU000000E63E746MXX', 'BABYONBU000000E63E7412MX']}
          />
        </VariantContainer>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Fragment, useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PriceContainer from '../src/components/PriceContainer'
import CommerceLayer from '../src/components/CommerceLayer'
import '../styles/styles.css'
import OrderContainer from '../src/components/OrderContainer'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

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
  const Loader = () => <div>test...</div>
  return (
    <Fragment>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <OrderContainer persistKey="testItems">
          <PriceContainer
            skuCode="BABYONBU000000E63E746MXX"
            loader={<Loader />}
          >
            <Price
              className="font-bold"
              compareClassName="line-through"
              showCompare
            />
            <Price
              skuCode="BABYONBU000000E63E7412MX"
              className="font-bold"
              compareClassName="line-through"
            />
          </PriceContainer>
          <PriceContainer>
            <Price
              skuCode="BABYONBU000000E63E746MXX"
              className="font-bold"
              compareClassName="line-through"
            />
            <Price
              skuCode="BABYONBU000000E63E7412MX"
              className="font-bold"
              compareClassName="line-through"
            />
          </PriceContainer>
        </OrderContainer>
      </CommerceLayer>
    </Fragment>
  )
}

export default Home

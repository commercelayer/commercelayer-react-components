import { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import {
  CommerceLayer,
  OrderContainer,
  VariantsContainer,
  VariantSelector,
  PricesContainer,
  Price,
  AddToCartButton,
  QuantitySelector,
  AvailabilityContainer,
  AvailabilityTemplate,
  ItemContainer,
  Errors,
  OrderStorage,
} from 'packages/react-components/src'
import { useRouter } from 'next/router'

const clientId = process.env['NEXT_PUBLIC_CLIENT_ID'] as string
const endpoint = process.env['NEXT_PUBLIC_ENDPOINT'] as string
const scope = process.env['NEXT_PUBLIC_MARKET_ID'] as string

export default function Order() {
  const [token, setToken] = useState('')
  const { query } = useRouter()
  const hostedCartUrl = !!query['hostedCartUrl'] ? 'myexample.hosted.cart' : ''
  useEffect(() => {
    const getToken = async () => {
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
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderStorage persistKey="orderUS">
            <OrderContainer attributes={{ return_url: 'https://test.co' }}>
              <ItemContainer>
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <img
                      title="Tuta da bambino"
                      className="rounded-lg md:w-56"
                      src="https://img.commercelayer.io/skus/BABYONBU000000E63E74.png?fm=jpg&q=90"
                    />
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <h1 className="text-4xl">Tutina da Bambino</h1>
                    <div className="w-auto m-2" data-test="price-container">
                      <PricesContainer skuCode="BABYONBU000000E63E746MXX">
                        <Price
                          data-test="price"
                          className="text-green-600 text-2xl m-1"
                          compareClassName="text-gray-500 text-2xl m-1 line-through"
                        />
                      </PricesContainer>
                    </div>
                    <VariantsContainer skuCode="BABYONBU000000E63E746MXX">
                      <div className="m-2" data-test="variant-container">
                        <VariantSelector
                          data-test="variant-selector"
                          className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          name="variant1"
                          options={[
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
                              label: '6 months',
                              code: 'BABYONBU000000E63E746MXX',
                            },
                            {
                              label: '24 months',
                              code: 'BABYONBU000000E63E746MXXFAKE',
                            },
                          ]}
                          handleCallback={(variant) => {
                            console.log(`variant`, variant)
                          }}
                        />
                      </div>
                    </VariantsContainer>
                    <div className="m-2">
                      <QuantitySelector
                        max={12}
                        data-test="quantity-selector"
                        className="w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      />
                    </div>
                    <div className="m-2">
                      <AddToCartButton
                        redirectToHostedCart
                        hostedCartUrl={hostedCartUrl}
                        data-test="add-to-cart-button"
                        className="w-full primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="m-2">
                      <AvailabilityContainer>
                        <AvailabilityTemplate
                          data-test="availability-template"
                          showShippingMethodName
                          showShippingMethodPrice
                        />
                      </AvailabilityContainer>
                    </div>
                  </div>
                </div>
              </ItemContainer>
              <Errors resource="orders" />
            </OrderContainer>
          </OrderStorage>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

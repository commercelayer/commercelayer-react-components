import { useState, useEffect } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import {
  CommerceLayer,
  OrderContainer,
  PricesContainer,
  Price,
  AddToCartButton,
  LineItemsContainer,
  LineItem,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  LineItemAmount,
  LineItemRemoveLink,
  LineItemsCount,
  LineItemsEmpty,
  CheckoutLink,
  SubTotalAmount,
  TotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
  GiftCardAmount,
  AvailabilityContainer,
  AvailabilityTemplate,
  Errors,
  OrderStorage,
  CartLink
} from 'packages/react-components/src'

const clientId = process.env['NEXT_PUBLIC_CLIENT_ID'] as string
const endpoint = process.env['NEXT_PUBLIC_ENDPOINT'] as string
const scope = process.env['NEXT_PUBLIC_MARKET_ID'] as string

export default function Order(): JSX.Element {
  const [token, setToken] = useState('')
  const [currentSku, setCurrentSku] = useState('BABYONBU000000E63E746MXX')
  const [availability, setAvailability] = useState(0)
  useEffect(() => {
    const getToken = async (): Promise<void> => {
      const token = await getSalesChannelToken({
        clientId,
        endpoint,
        scope
      })
      if (token) setToken(token.accessToken)
    }
    void getToken()
  }, [])
  return (
    <>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className='container mx-auto mt-5 px-5'>
          <OrderStorage persistKey='orderUS'>
            <OrderContainer
              attributes={{
                return_url: 'https://test.co'
              }}
            >
              <div className='md:flex'>
                <div className='md:flex-shrink-0'>
                  <img
                    title='Tuta da bambino'
                    className='rounded-lg md:w-56'
                    src='https://img.commercelayer.io/skus/BABYONBU000000E63E74.png?fm=jpg&q=90'
                  />
                </div>
                <div className='mt-4 md:mt-0 md:ml-6'>
                  <h1 className='text-4xl'>Tutina da Bambino</h1>
                  <div className='w-auto m-2' data-test='price-container'>
                    <PricesContainer skuCode='BABYONBU000000E63E746MXX'>
                      <Price
                        data-test='price'
                        className='text-green-600 text-2xl m-1'
                        compareClassName='text-gray-500 text-2xl m-1 line-through'
                      />
                    </PricesContainer>
                  </div>
                  <div className='m-2' data-test='variant-container'>
                    <select
                      title='variant-selector'
                      onChange={(e) => setCurrentSku(e.target.value)}
                    >
                      <option value='BABYONBU000000E63E746MXX'>6 months</option>
                      <option value='BABYONBU000000E63E7412MX'>
                        12 months
                      </option>
                    </select>
                  </div>
                  <div className='m-2'>
                    <input
                      disabled={availability === 0}
                      defaultValue={1}
                      title='quantity selector'
                      type='number'
                      className='w-full block bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:opacity-50'
                    />
                  </div>
                  <div className='m-2'>
                    <AddToCartButton
                      disabled={availability === 0}
                      skuCode={currentSku}
                      data-test='add-to-cart-button'
                      className='w-full primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
                    />
                  </div>
                  <div className='m-2'>
                    <AvailabilityContainer
                      skuCode={currentSku}
                      getQuantity={(quantity) => setAvailability(quantity)}
                    >
                      <AvailabilityTemplate
                        data-test='availability-template'
                        timeFormat='days'
                        showShippingMethodName
                        showShippingMethodPrice
                      />
                    </AvailabilityContainer>
                  </div>
                </div>
              </div>
              <Errors resource='orders' />
              <h1 className='text-4xl border-b-2 my-5'>Shopping Bag</h1>
              <LineItemsContainer>
                <p className='text-sm m-2'>
                  Your shopping bag contains{' '}
                  <LineItemsCount
                    data-test='items-count'
                    className='font-bold'
                  />{' '}
                  items
                </p>
                <div className='flex flex-col p-2'>
                  <LineItemsEmpty data-test='line-items-empty' />
                  <LineItem>
                    <div className='flex justify-around items-center border-b p-5'>
                      <LineItemImage className='p-2' width={80} />
                      <LineItemName
                        data-test='line-item-name'
                        className='p-2'
                      />
                      <LineItemQuantity
                        data-test='line-item-quantity'
                        max={100}
                        className='p-2'
                      />
                      <Errors
                        className='text-red-700 p-2'
                        resource='line_items'
                        field='quantity'
                      />
                      <LineItemAmount
                        data-test='line-item-total'
                        className='p-2'
                      />
                      <LineItemRemoveLink
                        data-test='line-item-remove'
                        className='p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                      />
                    </div>
                  </LineItem>
                  <LineItem type='gift_cards'>
                    <div className='flex justify-between items-center border-b p-5'>
                      <LineItemImage className='p-2' width={40} />
                      <LineItemName
                        data-test='line-item-name'
                        className='p-2'
                      />
                      <LineItemQuantity
                        data-test='line-item-quantity'
                        max={10}
                        className='p-2'
                        disabled
                      />
                      <LineItemAmount
                        data-test='line-item-total'
                        className='p-2'
                      />
                      <LineItemRemoveLink
                        data-test='line-item-remove'
                        className='p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                      />
                    </div>
                  </LineItem>
                  <LineItem type='bundles'>
                    <div className='flex justify-between items-center border-b p-5'>
                      <LineItemImage className='p-2' width={40} />
                      <LineItemName
                        data-test='line-item-name'
                        className='p-2'
                      />
                      <LineItemQuantity
                        data-test='line-item-quantity'
                        max={10}
                        className='p-2'
                      />
                      <LineItemAmount
                        data-test='line-item-total'
                        className='p-2'
                      />
                      <LineItemRemoveLink
                        data-test='line-item-remove'
                        className='p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                      />
                    </div>
                  </LineItem>
                  <LineItem type='adjustments'>
                    <div className='flex justify-between items-center border-b p-5'>
                      <LineItemImage className='p-2' width={40} />
                      <LineItemName
                        data-test='line-item-name'
                        className='p-2'
                      />
                      <LineItemQuantity
                        data-test='line-item-quantity'
                        max={10}
                        className='p-2'
                      />
                      <LineItemAmount
                        data-test='line-item-total'
                        className='p-2'
                      />
                      <LineItemRemoveLink
                        data-test='line-item-remove'
                        className='p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                      />
                    </div>
                  </LineItem>
                </div>
              </LineItemsContainer>
              <div className='flex flex-col w-1/2 m-auto'>
                <div className='flex items-center p-2 justify-around font-medium text-left'>
                  <div className='w-full'>
                    <p className='text-lg'>Subtotal </p>
                  </div>
                  <div className='text-right'>
                    <SubTotalAmount data-test='subtotal-amount' />
                  </div>
                </div>
                <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                  <div className='w-full'>
                    <p className='text-lg'>Discount </p>
                  </div>
                  <div className='text-right'>
                    <DiscountAmount data-test='discount-amount' />
                  </div>
                </div>
                <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                  <div className='w-full'>
                    <p className='text-lg'>Shipping </p>
                  </div>
                  <div className='text-right'>
                    <ShippingAmount data-test='shipping-amount' />
                  </div>
                </div>
                <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                  <div className='w-full'>
                    <p className='text-lg'>
                      Taxes <span className='text-sm font-tin'>(included)</span>
                    </p>
                  </div>
                  <div className='text-right'>
                    <TaxesAmount data-test='taxes-amount' />
                  </div>
                </div>
                <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                  <div className='w-full'>
                    <p className='text-lg'>Gift card </p>
                  </div>
                  <div className='text-right'>
                    <GiftCardAmount data-test='gift-card-amount' />
                  </div>
                </div>
                <div className=' flex items-center p-2 justify-around font-bold text-left'>
                  <div className='w-full'>
                    <p className='text-lg mr-2'>Total </p>
                  </div>
                  <div className='text-right'>
                    <TotalAmount data-test='total-amount' />
                  </div>
                </div>
              </div>
              <div className='flex justify-center p-2'>
                <CheckoutLink
                  className='mt-2 primary font-bold py-2 px-4 rounded'
                  label='Checkout'
                />
              </div>
              <div className='flex justify-center p-2'>
                <CartLink
                  className='mt-2 primary font-bold py-2 px-4 rounded'
                  label='Go to hosted cart'
                />
              </div>
            </OrderContainer>
          </OrderStorage>
        </div>
      </CommerceLayer>
    </>
  )
}

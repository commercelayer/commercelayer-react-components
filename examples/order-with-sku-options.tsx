import { useState, useEffect } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../#components/auth/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import PricesContainer from '#components/prices/PricesContainer'
import Price from '#components/prices/Price'
import AddToCartButton from '#components/orders/AddToCartButton'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItem from '#components/line_items/LineItem'
import LineItemImage from '#components/line_items/LineItemImage'
import LineItemName from '#components/line_items/LineItemName'
import LineItemQuantity from '#components/line_items/LineItemQuantity'
import LineItemAmount from '#components/line_items/LineItemAmount'
import LineItemRemoveLink from '#components/line_items/LineItemRemoveLink'
import CheckoutLink from '#components/orders/CheckoutLink'
import SubTotalAmount from '#components/orders/SubTotalAmount'
import LineItemsCount from '#components/line_items/LineItemsCount'
import TotalAmount from '#components/orders/TotalAmount'
import DiscountAmount from '#components/orders/DiscountAmount'
import ShippingAmount from '#components/orders/ShippingAmount'
import TaxesAmount from '#components/orders/TaxesAmount'
import GiftCardAmount from '#components/orders/GiftCardAmount'
import AvailabilityContainer from '#components/skus/AvailabilityContainer'
import AvailabilityTemplate from '#components/skus/AvailabilityTemplate'
import Errors from '#components/Errors'
import LineItemOptions from '#components/line_items/LineItemOptions'
import LineItemOption from '#components/line_items/LineItemOption'
import LineItemField from '#components/line_items/LineItemField'

const clientId = process.env['NEXT_PUBLIC_CLIENT_ID'] as string
const endpoint = process.env['NEXT_PUBLIC_ENDPOINT'] as string
const scope = process.env['NEXT_PUBLIC_MARKET_ID'] as string

// const CustomAddToCart = (props: AddToCartButtonTemplate) => {
//   const classes = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
//   const myClick = () => {
//     props.handleClick()
//   }
//   return (
//     <button
//       id='add-to-bag'
//       className={`${classes} ${props.className}`}
//       onClick={myClick}
//       disabled={props.disabled}
//     >
//       Custom add to cart
//     </button>
//   )
// }
const variants = [
  {
    label: '6 months',
    code: 'BABYONBU000000E63E746MXX'
  },
  {
    label: '12 months',
    code: 'BABYONBU000000E63E7412MX'
  },
  {
    label: '24 months',
    code: 'BABYONBU000000E63E746MXXFAKE'
  }
]
export default function Order(): JSX.Element {
  const [token, setToken] = useState('')
  const [currentSku, setCurrentSku] = useState('BABYONBU000000E63E746MXX')
  useEffect(() => {
    const getToken = async (): Promise<void> => {
      // @ts-expect-error no type
      const { accessToken } = await getSalesChannelToken({
        clientId,
        endpoint,
        scope
      })
      if (accessToken) setToken(accessToken)
    }
    void getToken()
  }, [])
  return (
    <>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className='container mx-auto mt-5 px-5'>
          <OrderContainer>
            <div className='md:flex'>
              <div className='md:flex-shrink-0'>
                <img
                  alt=''
                  className='rounded-lg md:w-56'
                  src='https://img.commercelayer.io/skus/BABYONBU000000E63E74.png?fm=jpg&q=90'
                />
              </div>
              <div className='mt-4 md:mt-0 md:ml-6'>
                <h1 className='text-4xl'>Tutina da Bambino</h1>
                <div className='w-auto m-2'>
                  <PricesContainer skuCode='BABYONBU000000E63E746MXX'>
                    <Price
                      className='text-green-600 text-2xl m-1'
                      compareClassName='text-gray-500 text-2xl m-1 line-through'
                    />
                  </PricesContainer>
                </div>
                <select
                  title='Variant selector'
                  onChange={(e) => setCurrentSku(e.target.value)}
                >
                  {variants.map((variant) => (
                    <option key={variant.code} value={variant.code}>
                      {variant.label}
                    </option>
                  ))}
                </select>

                <div className='m-2'>
                  <AddToCartButton
                    skuCode={currentSku}
                    className='w-full primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
                  />
                </div>
                <div className='m-2'>
                  <AvailabilityContainer skuCode={currentSku}>
                    <AvailabilityTemplate
                      timeFormat='days'
                      showShippingMethodName
                    />
                  </AvailabilityContainer>
                </div>
              </div>
            </div>
            <h1 className='text-4xl border-b-2 my-5'>Shopping Bag</h1>
            <LineItemsContainer>
              <p className='text-sm m-2'>
                Your shopping bag contains{' '}
                <LineItemsCount id='items-count' className='font-bold' /> items
              </p>
              <div className='flex flex-col p-2'>
                <LineItem>
                  <div className='flex justify-around items-center border-b p-5'>
                    <LineItemImage className='p-2' width={80} />
                    <LineItemName id='line-item-name' className='p-2' />
                    <div>
                      <LineItemOptions titleClassName='font-bold' showAll>
                        <LineItemOption
                          className='font-bold capitalize'
                          valueClassName='ml-2 font-normal'
                        />
                      </LineItemOptions>
                    </div>
                    <LineItemField attribute='sku_code' tagElement='span' />
                    <LineItemQuantity
                      id='line-item-quantity'
                      max={100}
                      className='p-2'
                    />
                    <Errors
                      className='text-red-700 p-2'
                      resource='line_items'
                      field='quantity'
                    />
                    <LineItemAmount id='line-item-total' className='p-2' />
                    <LineItemRemoveLink
                      id='line-item-remove'
                      className='p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                    />
                  </div>
                </LineItem>
                <LineItem type='gift_cards'>
                  <div className='flex justify-between items-center border-b p-5'>
                    <LineItemImage className='p-2' width={40} />
                    <LineItemName id='line-item-name' className='p-2' />
                    <LineItemQuantity
                      id='line-item-quantity'
                      max={10}
                      className='p-2'
                      disabled
                    />
                    <LineItemAmount id='line-item-total' className='p-2' />
                    <LineItemRemoveLink
                      id='line-item-remove'
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
                  <SubTotalAmount />
                </div>
              </div>
              <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                <div className='w-full'>
                  <p className='text-lg'>Discount </p>
                </div>
                <div className='text-right'>
                  <DiscountAmount />
                </div>
              </div>
              <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                <div className='w-full'>
                  <p className='text-lg'>Shipping </p>
                </div>
                <div className='text-right'>
                  <ShippingAmount />
                </div>
              </div>
              <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                <div className='w-full'>
                  <p className='text-lg'>
                    Taxes <span className='text-sm font-tin'>(included)</span>
                  </p>
                </div>
                <div className='text-right'>
                  <TaxesAmount />
                </div>
              </div>
              <div className=' flex items-center p-2 justify-around text-gray-600 text-left'>
                <div className='w-full'>
                  <p className='text-lg'>Gift card </p>
                </div>
                <div className='text-right'>
                  <GiftCardAmount />
                </div>
              </div>
              <div className=' flex items-center p-2 justify-around font-bold text-left'>
                <div className='w-full'>
                  <p className='text-lg mr-2'>Total </p>
                </div>
                <div className='text-right'>
                  <TotalAmount id='total-amount' />
                </div>
              </div>
            </div>
            <div className='flex justify-center p-2'>
              <CheckoutLink
                className='mt-2 primary font-bold py-2 px-4 rounded'
                label='CheckoutLink'
              />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </>
  )
}

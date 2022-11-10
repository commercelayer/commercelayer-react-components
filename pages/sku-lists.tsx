import { useState, useEffect } from 'react'
import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/auth/CommerceLayer'
import {
  OrderContainer,
  SkuListsContainer,
  AddToCartButton,
  LineItemsContainer,
  LineItemsCount,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  LineItemAmount,
  LineItemRemoveLink,
  SubTotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
  GiftCardAmount,
  TotalAmount,
  CheckoutLink,
  SkuList,
  LineItem
} from '@commercelayer/react-components'

const clientId = process.env['NEXT_PUBLIC_CLIENT_ID_INTEGRATION'] as string
const clientSecret = process.env['NEXT_PUBLIC_CLIENT_SECRET'] as string
const endpoint = process.env['NEXT_PUBLIC_ENDPOINT'] as string
const scope = process.env['NEXT_PUBLIC_MARKET_ID'] as string

export default function Order(): JSX.Element {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async (): Promise<void> => {
      const auth = await getIntegrationToken({
        clientId,
        clientSecret,
        endpoint,
        scope
      })
      setToken(auth?.accessToken as string)
    }
    void getToken()
  }, [])
  return (
    <>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className='container mx-auto mt-5 px-5'>
          <OrderContainer>
            <div className='flex flex-row justify-around'>
              <SkuListsContainer>
                <SkuList id='NyrVkIKwyB'>
                  <div className='p-10 bg-gray-50 text-center shadow-md'>
                    <h2 className='text-3xl mb-5'>Bundle 1</h2>
                    <AddToCartButton
                      className='inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:border-blue-600 focus:shadow-outline-blue active:bg-blue-600 transition ease-in-out duration-150'
                      skuListId='NyrVkIKwyB'
                    />
                  </div>
                </SkuList>
                {/* <SkuList id="aOJOreIXyk">
                    <div className="p-10 bg-gray-50 text-center shadow-md">
                      <h2 className="text-3xl mb-5">Bundle 2</h2>
                      <div className="flex flex-col">
                        <QuantitySelector
                          skuListId="aOJOreIXyk"
                          className="form-input block w-full sm:text-sm sm:leading-5 mb-5"
                        />
                        <ExternalFunction url="//localhost:3000/api/import-line-items">
                          <AddToCartButton
                            skuListId="aOJOreIXyk"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-red-500 hover:bg-red-400 focus:outline-none focus:border-red-600 focus:shadow-outline-blue active:bg-red-600 transition ease-in-out duration-150"
                          >
                            {AddToCartCustom}
                          </AddToCartButton>
                        </ExternalFunction>
                      </div>
                    </div>
                  </SkuList> */}
              </SkuListsContainer>
            </div>
            <h1 className='text-4xl border-b-2 my-5'>Shopping Bag</h1>
            <LineItemsContainer>
              <p className='text-sm m-2'>
                Your shopping bag contains{' '}
                <LineItemsCount id='items-count' className='font-bold' /> items
              </p>
              <LineItem type='skus'>
                <div className='flex justify-around items-center border-b'>
                  <LineItemImage className='p-2' width={80} />
                  <LineItemName id='line-item-name' className='p-2' />
                  <LineItemQuantity
                    id='line-item-quantity'
                    max={10}
                    className='p-2'
                  />
                  <LineItemAmount id='line-item-total' className='p-2' />
                  <LineItemRemoveLink
                    id='line-item-remove'
                    className='p-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                  />
                </div>
              </LineItem>
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
              <CheckoutLink className='mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded' />
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </>
  )
}

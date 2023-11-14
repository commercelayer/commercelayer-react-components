import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import { Skus } from '#components/skus/Skus'
import { SkusContainer } from '#components/skus/SkusContainer'
import { SkuField } from '#components/skus/SkuField'
import { AvailabilityContainer } from '#components/skus/AvailabilityContainer'
import AvailabilityTemplate from '#components/skus/AvailabilityTemplate'
import Price from '#components/prices/Price'
import PricesContainer from '#components/prices/PricesContainer'
import OrderContainer from '#components/orders/OrderContainer'
import AddToCartButton from '#components/orders/AddToCartButton'
import { HostedCart } from '#components/orders/HostedCart'
import OrderStorage from '#components/orders/OrderStorage'

const setup: Meta = {
  title: 'Examples/Listing Page/Mini Cart'
}

export default setup

export const WithMiniCart: StoryFn = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <OrderStorage persistKey='cl-examples-skus-orderId'>
        <OrderContainer>
          <SkusContainer
            skus={['CROPTOPWFFFFFF000000XSXX', 'POLOMXXX000000FFFFFFLXXX']}
          >
            <Skus>
              <div className='flex gap-4 mb-8 pb-8 border-b items-start'>
                <SkuField attribute='image_url' tagElement='img' width={100} />
                <div>
                  <SkuField
                    attribute='name'
                    tagElement='h1'
                    className='block font-bold'
                  />
                  <SkuField
                    attribute='description'
                    tagElement='p'
                    className='mb-2'
                  />

                  <PricesContainer>
                    <Price compareClassName='line-through ml-2' />
                  </PricesContainer>

                  <div className='my-2'>
                    <AddToCartButton className='px-3 py-2 bg-black text-white rounded disabled:opacity-50' />
                  </div>

                  <AvailabilityContainer>
                    <AvailabilityTemplate
                      timeFormat='days'
                      className='text-sm'
                      showShippingMethodName
                    />
                  </AvailabilityContainer>
                </div>
              </div>
            </Skus>
          </SkusContainer>

          <HostedCart
            type='mini'
            openAdd
            style={{
              container: {
                backgroundColor: 'white'
              }
            }}
          />
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

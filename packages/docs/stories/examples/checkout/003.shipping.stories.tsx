import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import { OrderStorage } from '../../_internals/OrderStorage'
import Errors from '#components/errors/Errors'
import { ShipmentsContainer } from '#components/shipments/ShipmentsContainer'
import { Shipment } from '#components/shipments/Shipment'
import { ShipmentField } from '#components/shipments/ShipmentField'
import { ShippingMethod } from '#components/shipping_methods/ShippingMethod'
import { ShippingMethodRadioButton } from '#components/shipping_methods/ShippingMethodRadioButton'
import { ShippingMethodName } from '#components/shipping_methods/ShippingMethodName'
import { ShippingMethodPrice } from '#components/shipping_methods/ShippingMethodPrice'
import { DeliveryLeadTime } from '#components/skus/DeliveryLeadTime'
import { persistKey } from './utils'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemName from '#components/line_items/LineItemName'
import LineItem from '#components/line_items/LineItem'
import LineItemQuantity from '#components/line_items/LineItemQuantity'

const setup: Meta = {
  title: 'Examples/Checkout Page/Shipping Methods'
}

export default setup

export const ShipmentMethods: StoryFn = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer>
          <ShipmentsContainer>
            <Errors resource='shipments' className='block' />
            <Shipment>
              <div className='mb-8 pb-8 border-b last:border-b-0 last:pb-0 last:mb-0 '>
                <section title='package recap' className='mb-4'>
                  <div className='font-bold'>
                    Content of the package for shipment nr.{' '}
                    <ShipmentField name='number' className='' />
                  </div>

                  <section className='p-3 border rounded'>
                    <LineItemsContainer>
                      <LineItem type='skus'>
                        <div className='flex gap-2'>
                          <LineItemName />
                          <span>
                            (<LineItemQuantity readonly />)
                          </span>
                        </div>
                      </LineItem>
                    </LineItemsContainer>
                  </section>
                </section>

                <div className='font-bold'>
                  Select shipping method for this package
                </div>

                <section className='px-3 py-6 border rounded'>
                  <ShippingMethod emptyText='Please set as your address an allowed country to view available shipping methods'>
                    <fieldset className='mb-2 last:mb-0'>
                      <ShippingMethodRadioButton className='cursor-pointer' />{' '}
                      <ShippingMethodName className='cursor-pointer' /> (
                      <ShippingMethodPrice className='font-bold' />){' '}
                      <div className='inline text-gray-600'>
                        <DeliveryLeadTime type='min_days' />-
                        <DeliveryLeadTime type='max_days' /> days
                      </div>
                    </fieldset>
                  </ShippingMethod>
                </section>
              </div>
            </Shipment>
          </ShipmentsContainer>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

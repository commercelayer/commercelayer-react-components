import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItem from '#components/line_items/LineItem'
import LineItemName from '#components/line_items/LineItemName'
import LineItemImage from '#components/line_items/LineItemImage'
import LineItemAmount from '#components/line_items/LineItemAmount'
import LineItemsEmpty from '#components/line_items/LineItemsEmpty'
import { OrderStorage, AddSampleItems } from '../../_internals/OrderStorage'
import LineItemQuantity from '#components/line_items/LineItemQuantity'
import { persistKey } from './utils'
import GiftCardOrCouponForm from '#components/gift_cards/GiftCardOrCouponForm'
import GiftCardOrCouponSubmit from '#components/gift_cards/GiftCardOrCouponSubmit'
import GiftCardOrCouponInput from '#components/gift_cards/GiftCardOrCouponInput'
import Errors from '#components/errors/Errors'
import GiftCardOrCouponCode from '#components/gift_cards/GiftCardOrCouponCode'
import GiftCardOrCouponRemoveButton from '#components/gift_cards/GiftCardOrCouponRemoveButton'
import SubTotalAmount from '#components/orders/SubTotalAmount'
import DiscountAmount from '#components/orders/DiscountAmount'
import GiftCardAmount from '#components/orders/GiftCardAmount'
import TotalAmount from '#components/orders/TotalAmount'

const setup: Meta = {
  title: 'Examples/Checkout Page/Item list'
}

export default setup

export const ListOfItems: StoryFn = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer>
          <section className='max-w-xl'>
            <LineItemsContainer>
              <LineItem type='skus'>
                <div className='grid gap-4 grid-cols-[1fr,5fr,1fr,1fr] mb-4 items-center'>
                  <LineItemImage width={50} />
                  <div>
                    <LineItemName />
                    <div className='text-gray-500 text-sm'>
                      Unit price: <LineItemAmount type='unit' />
                    </div>
                  </div>
                  <div>
                    &times; <LineItemQuantity readonly />
                  </div>
                  <LineItemAmount className='text-right' />
                </div>
              </LineItem>
              <LineItemsEmpty>
                {({ quantity }) => (quantity > 0 ? null : <AddSampleItems />)}
              </LineItemsEmpty>
            </LineItemsContainer>
          </section>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const Coupons: StoryFn = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer>
          <section className='mb-4'>
            <GiftCardOrCouponForm>
              <GiftCardOrCouponInput
                placeholder='Gift card or coupon'
                className='border p-2'
              />
              <GiftCardOrCouponSubmit
                label='Add'
                className='px-4 py-2 bg-black border text-white'
              />
            </GiftCardOrCouponForm>
            <div className='flex gap-2 items-center mt-2'>
              <GiftCardOrCouponCode />
              <GiftCardOrCouponRemoveButton
                label='remove'
                className='hover:underline text-sm text-red-500'
              />
            </div>
          </section>

          <Errors
            resource='orders'
            field='gift_card_or_coupon_code'
            className='text-red-500 text-sm'
            messages={[
              {
                code: 'VALIDATION_ERROR',
                resource: 'orders',
                field: 'gift_card_or_coupon_code',
                message: 'Invalid coupon code'
              }
            ]}
          />

          <div className='grid grid-cols-2 max-width'>
            Subtotal <SubTotalAmount />
            Discount <DiscountAmount />
            Gift Card <GiftCardAmount />
            Total <TotalAmount />
          </div>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

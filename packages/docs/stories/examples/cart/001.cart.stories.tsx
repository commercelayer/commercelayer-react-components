import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemsCount from '#components/line_items/LineItemsCount'
import LineItem from '#components/line_items/LineItem'
import LineItemName from '#components/line_items/LineItemName'
import LineItemRemoveLink from '#components/line_items/LineItemRemoveLink'
import LineItemImage from '#components/line_items/LineItemImage'
import LineItemQuantity from '#components/line_items/LineItemQuantity'
import Errors from '#components/errors/Errors'
import LineItemAmount from '#components/line_items/LineItemAmount'
import LineItemsEmpty from '#components/line_items/LineItemsEmpty'
import SubTotalAmount from '#components/orders/SubTotalAmount'
import DiscountAmount from '#components/orders/DiscountAmount'
import GiftCardAmount from '#components/orders/GiftCardAmount'
import TotalAmount from '#components/orders/TotalAmount'
import GiftCardOrCouponForm from '#components/gift_cards/GiftCardOrCouponForm'
import GiftCardOrCouponSubmit from '#components/gift_cards/GiftCardOrCouponSubmit'
import GiftCardOrCouponInput from '#components/gift_cards/GiftCardOrCouponInput'
import GiftCardOrCouponCode from '#components/gift_cards/GiftCardOrCouponCode'
import GiftCardOrCouponRemoveButton from '#components/gift_cards/GiftCardOrCouponRemoveButton'
import { OrderStorage, AddSampleItems } from '../../_internals/OrderStorage'

const setup: Meta = {
  title: 'Examples/Shopping Cart/Cart page'
}

export default setup

export const Default: StoryFn = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <OrderStorage persistKey='cl-examples1-cartId'>
        <OrderContainer>
          <section className='p-6 border rounded-lg mb-4 max-w-xl'>
            <legend className='text-lg font-bold'>Line items</legend>
            <LineItemsContainer>
              <p className='text-large mb-4'>
                Items count: <LineItemsCount />
              </p>
              <LineItem type='skus'>
                <div className='grid gap-4 grid-cols-[auto,5fr,auto,2fr,auto] mb-4 items-center'>
                  <LineItemImage width={50} />
                  <LineItemName />
                  <div>
                    <LineItemQuantity
                      max={10}
                      className='p-2 border border-gray-300'
                    />
                    <Errors resource='line_items' field='quantity' />
                  </div>
                  <LineItemAmount className='text-right' />
                  <LineItemRemoveLink />
                </div>
              </LineItem>
              <LineItemsEmpty>
                {({ quantity }) => (quantity > 0 ? null : <AddSampleItems />)}
              </LineItemsEmpty>
            </LineItemsContainer>
          </section>

          <section className='p-6 border rounded-lg mb-4'>
            <legend className='text-lg font-bold'>Coupon</legend>
            <GiftCardOrCouponForm codeType='coupon_code'>
              <GiftCardOrCouponInput className='border p-2' />
              <GiftCardOrCouponSubmit className='px-4 py-2 bg-black border text-white' />
            </GiftCardOrCouponForm>
            <div className='flex'>
              <GiftCardOrCouponCode type='coupon' />
              <GiftCardOrCouponRemoveButton
                type='coupon'
                className='px-4 py-2 bg-black border text-white'
              />
            </div>
          </section>
          <section className='p-6 border rounded-lg mb-4'>
            <legend className='text-lg font-bold'>Gift Card</legend>
            <GiftCardOrCouponForm codeType='gift_card_code'>
              <GiftCardOrCouponInput className='border p-2' />
              <GiftCardOrCouponSubmit className='px-4 py-2 bg-black border text-white' />
            </GiftCardOrCouponForm>
            <div className='flex'>
              <GiftCardOrCouponCode type='gift_card' />
              <GiftCardOrCouponRemoveButton
                type='gift_card'
                className='px-4 py-2 bg-black border text-white'
              />
            </div>
          </section>

          <section className='p-6 border rounded-lg'>
            <legend className='text-lg font-bold'>Totals</legend>
            <div className='grid grid-cols-2 max-width'>
              Subtotal <SubTotalAmount />
              Discount <DiscountAmount />
              Gift Card <GiftCardAmount />
              Total <TotalAmount />
            </div>
          </section>

          <Errors resource='orders' />
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

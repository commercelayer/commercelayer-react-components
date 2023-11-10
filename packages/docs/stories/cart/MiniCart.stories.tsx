import type { Meta, StoryFn, Decorator } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import CartLink from '#components/orders/CartLink'
import { HostedCart } from '#components/orders/HostedCart'
import { OrderStorage } from '../_internals/OrderStorage'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemsCount from '#components/line_items/LineItemsCount'

const setup: Meta = {
  title: 'Components/Cart/Mini Cart'
}

export default setup

const CartDecorator: Decorator = (Story) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <OrderStorage persistKey='cl-examples1-cartId'>
        <div
          style={{
            minHeight: 600
          }}
        >
          {/* we need more space on the canvas to open the mini cart */}
          <Story />
        </div>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const Basic: StoryFn = (arg) => {
  return (
    <OrderContainer>
      <HostedCart
        type='mini'
        openAdd
        style={{
          container: {
            backgroundColor: 'white'
          }
        }}
      />
      <CartLink
        label='Open mini cart'
        type='mini'
        className='underline hover:text-blue-500'
      />
    </OrderContainer>
  )
}

Basic.decorators = [CartDecorator]

export const CartIcon: StoryFn = (args) => {
  return (
    <div className='relative inline-block cursor-pointer  text-xs font-bold'>
      <LineItemsContainer>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='36'
          height='36'
          fill='currentColor'
          viewBox='0 0 256 256'
        >
          <path d='M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z' />
        </svg>
        <LineItemsCount className='absolute bottom-2 left-1/2 transform -translate-x-1/2' />
      </LineItemsContainer>
    </div>
  )
}
CartIcon.parameters = {}
CartIcon.decorators = [
  (Story) => (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <OrderStorage persistKey='cl-examples1-cartId'>
        <OrderContainer>
          <Story />
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
]

const MyCartIcon = (): JSX.Element => (
  <div className='relative inline-block cursor-pointer  text-xs font-bold'>
    <LineItemsContainer>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='36'
        height='36'
        fill='currentColor'
        viewBox='0 0 256 256'
      >
        <path d='M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z' />
      </svg>
      <LineItemsCount className='absolute bottom-2 left-1/2 transform -translate-x-1/2' />
    </LineItemsContainer>
  </div>
)
MyCartIcon.DisplayName = 'MyCartIcon'

const cartOverlayStyle = { container: { backgroundColor: 'white' } }
export const WithCartIcon: StoryFn = () => (
  <OrderContainer>
    <HostedCart type='mini' openAdd style={cartOverlayStyle} />
    <CartLink
      label={<MyCartIcon />}
      type='mini'
      className='underline hover:text-blue-500'
    />
  </OrderContainer>
)

WithCartIcon.decorators = [CartDecorator]
WithCartIcon.parameters = {
  docs: {
    canvas: {
      sourceState: 'shown'
    }
  }
}

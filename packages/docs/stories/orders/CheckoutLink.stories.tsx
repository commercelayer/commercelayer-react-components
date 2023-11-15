import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import CheckoutLink from '#components/orders/CheckoutLink'
import { OrderStorage } from '../_internals/OrderStorage'

const setup: Meta<typeof CheckoutLink> = {
  title: 'Components/Orders/CheckoutLink',
  component: CheckoutLink
}

export default setup

const Template: StoryFn<typeof CheckoutLink> = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey='cl-examples1-cartId'>
        <OrderContainer>
          <CheckoutLink {...args} />
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  label: 'Go to checkout',
  target: '_blank',
  className: 'underline hover:text-blue-500'
}

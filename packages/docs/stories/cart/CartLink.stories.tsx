import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import CartLink from '#components/orders/CartLink'

const setup: Meta<typeof CartLink> = {
  title: 'Components/Cart/CartLink',
  component: CartLink
}

export default setup

const Template: StoryFn<typeof CartLink> = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderContainer orderId='BXVhDoxVpx'>
        <CartLink {...args} />
      </OrderContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  label: 'Go to cart',
  target: '_blank',
  onClick: () => {},
  className: 'text-blue-500 hover:underline'
}

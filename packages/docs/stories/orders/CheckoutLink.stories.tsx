import type { Meta, StoryFn, StoryObj } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import Order from '#components/orders/Order'
import CheckoutLink from '#components/orders/CheckoutLink'
import { OrderStorage } from '../_internals/OrderStorage'

const setup: Meta<typeof CheckoutLink> = {
  title: 'Components/Orders/CheckoutLink',
  component: CheckoutLink,
}

export default setup

const Template: StoryFn<typeof CheckoutLink> = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey='cl-examples-checkoutLink'>
        <Order>
          <CheckoutLink {...args} />
        </Order>
      </OrderStorage>
    </CommerceLayer>
  )
}

/**
 * By default, `CheckoutLink` redirects the customer to the hosted mfe-checkout application,
 * building the URL from the access token and order id.
 */
export const Default = Template.bind({})
Default.args = {
  label: 'Go to checkout',
  className: 'text-blue-600 underline hover:text-blue-800',
}
Default.parameters = {
  docs: {
    canvas: {
      sourceState: 'shown',
    },
  },
}

/**
 * When `hostedCheckout` is set to `false`, the component uses the `checkout_url` attribute
 * found in the order object instead of the hosted micro-frontend URL.
 * Useful when you have a custom checkout flow configured on the order.
 */
export const WithOrderCheckoutUrl = Template.bind({})
WithOrderCheckoutUrl.args = {
  label: 'Checkout via order URL',
  hostedCheckout: false,
  className: 'text-blue-600 underline hover:text-blue-800',
}

/**
 * You can use the `children` render prop to fully customise the checkout trigger element.
 * The children function receives `href`, `handleClick`, `orderId`, and `accessToken` among other props.
 */
export const ChildrenProps: StoryObj = () => {
  return (
    <CheckoutLink>
      {({ href, handleClick }) => (
        <a
          href={href}
          onClick={handleClick}
          className='inline-flex items-center gap-2 rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800'
        >
          Proceed to checkout →
        </a>
      )}
    </CheckoutLink>
  )
}
ChildrenProps.decorators = [
  (Story) => (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey='cl-examples-checkoutLink'>
        <Order>
          <Story />
        </Order>
      </OrderStorage>
    </CommerceLayer>
  ),
]
ChildrenProps.args = {}

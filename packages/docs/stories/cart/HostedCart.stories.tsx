import type { Meta, StoryFn } from "@storybook/react-vite"
import LineItemsContainer from "#components/line_items/LineItemsContainer"
import LineItemsEmpty from "#components/line_items/LineItemsEmpty"
import { HostedCart } from "#components/orders/HostedCart"
import OrderContainer from "#components/orders/OrderContainer"
import CommerceLayer from "../_internals/CommerceLayer"
import { AddSampleItems, OrderStorage } from "../_internals/OrderStorage"

const setup: Meta<typeof HostedCart> = {
  title: "Components/Cart/HostedCart",
  component: HostedCart,
}

export default setup

const Template: StoryFn<typeof HostedCart> = (args) => {
  return (
    <OrderContainer>
      <HostedCart {...args} type={undefined} />
    </OrderContainer>
  )
}

export const Default = Template.bind({})
Default.args = {
  type: undefined,
}

Default.decorators = [
  (Story) => {
    return (
      <CommerceLayer
        accessToken="my-access-token"
        endpoint="https://demo-store.commercelayer.io"
      >
        <OrderStorage persistKey="cl-examples1-cartId">
          <OrderContainer>
            <LineItemsContainer>
              <LineItemsEmpty>
                {({ quantity }) => {
                  if (quantity === undefined) {
                    return null
                  }
                  return quantity > 0 ? <Story /> : <AddSampleItems />
                }}
              </LineItemsEmpty>
            </LineItemsContainer>
          </OrderContainer>
        </OrderStorage>
      </CommerceLayer>
    )
  },
]

import type { Meta, StoryFn } from "@storybook/react-vite"
import OrderContainer from "#components/orders/OrderContainer"
import OrderNumber from "#components/orders/OrderNumber"
import TotalAmount from "#components/orders/TotalAmount"
import CommerceLayer from "../_internals/CommerceLayer"

const setup: Meta<typeof OrderContainer> = {
  title: "Components/Orders/OrderContainer",
  component: OrderContainer,
}

export default setup

const Template: StoryFn<typeof OrderContainer> = (args) => {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderContainer {...args}>
        <div>
          Order number: <OrderNumber />
        </div>
        <div>
          Total amount: <TotalAmount />
        </div>
      </OrderContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  orderId: "KaeheROdbp",
  fetchOrder: (order) => {
    console.log("fetchOrder: ", order)
  },
}
Default.parameters = {
  docs: {
    canvas: {
      sourceState: "shown",
    },
  },
}

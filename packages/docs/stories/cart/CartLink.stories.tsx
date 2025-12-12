import type { Meta, StoryFn } from "@storybook/react-vite"
import CartLink from "#components/orders/CartLink"
import OrderContainer from "#components/orders/OrderContainer"
import CommerceLayer from "../_internals/CommerceLayer"

const setup: Meta<typeof CartLink> = {
  title: "Components/Cart/CartLink",
  component: CartLink,
}

export default setup

const Template: StoryFn<typeof CartLink> = (args) => {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderContainer orderId="BXVhDoxVpx">
        <CartLink {...args} />
      </OrderContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  label: "Go to cart",
  target: "_blank",
  onClick: () => { },
  className: "text-blue-500 hover:underline",
}

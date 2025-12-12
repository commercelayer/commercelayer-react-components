import type { Meta, StoryFn } from "@storybook/react-vite"
import OrderStorage from "#components/orders/OrderStorage"
import CommerceLayer from "../_internals/CommerceLayer"

const setup: Meta<typeof OrderStorage> = {
  title: "Components/Orders/OrderStorage",
  component: OrderStorage,
}

export default setup

const Template: StoryFn<typeof OrderStorage> = (args) => {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderStorage {...args}>...</OrderStorage>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  clearWhenPlaced: true,
  persistKey: "myLocalStorageKey",
}
Default.parameters = {
  docs: {
    canvas: {
      sourceState: "shown",
    },
  },
}

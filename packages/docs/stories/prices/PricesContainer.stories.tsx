import type { Meta, StoryFn } from "@storybook/react-vite"
import Price from "#components/prices/Price"
import PricesContainer from "#components/prices/PricesContainer"
import CommerceLayer from "../_internals/CommerceLayer"

const setup: Meta<typeof PricesContainer> = {
  title: "Components/Prices/PricesContainer",
  component: PricesContainer,
}

export default setup

const Template: StoryFn<typeof PricesContainer> = (args) => {
  return (
    <CommerceLayer accessToken="my-access-token">
      <PricesContainer {...args}>
        <Price />
      </PricesContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  skuCode: "POST6191FFFFFF000000XXXX",
}

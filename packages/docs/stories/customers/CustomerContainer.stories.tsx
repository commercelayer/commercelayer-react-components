import type { Meta, StoryFn } from "@storybook/react-vite"
import CustomerContainer from "#components/customers/CustomerContainer"
import { CustomerField } from "#components/customers/CustomerField"
import CommerceLayer from "../_internals/CommerceLayer"

const setup: Meta<typeof CustomerContainer> = {
  title: "Components/Customers/CustomerContainer",
  component: CustomerContainer,
}

export default setup

const Template: StoryFn<typeof CustomerContainer> = (args) => {
  return (
    <CommerceLayer accessToken="customer-access-token">
      <CustomerContainer>
        <CustomerField name="email" attribute="email" tagElement="p" />
      </CustomerContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {}
Default.parameters = {
  docs: {
    canvas: {
      sourceState: "shown",
    },
  },
}

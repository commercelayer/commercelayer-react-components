import type { Meta, StoryFn } from "@storybook/react-vite"
import CustomerContainer from "#components/customers/CustomerContainer"
import MyAccountLink from "#components/customers/MyAccountLink"
import CommerceLayer from "../_internals/CommerceLayer"

const setup: Meta<typeof MyAccountLink> = {
  title: "Components/Customers/MyAccountLink",
  component: MyAccountLink,
}

export default setup

const Template: StoryFn<typeof MyAccountLink> = (args) => {
  return (
    <CommerceLayer accessToken="customer-access-token">
      <CustomerContainer>
        <MyAccountLink {...args} />
      </CustomerContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  label: "Go to my-account",
  target: "_blank",
  onClick: () => { },
  className: "text-blue-500 hover:underline",
}

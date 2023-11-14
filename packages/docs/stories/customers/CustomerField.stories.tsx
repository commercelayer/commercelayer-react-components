import { type Meta, type StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { CustomerContainer } from '#components/customers/CustomerContainer'
import { CustomerField } from '#components/customers/CustomerField'

const setup: Meta<typeof CustomerField> = {
  title: 'Components/Customers/CustomerField',
  component: CustomerField,
  argTypes: {
    attribute: {
      control: 'select',
      options: ['email', 'status', 'total_orders_count'],
      description: 'Resource attribute to display'
    },
    tagElement: {
      control: 'select',
      options: ['div', 'p', 'span', 'section'],
      description:
        'Resource attribute to displayHtml tag to render. When tag is `img` the value will be used to fill the `src` attribute.'
    }
  }
}

export default setup

const Template: StoryFn<typeof CustomerField> = (args) => {
  return <CustomerField {...args} />
}

export const Default = Template.bind({})
Default.args = {
  attribute: 'email',
  tagElement: 'p'
}

Default.decorators = [
  (Story) => (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <Story />
      </CustomerContainer>
    </CommerceLayer>
  )
]

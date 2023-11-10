import { type Meta, type StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { AddressesContainer } from '#components/addresses/AddressesContainer'
import { Address } from '#components/addresses/Address'
import { AddressField } from '#components/addresses/AddressField'
import CustomerContainer from '#components/customers/CustomerContainer'

const setup: Meta<typeof AddressField> = {
  title: 'Components/Addresses/AddressField',
  component: AddressField,
  argTypes: {
    name: {
      control: 'select',
      options: ['first_name', 'last_name'],
      description: 'Resource attribute to be displayed.'
    },
    type: {
      control: 'select',
      options: ['field', 'edit', 'delete'],
      description:
        'Behavior requested for current `AddressField`. It could be `field` to show an attribute of an `address` or either `Edit` or `Delete` to generate an action button to interact with current `address`.'
    },
    label: {
      control: 'text',
      description:
        'Label to be displayed in case of `field` is set to either `edit` or `delete`.'
    }
  }
}

export default setup

const Template: StoryFn<typeof AddressField> = (args) => {
  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <Address>
            <AddressField {...args} />
          </Address>
        </AddressesContainer>
      </CustomerContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  name: 'first_name',
  type: 'field'
}

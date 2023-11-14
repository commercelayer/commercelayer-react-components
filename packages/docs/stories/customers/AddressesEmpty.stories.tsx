import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { AddressesEmpty } from '#components/addresses/AddressesEmpty'

const setup: Meta<typeof AddressesEmpty> = {
  title: 'Components/Customers/AddressesEmpty',
  component: AddressesEmpty
}

export default setup

const Template: StoryFn<typeof AddressesEmpty> = (args) => {
  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <AddressesEmpty emptyText='No saved address for current customer' />
        </AddressesContainer>
      </CustomerContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {}
Default.parameters = {
  docs: {
    canvas: {
      sourceState: 'shown'
    }
  }
}

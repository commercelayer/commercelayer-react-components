import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { AddressesEmpty } from '#components/addresses/AddressesEmpty'
import { Address as AddressComponent } from '#components/addresses/Address'
import { AddressField } from '#components/addresses/AddressField'

const setup: Meta<typeof AddressesContainer> = {
  title: 'Components/Customers/AddressesContainer',
  component: AddressesContainer
}

export default setup

const Template: StoryFn<typeof AddressesContainer> = (args) => {
  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <AddressesEmpty emptyText='No saved address for current customer' />
          <Address />
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

const Address: React.FC = () => {
  return (
    <AddressComponent>
      <div className='grid gap-2'>
        <AddressField name='full_name' />
        <AddressField name='full_address' />
      </div>
    </AddressComponent>
  )
}

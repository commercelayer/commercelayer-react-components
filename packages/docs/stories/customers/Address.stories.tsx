import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { AddressesEmpty } from '#components/addresses/AddressesEmpty'
import { Address } from '#components/addresses/Address'
import { AddressField } from '#components/addresses/AddressField'

const setup: Meta<typeof Address> = {
  title: 'Components/Customers/Address',
  component: Address
}

export default setup

const Template: StoryFn<typeof Address> = () => {
  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <h1 className='text-xl mb-2'>Customer Addresses</h1>
          <AddressesEmpty emptyText='No saved address for current customer' />
          <Address
            className='rounded border-2 border-gray-200 cursor-pointer select-none'
            selectedClassName='!border-green-500'
            onSelect={() => {
              alert('select')
            }}
          >
            <div className='flex gap-2'>
              <div>
                <strong>First Name</strong>
                <AddressField name='first_name' />
              </div>
              <div>
                <strong>Last Name</strong>
                <AddressField name='last_name' />
              </div>
              <div>
                <strong>Address</strong>
                <AddressField name='full_address' />
              </div>
            </div>
          </Address>
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
    },
    source: {
      type: 'code'
    }
  }
}

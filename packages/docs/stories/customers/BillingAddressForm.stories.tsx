import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { BillingAddressForm } from '#components/addresses/BillingAddressForm'

const setup: Meta<typeof BillingAddressForm> = {
  title: 'Components/Customers/BillingAddressForm',
  component: BillingAddressForm
}

export default setup

const Template: StoryFn<typeof BillingAddressForm> = () => {
  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <BillingAddressForm
            errorClassName='border-red-600'
            autoComplete='on'
            className='p-2'
          >
            <div>
              {/* Fields here... */}
              BillingAddressForm
            </div>
          </BillingAddressForm>
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

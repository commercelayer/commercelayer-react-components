import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { BillingAddressForm } from '#components/addresses/BillingAddressForm'
import AddressInput from '#components/addresses/AddressInput'
import Errors from '#components/errors/Errors'
import AddressCountrySelector from '#components/addresses/AddressCountrySelector'
import AddressStateSelector from '#components/addresses/AddressStateSelector'
import SaveAddressesButton from '#components/addresses/SaveAddressesButton'
import AddressesEmpty from '#components/addresses/AddressesEmpty'
import Address from '#components/addresses/Address'
import { AddressField } from '#components/addresses/AddressField'

const setup: Meta<typeof BillingAddressForm> = {
  title: 'Components/Addresses/BillingAddressForm',
  component: BillingAddressForm
}

export default setup

const Template: StoryFn<typeof BillingAddressForm> = (args) => {
  const inputClassNames =
    'px-2 p-1 border-2 border-gray-300 focus:border-blue-500 block w-full rounded-md'

  const selectClassNames =
    'p-1 border-2 border-gray-300 focus:border-blue-500 block w-full rounded-md'

  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <div className='my-2'>
            <h1 className='text-xl mb-2'>Customer Addresses</h1>
            <AddressesEmpty emptyText='No saved address for current customer' />
            <Address>
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
          </div>
          <hr />
          <div className='my-2'>
            <h1 className='text-xl mb-2'>Create a customer address</h1>
            <BillingAddressForm
              errorClassName='outline-none !border-red-600 focus:!border-red-600'
              autoComplete='on'
              className='p-2'
            >
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_first_name'
                  className='block text-sm font-medium text-gray-700'
                >
                  First name
                </label>
                <div className='mt-1'>
                  <AddressInput
                    name='billing_address_first_name'
                    type='text'
                    className={inputClassNames}
                    placeholder='First name'
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_first_name'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_first_name',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_first_name',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_last_name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Last name
                </label>
                <div className='mt-1'>
                  <AddressInput
                    name='billing_address_last_name'
                    type='text'
                    className={inputClassNames}
                    placeholder='Last name'
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_last_name'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_last_name',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_last_name',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_line_1'
                  className='block text-sm font-medium text-gray-700'
                >
                  Address
                </label>
                <div className='mt-1'>
                  <AddressInput
                    name='billing_address_line_1'
                    type='text'
                    className={inputClassNames}
                    placeholder='Address'
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_line_1'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_line_1',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_line_1',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_city'
                  className='block text-sm font-medium text-gray-700'
                >
                  City
                </label>
                <div className='mt-1'>
                  <AddressInput
                    name='billing_address_city'
                    type='text'
                    className={inputClassNames}
                    placeholder='City'
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_city'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_city',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_city',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_country_code'
                  className='block text-sm font-medium text-gray-700'
                >
                  Country
                </label>
                <div className='mt-1'>
                  <AddressCountrySelector
                    name='billing_address_country_code'
                    className={selectClassNames}
                    placeholder={{
                      value: '',
                      label: 'Select a country',
                      disabled: true
                    }}
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_country_code'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_country_code',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_country_code',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_state_code'
                  className='block text-sm font-medium text-gray-700'
                >
                  State
                </label>
                <div className='mt-1'>
                  <AddressStateSelector
                    name='billing_address_state_code'
                    className={selectClassNames}
                    placeholder={{
                      value: '',
                      label: 'Select a state',
                      disabled: true
                    }}
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_state_code'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_state_code',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_state_code',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_zip_code'
                  className='block text-sm font-medium text-gray-700'
                >
                  Zip code
                </label>
                <div className='mt-1'>
                  <AddressInput
                    name='billing_address_zip_code'
                    type='text'
                    className={inputClassNames}
                    placeholder='Zip code'
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_zip_code'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_zip_code',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_zip_code',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='billing_address_phone'
                  className='block text-sm font-medium text-gray-700'
                >
                  Phone
                </label>
                <div className='mt-1'>
                  <AddressInput
                    name='billing_address_phone'
                    type='tel'
                    className={inputClassNames}
                    placeholder='Phone'
                  />
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  <Errors
                    resource='billing_address'
                    field='billing_address_phone'
                    messages={[
                      {
                        code: 'EMPTY_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_phone',
                        message: `Can't be blank`
                      },
                      {
                        code: 'VALIDATION_ERROR',
                        resource: 'billing_address',
                        field: 'billing_address_phone',
                        message: `Must be valid email`
                      }
                    ]}
                  />
                </p>
              </div>
              <SaveAddressesButton
                label='Save Address'
                className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
              />
            </BillingAddressForm>
          </div>
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

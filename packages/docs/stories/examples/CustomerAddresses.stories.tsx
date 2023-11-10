import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { AddressesEmpty } from '#components/addresses/AddressesEmpty'
import { Address } from '#components/addresses/Address'
import { BillingAddressForm } from '#components/addresses/BillingAddressForm'
import { AddressField } from '#components/addresses/AddressField'
import { useState } from 'react'
import AddressInput from '#components/addresses/AddressInput'
import Errors from '#components/errors/Errors'
import AddressCountrySelector from '#components/addresses/AddressCountrySelector'
import AddressStateSelector from '#components/addresses/AddressStateSelector'
import SaveAddressesButton from '#components/addresses/SaveAddressesButton'

const setup: Meta = {
  title: 'Examples/Customer Addresses'
}

export default setup

export const Default: StoryFn = () => {
  const inputClassNames =
    'px-2 p-1 border-2 border-gray-300 focus:border-blue-500 block w-full rounded-md'

  const selectClassNames =
    'p-1 border-2 border-gray-300 focus:border-blue-500 block w-full rounded-md'

  const [address, setAddress] = useState<any>({})
  const [showForm, setShowForm] = useState(false)

  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <AddressesEmpty />
          <div className='w-full p-5'>
            <div className='flex flex-wrap mx-auto w-full'>
              <Address className='w-1/3 p-2 border hover:border-blue-500 rounded m-2 shadow-sm'>
                <div className='flex flex-col justify-between h-full'>
                  <div className='flex font-bold'>
                    <AddressField name='first_name' />
                    <AddressField name='last_name' className='ml-1' />
                  </div>
                  <div>
                    <AddressField className='w-2/3' name='full_address' />
                  </div>
                  <div className='flex justify-between'>
                    <div>
                      <AddressField
                        className='cursor-pointer'
                        type='edit'
                        label='Edit'
                        onClick={(address) => {
                          console.log('address', address)
                          setAddress(address)
                          setShowForm(true)
                        }}
                      />
                    </div>
                    <div>
                      <AddressField
                        className='cursor-pointer'
                        type='delete'
                        label='Delete'
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </Address>
            </div>
            <div className='mt-3 ml-2'>
              <button
                title='button'
                type='button'
                className='inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                onClick={() => {
                  setAddress({})
                  setShowForm(true)
                }}
              >
                <svg
                  className='h-5 w-5'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
            {showForm ? (
              <div>
                <h3 className='text-lg font-medium leading-6 text-gray-900 bg-gray-50 p-2 my-3 shadow rounded-sm'>
                  Fill up the form
                </h3>
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
                        value={address?.first_name ?? ''}
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
                        value={address?.last_name ?? ''}
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
                        value={address?.line_1 ?? ''}
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
                        value={address?.city ?? ''}
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
                        value={address?.country_code ?? ''}
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
                        value={address?.state_code ?? ''}
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
                        value={address?.zip_code ?? ''}
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
                        value={address?.phone ?? ''}
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
                </BillingAddressForm>
                <div className='mt-5 p-2 flex justify-between'>
                  <SaveAddressesButton
                    label='Save Address'
                    className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
                    onClick={() => {
                      setShowForm(false)
                    }}
                    addressId={address.id}
                  />
                  <button
                    type='button'
                    className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    onClick={() => {
                      setShowForm(false)
                    }}
                  >
                    Undo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </AddressesContainer>
      </CustomerContainer>
    </CommerceLayer>
  )
}

Default.parameters = {
  docs: {
    source: {
      type: 'code'
    }
  }
}

import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
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
import { type Address as TAddress } from '@commercelayer/sdk'

type PartialAddress = Partial<TAddress>

const setup: Meta = {
  title: 'Examples/Customer Account/Address book'
}

export default setup

export const Default: StoryFn = () => {
  const labelClassNames = 'block text-sm font-medium'
  const inputClassNames = 'border border-gray-300 p-2 rounded-md w-full'
  const errorClassNames = 'mt-1 text-sm text-red-600'

  // address to edit
  const [address, setAddress] = useState<PartialAddress | null>(null)

  // our code
  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          {/* Empty state (no saved addresses) */}
          <AddressesEmpty emptyText='No addresses found' />

          {/* Listing saved addresses */}
          <section className='grid grid-cols-3 gap-4 mt-4'>
            <Address className='border p-4 grid gap-2 text-sm rounded-md'>
              <AddressField name='full_name' className='font-bold' />
              <AddressField name='full_address' />
              <div className='flex justify-between'>
                <AddressField
                  className='cursor-pointer text-sm font-bold'
                  type='edit'
                  label='Edit'
                  onClick={(address) => {
                    setAddress(address)
                  }}
                />
                <AddressField
                  className='cursor-pointer text-red-400 text-sm font-bold'
                  type='delete'
                  label='Delete'
                  onClick={() => {}}
                />
              </div>
            </Address>
          </section>

          {/* Add new address */}
          <button
            className='my-3 px-3 py-2 rounded bg-green-600 text-white'
            onClick={() => {
              setAddress({})
            }}
          >
            Add new address
          </button>

          {/* The address form */}
          {address != null && (
            <section>
              <BillingAddressForm
                errorClassName='outline-none !border-red-600 focus:!border-red-600'
                autoComplete='on'
                className='p-2'
              >
                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_first_name'
                    className={labelClassNames}
                  >
                    First name
                  </label>
                  <AddressInput
                    name='billing_address_first_name'
                    className={inputClassNames}
                    value={address?.first_name ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_first_name'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_last_name'
                    className={labelClassNames}
                  >
                    Last name
                  </label>
                  <AddressInput
                    name='billing_address_last_name'
                    className={inputClassNames}
                    value={address?.last_name ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_last_name'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_line_1'
                    className={labelClassNames}
                  >
                    Address
                  </label>
                  <AddressInput
                    name='billing_address_line_1'
                    type='text'
                    className={inputClassNames}
                    placeholder='Address'
                    value={address?.line_1 ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_line_1'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_city'
                    className={labelClassNames}
                  >
                    City
                  </label>
                  <AddressInput
                    name='billing_address_city'
                    type='text'
                    className={inputClassNames}
                    placeholder='City'
                    value={address?.city ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_city'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_country_code'
                    className={labelClassNames}
                  >
                    Country
                  </label>
                  <AddressCountrySelector
                    name='billing_address_country_code'
                    className={inputClassNames}
                    placeholder={{
                      value: '',
                      label: 'Select a country',
                      disabled: true
                    }}
                    value={address?.country_code ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_country_code'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_state_code'
                    className={labelClassNames}
                  >
                    State
                  </label>
                  <AddressStateSelector
                    name='billing_address_state_code'
                    className={inputClassNames}
                    placeholder={{
                      value: '',
                      label: 'Select a state',
                      disabled: true
                    }}
                    value={address?.state_code ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_state_code'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='billing_address_zip_code'
                    className={labelClassNames}
                  >
                    Zip code
                  </label>
                  <AddressInput
                    name='billing_address_zip_code'
                    className={inputClassNames}
                    value={address?.zip_code ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_zip_code'
                    className={errorClassNames}
                  />
                </div>

                <div className='mb-5'>
                  <label
                    htmlFor='billing_address_phone'
                    className={labelClassNames}
                  >
                    Phone
                  </label>
                  <AddressInput
                    name='billing_address_phone'
                    type='tel'
                    className={inputClassNames}
                    value={address?.phone ?? ''}
                  />
                  <Errors
                    resource='billing_address'
                    field='billing_address_phone'
                    className={errorClassNames}
                  />
                </div>
              </BillingAddressForm>

              {/* Save address button  */}
              {/* When `addressId` is set it will update existing address, otherwise will create a new address */}
              <SaveAddressesButton
                addressId={address?.id}
                label='Save Address'
                className='px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50'
                onClick={() => {
                  setAddress(null)
                }}
              />
            </section>
          )}
        </AddressesContainer>
      </CustomerContainer>
    </CommerceLayer>
  )
}

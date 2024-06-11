import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import { BillingAddressForm } from '#components/addresses/BillingAddressForm'
import { useState } from 'react'
import AddressInput from '#components/addresses/AddressInput'
import Errors from '#components/errors/Errors'
import AddressCountrySelector from '#components/addresses/AddressCountrySelector'
import AddressStateSelector from '#components/addresses/AddressStateSelector'
import SaveAddressesButton from '#components/addresses/SaveAddressesButton'
import { type Address as TAddress } from '@commercelayer/sdk'
import AddressesContainer from '#components/addresses/AddressesContainer'
import { AddressField } from '#components/addresses/AddressField'
import { Address } from '#components/addresses/Address'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

const setup: Meta = {
  title: 'Examples/Customer Account/Address form'
}

export default setup

type PartialAddress = Partial<TAddress>

export const SampleAddressForm: StoryFn<{ address: PartialAddress }> = (
  args
) => {
  const labelClassNames = 'block text-sm font-medium'
  const inputClassNames = 'border border-gray-300 p-2 rounded-md w-full'
  const errorClassNames = 'mt-1 text-sm text-red-600'

  const [address] = useState<PartialAddress>(args.address ?? {})

  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
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
              <label htmlFor='billing_address_city' className={labelClassNames}>
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
          <SaveAddressesButton
            label='Save Address'
            className='px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50'
            onClick={() => {
              alert('Address saved')
            }}
            addressId={address?.id}
          />
        </AddressesContainer>

        <section className='grid grid-cols-3 gap-4 mt-4'>
          <Address className='border p-4 grid gap-2 text-sm rounded-md'>
            <AddressField name='full_name' className='font-bold' />
            <AddressField name='full_address' />
            <AddressField
              className='cursor-pointer text-red-400 text-sm font-bold'
              type='delete'
              label='Delete'
              onClick={() => {}}
            />
          </Address>
        </section>
      </CustomerContainer>
    </CommerceLayer>
  )
}

SampleAddressForm.args = {}

export const MaterialUiAddressForm: StoryFn<{ address: PartialAddress }> = (
  args
) => {
  const errorClassNames = 'mt-1 text-sm text-red-600'
  const [address] = useState<PartialAddress>(args.address ?? {})

  return (
    <CommerceLayer accessToken='customer-access-token'>
      <CustomerContainer>
        <AddressesContainer>
          <BillingAddressForm
            errorClassName='outline-none !border-red-600 focus:!border-red-600'
            autoComplete='on'
            className='p-2'
          >
            <div className='mb-4'>
              <AddressInput
                name='billing_address_first_name'
                value={address?.first_name ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    label='First name'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_first_name'
                className={errorClassNames}
              />
            </div>

            <div className='mb-4'>
              <AddressInput
                name='billing_address_last_name'
                value={address?.last_name ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    label='Last name'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_last_name'
                className={errorClassNames}
              />
            </div>

            <div className='mb-4'>
              <AddressInput
                name='billing_address_line_1'
                type='text'
                value={address?.line_1 ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    label='Address'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_line_1'
                className={errorClassNames}
              />
            </div>

            <div className='mb-4'>
              <AddressInput
                name='billing_address_city'
                value={address?.city ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    label='City'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_city'
                className={errorClassNames}
              />
            </div>

            <div className='mb-4'>
              <AddressCountrySelector
                name='billing_address_country_code'
                value={address?.country_code ?? ''}
              >
                {(props) => {
                  // console.log('props', props)
                  return (
                    <TextField
                      name={props.name}
                      select
                      value={props.value}
                      label='Country'
                      variant='filled'
                      style={{ width: '100%' }}
                    >
                      {props.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )
                }}
              </AddressCountrySelector>
              <Errors
                resource='billing_address'
                field='billing_address_country_code'
                className={errorClassNames}
              />
            </div>

            <div className='mb-4'>
              <AddressInput
                name='billing_address_state_code'
                value={address?.state_code ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    label='State'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_state_code'
                className={errorClassNames}
              />
            </div>

            <div className='mb-4'>
              <AddressInput
                name='billing_address_zip_code'
                value={address?.zip_code ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    label='Zip code'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_zip_code'
                className={errorClassNames}
              />
            </div>

            <div className='mb-5'>
              <AddressInput
                name='billing_address_phone'
                value={address?.phone ?? ''}
              >
                {/* @ts-expect-error - element type not matched */}
                {(props) => (
                  <TextField
                    name={props.name}
                    onChange={props.onChange}
                    inputRef={props.parentRef}
                    type='tel'
                    label='Phone'
                    variant='filled'
                    style={{ width: '100%' }}
                  />
                )}
              </AddressInput>
              <Errors
                resource='billing_address'
                field='billing_address_phone'
                className={errorClassNames}
              />
            </div>
          </BillingAddressForm>
          <SaveAddressesButton
            label='Save Address'
            className='px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50'
            onClick={() => {
              alert('Address saved')
            }}
            addressId={address?.id}
          />
        </AddressesContainer>

        <section className='grid grid-cols-3 gap-4 mt-4'>
          <Address className='border p-4 grid gap-2 text-sm rounded-md'>
            <AddressField name='full_name' className='font-bold' />
            <AddressField name='full_address' />
            <AddressField
              className='cursor-pointer text-red-400 text-sm font-bold'
              type='delete'
              label='Delete'
              onClick={() => {}}
            />
          </Address>
        </section>
      </CustomerContainer>
    </CommerceLayer>
  )
}

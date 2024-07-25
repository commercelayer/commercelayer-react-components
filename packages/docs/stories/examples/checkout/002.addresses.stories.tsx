/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import { OrderStorage } from '../../_internals/OrderStorage'
import { CustomerContainer } from '#components/customers/CustomerContainer'
import { CustomerInput } from '#components/customers/CustomerInput'
import Errors from '#components/errors/Errors'
import { BillingAddressForm } from '#components/addresses/BillingAddressForm'
import { ShippingAddressForm } from '#components/addresses/ShippingAddressForm'
import { AddressesContainer } from '#components/addresses/AddressesContainer'
import { AddressInput } from '#components/addresses/AddressInput'
import { AddressCountrySelector } from '#components/addresses/AddressCountrySelector'
import { AddressStateSelector } from '#components/addresses/AddressStateSelector'
import { SaveAddressesButton } from '#components/addresses/SaveAddressesButton'
import { makeAddressWithRequired, persistKey } from './utils'
import { useMemo, useState } from 'react'
import { type Order } from '@commercelayer/sdk'

const setup: Meta = {
  title: 'Examples/Checkout Page/Addresses'
}

export default setup

const inputCss = 'border border-gray-300 p-2 rounded-md w-full'

export const CustomerAddresses: StoryFn = (args) => {
  const [order, setOrder] = useState<Order | null>(null)

  const billingAddress = useMemo(
    () => makeAddressWithRequired(order?.billing_address),
    [order?.billing_address]
  )

  // const shippingAddress = useMemo(
  //   () => makeAddressWithRequired(order?.shipping_address),
  //   [order?.shipping_address]
  // )

  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer fetchOrder={setOrder}>
          <section title='Checkout Address' className='max-w-xl'>
            <CustomerContainer isGuest>
              <AddressesContainer shipToDifferentAddress={false}>
                <div className='mb-4'>
                  <label htmlFor='customer_email'>Customer email</label>
                  <CustomerInput
                    id='customer_email'
                    className={inputCss}
                    placeholder='email'
                    errorClassName='border-red-600'
                    value={order?.customer_email ?? ''}
                  />
                  <Errors resource='orders' field='customer_email' />
                </div>

                {/*  Use `key` to re-render the BillingAddressForm once we have the order from  `fetchOrder`. */}
                {/*  When you are in your own project, you can retrieve the order before rendering the form. */}
                <BillingAddressForm key={billingAddress?.id}>
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_first_name'>
                        First name
                      </label>
                      <AddressInput
                        id='billing_address_first_name'
                        name='billing_address_first_name'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.first_name}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_first_name'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='billing_address_last_name'>
                        Last name
                      </label>
                      <AddressInput
                        id='billing_address_last_name'
                        name='billing_address_last_name'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.last_name}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_last_name'
                      />
                    </div>
                  </fieldset>

                  <div className='mb-4'>
                    <label htmlFor='billing_address_line_1'>
                      Address line 1
                    </label>
                    <AddressInput
                      id='billing_address_line_1'
                      name='billing_address_line_1'
                      type='text'
                      className={inputCss}
                      value={billingAddress?.line_1}
                    />
                    <Errors
                      resource='billing_address'
                      field='billing_address_line_1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label htmlFor='billing_address_line_2'>
                      Address line 2
                    </label>
                    <AddressInput
                      id='billing_address_line_2'
                      name='billing_address_line_2'
                      type='text'
                      className={inputCss}
                      value={billingAddress?.line_2}
                    />
                    <Errors
                      resource='billing_address'
                      field='billing_address_line_2'
                    />
                  </div>

                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_city'>City</label>
                      <AddressInput
                        id='billing_address_city'
                        name='billing_address_city'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.city}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_city'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='billing_address_country_code'>
                        Country
                      </label>
                      <AddressCountrySelector
                        data-cy='billing_address_country_code'
                        name='billing_address_country_code'
                        className={inputCss}
                        placeholder={{
                          value: '',
                          label: 'Country',
                          disabled: true
                        }}
                        value={billingAddress?.country_code}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_country_code'
                      />
                    </div>
                  </fieldset>

                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_state_code'>State</label>
                      <AddressStateSelector
                        id='billing_address_state_code'
                        name='billing_address_state_code'
                        placeholder={{
                          value: '',
                          label: 'Select a state',
                          disabled: true
                        }}
                        className={inputCss}
                        value={billingAddress?.state_code}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_state_code'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='billing_address_zip_code'>Zip Code</label>
                      <AddressInput
                        id='billing_address_zip_code'
                        name='billing_address_zip_code'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.zip_code}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_zip_code'
                      />
                    </div>
                  </fieldset>

                  <div className='mb-4'>
                    <label htmlFor='billing_address_phone'>Phone number</label>
                    <AddressInput
                      id='billing_address_phone'
                      name='billing_address_phone'
                      type='tel'
                      className={inputCss}
                      value={billingAddress?.phone}
                    />
                    <Errors
                      resource='billing_address'
                      field='billing_address_phone'
                    />
                  </div>
                </BillingAddressForm>

                <SaveAddressesButton
                  className='p-4 bg-black text-white rounded disabled:opacity-50'
                  label='Save address'
                  onClick={() => {
                    alert('Address updated')
                  }}
                />
              </AddressesContainer>
            </CustomerContainer>
          </section>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const CustomerInvertAddresses: StoryFn = (args) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)

  const shippingAddress = useMemo(
    () => makeAddressWithRequired(order?.shipping_address),
    [order?.shipping_address]
  )

  const billingAddress = useMemo(
    () => makeAddressWithRequired(order?.billing_address),
    [order?.billing_address]
  )

  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer fetchOrder={setOrder}>
          <section title='Checkout Address' className='max-w-xl'>
            <CustomerContainer isGuest>
              <AddressesContainer
                shipToDifferentAddress={shipToDifferentAddress}
                invertAddresses
              >
                <div className='mb-4'>
                  <label htmlFor='customer_email'>Customer email</label>
                  <CustomerInput
                    id='customer_email'
                    className={inputCss}
                    placeholder='email'
                    errorClassName='border-red-600'
                    value={order?.customer_email ?? ''}
                  />
                  <Errors resource='orders' field='customer_email' />
                </div>
                {/*  Use `key` to re-render the ShippingAddressForm once we have the order from  `fetchOrder`. */}
                {/*  When you are in your own project, you can retrieve the order before rendering the form. */}
                <ShippingAddressForm key={shippingAddress?.id}>
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='shipping_address_first_name'>
                        First name
                      </label>
                      <AddressInput
                        id='shipping_address_first_name'
                        name='shipping_address_first_name'
                        type='text'
                        className={inputCss}
                        value={shippingAddress?.first_name}
                      />
                      <Errors
                        resource='shipping_address'
                        field='shipping_address_first_name'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='shipping_address_last_name'>
                        Last name
                      </label>
                      <AddressInput
                        id='shipping_address_last_name'
                        name='shipping_address_last_name'
                        type='text'
                        className={inputCss}
                        value={shippingAddress?.last_name}
                      />
                      <Errors
                        resource='shipping_address'
                        field='shipping_address_last_name'
                      />
                    </div>
                  </fieldset>

                  <div className='mb-4'>
                    <label htmlFor='shipping_address_line_1'>
                      Address line 1
                    </label>
                    <AddressInput
                      id='shipping_address_line_1'
                      name='shipping_address_line_1'
                      type='text'
                      className={inputCss}
                      value={shippingAddress?.line_1}
                    />
                    <Errors
                      resource='shipping_address'
                      field='shipping_address_line_1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label htmlFor='shipping_address_line_2'>
                      Address line 2
                    </label>
                    <AddressInput
                      id='shipping_address_line_2'
                      name='shipping_address_line_2'
                      type='text'
                      className={inputCss}
                      value={shippingAddress?.line_2}
                    />
                    <Errors
                      resource='shipping_address'
                      field='shipping_address_line_2'
                    />
                  </div>

                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='shipping_address_city'>City</label>
                      <AddressInput
                        id='shipping_address_city'
                        name='shipping_address_city'
                        type='text'
                        className={inputCss}
                        value={shippingAddress?.city}
                      />
                      <Errors
                        resource='shipping_address'
                        field='shipping_address_city'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='shipping_address_country_code'>
                        Country
                      </label>
                      <AddressCountrySelector
                        data-cy='shipping_address_country_code'
                        name='shipping_address_country_code'
                        className={inputCss}
                        placeholder={{
                          value: '',
                          label: 'Country',
                          disabled: true
                        }}
                        value={shippingAddress?.country_code}
                      />
                      <Errors
                        resource='shipping_address'
                        field='shipping_address_country_code'
                      />
                    </div>
                  </fieldset>

                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='shipping_address_state_code'>State</label>
                      <AddressStateSelector
                        id='shipping_address_state_code'
                        name='shipping_address_state_code'
                        placeholder={{
                          value: '',
                          label: 'Select a state',
                          disabled: true
                        }}
                        className={inputCss}
                        value={shippingAddress?.state_code}
                      />
                      <Errors
                        resource='shipping_address'
                        field='shipping_address_state_code'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='shipping_address_zip_code'>
                        Zip Code
                      </label>
                      <AddressInput
                        id='shipping_address_zip_code'
                        name='shipping_address_zip_code'
                        type='text'
                        className={inputCss}
                        value={shippingAddress?.zip_code}
                      />
                      <Errors
                        resource='shipping_address'
                        field='shipping_address_zip_code'
                      />
                    </div>
                  </fieldset>

                  <div className='mb-4'>
                    <label htmlFor='shipping_address_phone'>Phone number</label>
                    <AddressInput
                      id='shipping_address_phone'
                      name='shipping_address_phone'
                      type='tel'
                      className={inputCss}
                      value={shippingAddress?.phone}
                    />
                    <Errors
                      resource='shipping_address'
                      field='shipping_address_phone'
                    />
                  </div>
                </ShippingAddressForm>
                <fieldset className='flex gap-4 w-full mb-4'>
                  <div className='flex-1'>
                    <input
                      type='checkbox'
                      id='ship_to_different_address'
                      checked={shipToDifferentAddress}
                      onChange={() => {
                        setShipToDifferentAddress(!shipToDifferentAddress)
                      }}
                    />
                    <label htmlFor='ship_to_different_address' className='ml-3'>
                      Bill to different address
                    </label>
                  </div>
                </fieldset>
                {!shipToDifferentAddress ? null : (
                  <BillingAddressForm key={billingAddress?.id}>
                    <fieldset className='flex gap-4 w-full mb-4'>
                      <div className='flex-1'>
                        <label htmlFor='billing_address_first_name'>
                          First name
                        </label>
                        <AddressInput
                          id='billing_address_first_name'
                          name='billing_address_first_name'
                          type='text'
                          className={inputCss}
                          value={billingAddress?.first_name}
                        />
                        <Errors
                          resource='billing_address'
                          field='billing_address_first_name'
                        />
                      </div>

                      <div className='flex-1'>
                        <label htmlFor='billing_address_last_name'>
                          Last name
                        </label>
                        <AddressInput
                          id='billing_address_last_name'
                          name='billing_address_last_name'
                          type='text'
                          className={inputCss}
                          value={billingAddress?.last_name}
                        />
                        <Errors
                          resource='billing_address'
                          field='billing_address_last_name'
                        />
                      </div>
                    </fieldset>

                    <div className='mb-4'>
                      <label htmlFor='billing_address_line_1'>
                        Address line 1
                      </label>
                      <AddressInput
                        id='billing_address_line_1'
                        name='billing_address_line_1'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.line_1}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_line_1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label htmlFor='billing_address_line_2'>
                        Address line 2
                      </label>
                      <AddressInput
                        id='billing_address_line_2'
                        name='billing_address_line_2'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.line_2}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_line_2'
                      />
                    </div>

                    <fieldset className='flex gap-4 w-full mb-4'>
                      <div className='flex-1'>
                        <label htmlFor='billing_address_city'>City</label>
                        <AddressInput
                          id='billing_address_city'
                          name='billing_address_city'
                          type='text'
                          className={inputCss}
                          value={billingAddress?.city}
                        />
                        <Errors
                          resource='billing_address'
                          field='billing_address_city'
                        />
                      </div>

                      <div className='flex-1'>
                        <label htmlFor='billing_address_country_code'>
                          Country
                        </label>
                        <AddressCountrySelector
                          data-cy='billing_address_country_code'
                          name='billing_address_country_code'
                          className={inputCss}
                          placeholder={{
                            value: '',
                            label: 'Country',
                            disabled: true
                          }}
                          value={billingAddress?.country_code}
                        />
                        <Errors
                          resource='billing_address'
                          field='billing_address_country_code'
                        />
                      </div>
                    </fieldset>

                    <fieldset className='flex gap-4 w-full mb-4'>
                      <div className='flex-1'>
                        <label htmlFor='billing_address_state_code'>
                          State
                        </label>
                        <AddressStateSelector
                          id='billing_address_state_code'
                          name='billing_address_state_code'
                          placeholder={{
                            value: '',
                            label: 'Select a state',
                            disabled: true
                          }}
                          className={inputCss}
                          value={billingAddress?.state_code}
                        />
                        <Errors
                          resource='billing_address'
                          field='billing_address_state_code'
                        />
                      </div>

                      <div className='flex-1'>
                        <label htmlFor='billing_address_zip_code'>
                          Zip Code
                        </label>
                        <AddressInput
                          id='billing_address_zip_code'
                          name='billing_address_zip_code'
                          type='text'
                          className={inputCss}
                          value={billingAddress?.zip_code}
                        />
                        <Errors
                          resource='billing_address'
                          field='billing_address_zip_code'
                        />
                      </div>
                    </fieldset>

                    <div className='mb-4'>
                      <label htmlFor='billing_address_phone'>
                        Phone number
                      </label>
                      <AddressInput
                        id='billing_address_phone'
                        name='billing_address_phone'
                        type='tel'
                        className={inputCss}
                        value={billingAddress?.phone}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_phone'
                      />
                    </div>
                  </BillingAddressForm>
                )}

                <SaveAddressesButton
                  className='p-4 bg-black text-white rounded disabled:opacity-50'
                  label='Save address'
                  onClick={() => {
                    alert('Address updated')
                  }}
                />
              </AddressesContainer>
            </CustomerContainer>
          </section>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const CustomerEmailSaveOnBlur: StoryFn = (args) => {
  const [order, setOrder] = useState<Order | null>(null)

  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer fetchOrder={setOrder}>
          <CustomerContainer isGuest>
            <div className='max-w-xl'>
              <label htmlFor='customer_email'>Customer email</label>
              <CustomerInput
                id='customer_email'
                className={inputCss}
                placeholder='email'
                saveOnBlur
                onBlur={(savedCustomerEmail) => {
                  alert(`Customer email saved: ${savedCustomerEmail}`)
                }}
                errorClassName='border-red-600'
                value={order?.customer_email ?? ''}
              />
              <Errors resource='orders' field='customer_email' />
            </div>
          </CustomerContainer>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const CustomErrorMessages: StoryFn = () => {
  const [order, setOrder] = useState<Order | null>(null)

  const billingAddress = useMemo(
    () => makeAddressWithRequired(order?.billing_address),
    [order?.billing_address]
  )
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer fetchOrder={setOrder}>
          <section title='Checkout Address' className='max-w-xl'>
            <CustomerContainer isGuest>
              <AddressesContainer shipToDifferentAddress={false}>
                <BillingAddressForm
                  errorClassName='border-red-600'
                  key={billingAddress?.id}
                  customFieldMessageError={(props) => {
                    const regex = /[a-zA-Z]+/g
                    const phoneRegex = /^\d+$/
                    // const textWithSpace = /^[a-zA-Z0-9\s]{1,20}$/
                    console.log('props', props)
                    if (
                      props.field === 'billing_address_first_name' &&
                      !regex.test(props.value)
                    ) {
                      return 'Validation error - only characters are allowed - this is a custom message'
                    }
                    if (props.field === 'billing_address_metadata_phone') {
                      return props.value === ''
                        ? null
                        : !phoneRegex.test(props.value)
                          ? 'Validation error - only numbers are allowed - this is a custom message'
                          : null
                    }
                    if (props.field === 'billing_address_country_code') {
                      const state = props.values?.state_code as string
                      console.log('state', state)
                      console.log('props.value', props.value)
                      if (
                        ['US', 'CN', 'JP', 'AU', 'CA'].includes(props.value)
                      ) {
                        return [
                          {
                            field: 'billing_address_state_code',
                            value: undefined,
                            isValid: false,
                            message: 'State is required for this country'
                          }
                        ]
                      } else {
                        return [
                          {
                            field: 'billing_address_state_code',
                            value: state,
                            isValid: true
                          }
                        ]
                      }
                    }
                    return null
                  }}
                >
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_first_name'>
                        First name
                      </label>
                      <AddressInput
                        id='billing_address_first_name'
                        name='billing_address_first_name'
                        type='text'
                        className={inputCss}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_first_name'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='billing_address_last_name'>
                        Last name
                      </label>
                      <AddressInput
                        id='billing_address_last_name'
                        name='billing_address_last_name'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.last_name}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_last_name'
                      />
                    </div>
                  </fieldset>
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_metadata_phone'>
                        Phone number (metadata field - not required)
                      </label>
                      <AddressInput
                        id='billing_address_metadata_phone'
                        name='billing_address_metadata_phone'
                        type='text'
                        className={inputCss}
                        required={false}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_metadata_phone'
                      />
                    </div>
                  </fieldset>
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_line_1'>Address</label>
                      <AddressInput
                        id='billing_address_line_1'
                        name='billing_address_line_1'
                        type='text'
                        className={inputCss}
                        required={false}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_line_1'
                      />
                    </div>
                  </fieldset>
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_city'>City</label>
                      <AddressInput
                        id='billing_address_city'
                        name='billing_address_city'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.city}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_city'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='billing_address_country_code'>
                        Country
                      </label>
                      <AddressCountrySelector
                        data-cy='billing_address_country_code'
                        name='billing_address_country_code'
                        className={inputCss}
                        placeholder={{
                          value: '',
                          label: 'Country',
                          disabled: true
                        }}
                        value={billingAddress?.country_code}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_country_code'
                      />
                    </div>
                  </fieldset>
                  <fieldset className='flex gap-4 w-full mb-4'>
                    <div className='flex-1'>
                      <label htmlFor='billing_address_state_code'>State</label>
                      <AddressStateSelector
                        id='billing_address_state_code'
                        name='billing_address_state_code'
                        placeholder={{
                          value: '',
                          label: 'Select a state',
                          disabled: true
                        }}
                        className={inputCss}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_state_code'
                      />
                    </div>

                    <div className='flex-1'>
                      <label htmlFor='billing_address_zip_code'>Zip Code</label>
                      <AddressInput
                        id='billing_address_zip_code'
                        name='billing_address_zip_code'
                        type='text'
                        className={inputCss}
                        value={billingAddress?.zip_code}
                      />
                      <Errors
                        resource='billing_address'
                        field='billing_address_zip_code'
                      />
                    </div>
                  </fieldset>
                </BillingAddressForm>
              </AddressesContainer>
            </CustomerContainer>
          </section>
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

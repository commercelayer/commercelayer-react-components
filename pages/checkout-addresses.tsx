import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import CommerceLayer from '../src/components/CommerceLayer'
import { Nav } from '.'
import OrderContainer from '../src/components/OrderContainer'
import AddressesContainer from 'components/AddressesContainer'
import BillingAddress from 'components/BillingAddress'
import AddressInput from 'components/AddressInput'
import Head from 'next/head'
import Errors from 'components/Errors'
import AddressCountrySelector from 'components/AddressCountrySelector'
import AddressButton from 'components/AddressButton'
import ShippingAddress from 'components/ShippingAddress'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'

export default function Main() {
  const [token, setToken] = useState('')
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getSalesChannelToken({
        clientId:
          '48ee4802f8227b04951645a9b7c8af1e3943efec7edd1dcfd04b5661bf1da5db',
        endpoint,
        scope: 'market:58',
      })
      if (token) setToken(token.accessToken)
    }
    getToken()
  }, [])
  const messages: any = [
    {
      code: 'EMPTY_ERROR',
      resource: 'billingAddress',
      field: 'firstName',
      message: `Can't be blank`,
    },
    {
      code: 'VALIDATION_ERROR',
      resource: 'billingAddress',
      field: 'email',
      message: `Must be valid email`,
    },
  ]
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId="JwXQehvvyP">
            <AddressesContainer shipToDifferentAddress={shipToDifferentAddress}>
              <h3 className="text-lg font-medium leading-6 text-gray-900 bg-gray-50 p-2 mb-3 shadow rounded-sm">
                Billing Address
              </h3>
              <BillingAddress autoComplete="on" className="p-2">
                <div>
                  <label
                    htmlFor="customer_email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      value="ale"
                      data-cy="input_customer_email"
                      name="customer_email"
                      type="email"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_customer_email"
                      resource="billingAddress"
                      field="customer_email"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_first_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_first_name"
                      name="billing_address_first_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="First name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_first_name"
                      resource="billingAddress"
                      field="billing_address_first_name"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_last_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_last_name"
                      name="billing_address_last_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Last name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_last_name"
                      resource="billingAddress"
                      field="billing_address_last_name"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_line_1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_line_1"
                      name="billing_address_line_1"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Address"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_line_1"
                      resource="billingAddress"
                      field="billing_address_line_1"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_city"
                      name="billing_address_city"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="City"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_city"
                      resource="billingAddress"
                      field="billing_address_city"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_country_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <div className="mt-1">
                    <AddressCountrySelector
                      data-cy="input_billing_address_country_code"
                      name="billing_address_country_code"
                      value="IT"
                      placeholder={{
                        value: '',
                        label: 'Country',
                        disabled: true,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_country_code"
                      resource="billingAddress"
                      field="billing_address_country_code"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_state_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_state_code"
                      name="billing_address_state_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="State"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_state_code"
                      resource="billingAddress"
                      field="billing_address_state_code"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_zip_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Zip code
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_zip_code"
                      name="billing_address_zip_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Zip code"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_zip_code"
                      resource="billingAddress"
                      field="billing_address_zip_code"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="billing_address_phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_billing_address_phone"
                      name="billing_address_phone"
                      type="tel"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Phone"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_billing_address_phone"
                      resource="billingAddress"
                      field="billing_address_phone"
                      messages={messages}
                    />
                  </p>
                </div>
              </BillingAddress>
              <div className="flex p-2">
                <button
                  data-cy="button-ship-to-different-address"
                  data-status={shipToDifferentAddress}
                  type="button"
                  aria-pressed="false"
                  className={`${
                    shipToDifferentAddress ? 'bg-blue-500' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  onClick={() =>
                    setShipToDifferentAddress(!shipToDifferentAddress)
                  }
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      shipToDifferentAddress ? 'translate-x-5' : 'translate-x-0'
                    } inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  ></span>
                </button>
                <p className="ml-5">Ship to different address</p>
              </div>
              <ShippingAddress
                autoComplete="on"
                className={shipToDifferentAddress ? `block p-2` : `hidden`}
              >
                <div>
                  <label
                    htmlFor="shipping_address_first_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_shipping_address_first_name"
                      name="shipping_address_first_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="First name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_first_name"
                      resource="shippingAddress"
                      field="shipping_address_first_name"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_last_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_shipping_address_last_name"
                      name="shipping_address_last_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Last name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_last_name"
                      resource="shippingAddress"
                      field="shipping_address_last_name"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_line_1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_shipping_address_line_1"
                      name="shipping_address_line_1"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Address"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_line_1"
                      resource="shippingAddress"
                      field="shipping_address_line_1"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_shipping_address_city"
                      name="shipping_address_city"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="City"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="input_shipping_address_city"
                      resource="shippingAddress"
                      field="shipping_address_city"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_country_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <div className="mt-1">
                    <AddressCountrySelector
                      data-cy="input_shipping_address_country_code"
                      name="shipping_address_country_code"
                      placeholder={{
                        value: '',
                        label: 'Country',
                        disabled: true,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_country_code"
                      resource="shippingAddress"
                      field="shipping_address_country_code"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_state_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_shipping_address_state_code"
                      name="shipping_address_state_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="State"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_state_code"
                      resource="shippingAddress"
                      field="shipping_address_state_code"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_zip_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Zip code
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="input_shipping_address_zip_code"
                      name="shipping_address_zip_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Zip code"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_zip_code"
                      resource="shippingAddress"
                      field="shipping_address_zip_code"
                      messages={messages}
                    />
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="shipping_address_phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      value="38974329"
                      data-cy="input_shipping_address_phone"
                      name="shipping_address_phone"
                      type="tel"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Phone"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="error_shipping_address_phone"
                      resource="shippingAddress"
                      field="shipping_address_phone"
                      messages={messages}
                    />
                  </p>
                </div>
              </ShippingAddress>
              <div className="mt-5 p-2">
                <AddressButton
                  data-cy="save-addresses-button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </AddressesContainer>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

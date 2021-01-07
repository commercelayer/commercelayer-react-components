import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  Errors,
  AddressesContainer,
  BillingAddress,
  AddressInput,
  AddressCountrySelector,
  SaveAddressesButton,
  ShippingAddress,
  CustomerContainer,
  CustomerInput,
  SaveCustomerButton,
} from '@commercelayer/react-components'
import { Order } from '@commercelayer/js-sdk'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'
const orderId = 'JwXQehvvyP'

export default function Main() {
  const [token, setToken] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [saveOnBlur, setSaveOnBlur] = useState(false)
  const [billingAddress, setBillingAddress] = useState({})
  const [shippingAddress, setShippingAddress] = useState({})
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
  const handleOnSave = async () => {
    if (token) {
      const config = { accessToken: token, endpoint }
      try {
        const order = await Order.withCredentials(config)
          .select('customerEmail')
          .find(orderId)
        setCustomerEmail(order.customerEmail)
      } catch (error) {
        console.error(error)
      }
    }
  }
  const handleClick = async () => {
    if (token) {
      const config = { accessToken: token, endpoint }
      try {
        const order = await Order.withCredentials(config)
          .includes('billingAddress', 'shippingAddress')
          .find(orderId)
        const billing: any = order.billingAddress()
        const shipping: any = order.shippingAddress()
        setBillingAddress({
          firstName: billing.firstName,
          lastName: billing.lastName,
          line1: billing.line1,
          city: billing.city,
          countryCode: billing.countryCode,
          stateCode: billing.stateCode,
          zipCode: billing.zipCode,
          phone: billing.phone,
        })
        setShippingAddress({
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          line1: shipping.line1,
          city: shipping.city,
          countryCode: shipping.countryCode,
          stateCode: shipping.stateCode,
          zipCode: shipping.zipCode,
          phone: shipping.phone,
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId}>
            <div className="flex p-2">
              <button
                data-cy="save-on-blur-button"
                data-status={saveOnBlur}
                type="button"
                aria-pressed="false"
                className={`${
                  saveOnBlur ? 'bg-blue-500' : 'bg-gray-200'
                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                onClick={() => setSaveOnBlur(!saveOnBlur)}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`${
                    saveOnBlur ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                ></span>
              </button>
              <p className="ml-5">Save onBlur</p>
            </div>
            <CustomerContainer saveOnBlur={saveOnBlur} onSave={handleOnSave}>
              <div>
                <label
                  htmlFor="customer_email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer email
                </label>
                <div className="mt-1">
                  <CustomerInput
                    data-cy="customer_email"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Email"
                  />
                </div>
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  <Errors
                    data-cy="customer_email_error"
                    resource="order"
                    field="customer_email"
                    messages={messages}
                  />
                </p>
              </div>
              <div className={saveOnBlur ? 'hidden' : ''}>
                <div className="mt-1">
                  <SaveCustomerButton
                    data-cy="save-customer-button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <div className="mt-1">
                  <pre data-cy="current-customer-email">{`Current customer email: ${JSON.stringify(
                    customerEmail,
                    null,
                    2
                  )}`}</pre>
                </div>
              </div>
            </CustomerContainer>
            <AddressesContainer shipToDifferentAddress={shipToDifferentAddress}>
              <h3 className="text-lg font-medium leading-6 text-gray-900 bg-gray-50 p-2 my-3 shadow rounded-sm">
                Billing Address
              </h3>
              <BillingAddress autoComplete="on" className="p-2">
                <div>
                  <label
                    htmlFor="billing_address_first_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="mt-1">
                    <AddressInput
                      data-cy="billing_address_first_name"
                      name="billing_address_first_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="First name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_first_name_error"
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
                      data-cy="billing_address_last_name"
                      name="billing_address_last_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Last name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_last_name_error"
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
                      data-cy="billing_address_line_1"
                      name="billing_address_line_1"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Address"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_line_1_error"
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
                      data-cy="billing_address_city"
                      name="billing_address_city"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="City"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_city_error"
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
                      data-cy="billing_address_country_code"
                      name="billing_address_country_code"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                      data-cy="billing_address_country_code_error"
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
                      data-cy="billing_address_state_code"
                      name="billing_address_state_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="State"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_state_code_error"
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
                      data-cy="billing_address_zip_code"
                      name="billing_address_zip_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Zip code"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_zip_code_error"
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
                      data-cy="billing_address_phone"
                      name="billing_address_phone"
                      type="tel"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Phone"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="billing_address_phone_error"
                      resource="billingAddress"
                      field="billing_address_phone"
                      messages={messages}
                    />
                  </p>
                </div>
              </BillingAddress>
              <div className="flex p-2">
                <button
                  data-cy="ship-to-different-address-button"
                  data-status={shipToDifferentAddress}
                  type="button"
                  aria-pressed="false"
                  className={`${
                    shipToDifferentAddress ? 'bg-blue-500' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
                      data-cy="shipping_address_first_name"
                      name="shipping_address_first_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="First name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_first_name_error"
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
                      data-cy="shipping_address_last_name"
                      name="shipping_address_last_name"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Last name"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_last_name_error"
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
                      data-cy="shipping_address_line_1"
                      name="shipping_address_line_1"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Address"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_line_1_error"
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
                      data-cy="shipping_address_city"
                      name="shipping_address_city"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="City"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_city_error"
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
                      data-cy="shipping_address_country_code"
                      name="shipping_address_country_code"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      placeholder={{
                        value: '',
                        label: 'Country',
                        disabled: true,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_country_code_error"
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
                      data-cy="shipping_address_state_code"
                      name="shipping_address_state_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="State"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_state_code_error"
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
                      data-cy="shipping_address_zip_code"
                      name="shipping_address_zip_code"
                      type="text"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Zip code"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_zip_code_error"
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
                      data-cy="shipping_address_phone"
                      name="shipping_address_phone"
                      type="tel"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Phone"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    <Errors
                      data-cy="shipping_address_phone_error"
                      resource="shippingAddress"
                      field="shipping_address_phone"
                      messages={messages}
                    />
                  </p>
                </div>
              </ShippingAddress>
              <div className="mt-5 p-2">
                <SaveAddressesButton
                  data-cy="save-addresses-button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={handleClick}
                />
              </div>
            </AddressesContainer>
            <div className="mt-5">
              <pre data-cy="current-billing-address">{`Current billing address: ${JSON.stringify(
                billingAddress,
                null,
                2
              )}`}</pre>
              <pre data-cy="current-shipping-address">{`Current shipping address: ${JSON.stringify(
                shippingAddress,
                null,
                2
              )}`}</pre>
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

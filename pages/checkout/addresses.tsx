import React, { useState, useEffect, Fragment } from 'react'
import { getSalesChannelToken } from '@commercelayer/js-auth'
import { Nav } from '..'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  Errors,
  AddressesContainer,
  BillingAddressForm,
  AddressInput,
  AddressCountrySelector,
  SaveAddressesButton,
  ShippingAddressForm,
  CustomerContainer,
  CustomerInput,
  SaveCustomerButton,
  AddressStateSelector,
} from 'packages/react-components/src'
import { useRouter } from 'next/router'
import getSdk from '#utils/getSdk'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string

let orderId = ''

export default function Main() {
  const [token, setToken] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [saveOnBlur, setSaveOnBlur] = useState(false)
  const [isBusiness, setIsBusiness] = useState(false)
  const [hideAddress, setHideAddress] = useState(false)
  const [billingAddress, setBillingAddress] = useState({})
  const [shippingAddress, setShippingAddress] = useState({})
  const { query } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
  }
  const getOrder = async () => {
    if (token && orderId) {
      const config = { accessToken: token, endpoint }
      const sdk = getSdk(config)
      try {
        const order = await sdk.orders.retrieve(orderId, {
          include: ['billing_address', 'shipping_address'],
        })
        if (order?.billing_address) {
          setBillingAddress(order.billing_address)
        }
        if (order.shipping_address) {
          setShippingAddress(order.shipping_address)
        }
        if (order.customer_email) {
          setCustomerEmail(order.customer_email)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getSalesChannelToken({
        clientId,
        endpoint,
        scope,
      })
      if (token) setToken(token.accessToken)
    }
    if (!token) {
      getToken()
    } else {
      getOrder()
    }
  }, [token])
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
      try {
        await getOrder()
      } catch (error) {
        console.error(error)
      }
    }
  }
  const handleClick = async () => {
    await getOrder()
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
            <CustomerContainer isGuest>
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
                    saveOnBlur={saveOnBlur}
                    onBlur={handleOnSave}
                    errorClassName="border-red-600 focus:ring-red-600 focus:border-red-600"
                  />
                </div>
                <p className="mt-2 text-sm text-red-600">
                  <Errors
                    data-cy="customer_email_error"
                    resource="orders"
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
                    onClick={handleOnSave}
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
            {hideAddress ? null : (
              <AddressesContainer
                shipToDifferentAddress={shipToDifferentAddress}
                isBusiness={isBusiness}
              >
                <h3 className="text-lg font-medium leading-6 text-gray-900 bg-gray-50 p-2 my-3 shadow rounded-sm">
                  Billing Address
                </h3>
                <div className="flex p-2">
                  <button
                    data-cy="save-on-blur-button"
                    data-status={isBusiness}
                    type="button"
                    aria-pressed="false"
                    className={`${
                      isBusiness ? 'bg-blue-500' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => setIsBusiness(!isBusiness)}
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      aria-hidden="true"
                      className={`${
                        isBusiness ? 'translate-x-5' : 'translate-x-0'
                      } inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    ></span>
                  </button>
                  <p className="ml-5">Business address</p>
                </div>
                <BillingAddressForm
                  errorClassName="border-red-600 focus:ring-red-600 focus:border-red-600"
                  autoComplete="on"
                  className="p-2"
                >
                  {!isBusiness && (
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
                      <p className="mt-2 text-sm text-red-600">
                        <Errors
                          data-cy="billing_address_first_name_error"
                          resource="billing_address"
                          field="billing_address_first_name"
                          messages={messages}
                        />
                      </p>
                    </div>
                  )}
                  {isBusiness && (
                    <div>
                      <label
                        htmlFor="billing_address_company"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Company name
                      </label>
                      <div className="mt-1">
                        <AddressInput
                          data-cy="billing_address_company"
                          name="billing_address_company"
                          type="text"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Company name"
                        />
                      </div>
                      <p className="mt-2 text-sm text-red-600">
                        <Errors
                          data-cy="billing_address_company_error"
                          resource="billing_address"
                          field="billing_address_company"
                          messages={messages}
                        />
                      </p>
                    </div>
                  )}
                  {!isBusiness && (
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
                      <p className="mt-2 text-sm text-red-600">
                        <Errors
                          data-cy="billing_address_last_name_error"
                          resource="billing_address"
                          field="billing_address_last_name"
                          messages={messages}
                        />
                      </p>
                    </div>
                  )}
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_line_1_error"
                        resource="billing_address"
                        field="billing_address_line_1"
                        messages={messages}
                      />
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="billing_address_line_2"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address line 2
                    </label>
                    <div className="mt-1">
                      <AddressInput
                        data-cy="billing_address_line_2"
                        name="billing_address_line_2"
                        type="text"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Address"
                        required={false}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_line_2_error"
                        resource="billing_address"
                        field="billing_address_line_2"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_city_error"
                        resource="billing_address"
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
                        placeholder={{
                          value: '',
                          label: 'Country',
                          disabled: true,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_country_code_error"
                        resource="billing_address"
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
                      <AddressStateSelector
                        data-cy="billing_address_state_code"
                        name="billing_address_state_code"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        inputClassName="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        placeholder={{
                          value: '',
                          label: 'Select a state',
                          disabled: true,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_state_code_error"
                        resource="billing_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_zip_code_error"
                        resource="billing_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_phone_error"
                        resource="billing_address"
                        field="billing_address_phone"
                        messages={messages}
                      />
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="billing_address_billing_info"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Billing info
                    </label>
                    <div className="mt-1">
                      <AddressInput
                        data-cy="billing_address_billing_info"
                        name="billing_address_billing_info"
                        type="text"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Billing info"
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="billing_address_billing_info"
                        resource="billing_address"
                        field="billing_address_billing_info"
                        messages={messages}
                      />
                    </p>
                  </div>
                  <div className="flex flex-row-reverse justify-end">
                    <label
                      htmlFor="billing_address_save_to_customer_book"
                      className="block text-sm font-medium text-gray-700 ml-3 self-end"
                    >
                      Save address on your book
                    </label>
                    <div className="mt-1">
                      <AddressInput
                        data-cy="billing_address_save_to_customer_book"
                        name="billing_address_save_to_customer_book"
                        type="checkbox"
                        className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                        required={false}
                      />
                    </div>
                  </div>
                </BillingAddressForm>
                <div className="mt-5 flex p-2">
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
                        shipToDifferentAddress
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      } inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    ></span>
                  </button>
                  <p className="ml-5">Ship to different address</p>
                </div>
                <ShippingAddressForm
                  errorClassName="border-red-600 focus:ring-red-600 focus:border-red-600"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_first_name_error"
                        resource="shipping_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_last_name_error"
                        resource="shipping_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_line_1_error"
                        resource="shipping_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_city_error"
                        resource="shipping_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_country_code_error"
                        resource="shipping_address"
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
                      <AddressStateSelector
                        data-cy="shipping_address_state_code"
                        name="shipping_address_state_code"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={{
                          value: '',
                          label: 'Select a state',
                          disabled: true,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_state_code_error"
                        resource="shipping_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_zip_code_error"
                        resource="shipping_address"
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
                    <p className="mt-2 text-sm text-red-600">
                      <Errors
                        data-cy="shipping_address_phone_error"
                        resource="shipping_address"
                        field="shipping_address_phone"
                        messages={messages}
                      />
                    </p>
                  </div>
                  <div className="flex flex-row-reverse justify-end">
                    <label
                      htmlFor="shipping_address_save_to_customer_book"
                      className="block text-sm font-medium text-gray-700 ml-3 self-end"
                    >
                      Save address on your book
                    </label>
                    <div className="mt-1">
                      <AddressInput
                        data-cy="shipping_address_save_to_customer_book"
                        name="shipping_address_save_to_customer_book"
                        type="checkbox"
                        className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                        required={false}
                      />
                    </div>
                  </div>
                </ShippingAddressForm>
                <div className="mt-5 p-2">
                  <SaveAddressesButton
                    data-cy="save-addresses-button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={handleClick}
                  />
                </div>
              </AddressesContainer>
            )}

            <button
              onClick={() => setHideAddress(!hideAddress)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Hide address
            </button>
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

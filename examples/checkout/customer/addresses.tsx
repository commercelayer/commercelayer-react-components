import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import Head from 'next/head'
import {
  CommerceLayer,
  OrderContainer,
  Errors,
  AddressesContainer,
  BillingAddressForm,
  BillingAddressContainer,
  AddressInput,
  AddressCountrySelector,
  SaveAddressesButton,
  ShippingAddressForm,
  CustomerContainer,
  Address,
  AddressField,
  ShippingAddressContainer,
  // AddressCardsTemplate,
} from 'packages/react-components/src'
import { useRouter } from 'next/router'
import getSdk from '#utils/getSdk'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string
const username = process.env.NEXT_PUBLIC_USERNAME as string
const password = process.env.NEXT_PUBLIC_PASSWORD as string
let orderId = 'PDerhJplRp'

const NestedInput = ({ value }: any) => {
  return (
    <AddressInput
      data-cy="billing_address_first_name"
      name="billing_address_first_name"
      type="text"
      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
      placeholder="First name"
      value={value}
    />
  )
}

// const CustomAddressCards = (props: AddressCardsTemplate) => {
//   const { customerAddresses, AddressProvider } = props
//   return customerAddresses.map((address, k) => {
//     return (
//       <AddressProvider value={{ address }}>
//         <div>
//           <AddressField name="first_name" />
//         </div>
//         <div className="font-bold">
//           <AddressField name="last_name" />
//         </div>
//         <div>
//           <AddressField name="full_address" />
//         </div>
//       </AddressProvider>
//     )
//   })
// }

export default function Main() {
  const [token, setToken] = useState('')
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false)
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false)
  const [billingFirstName, setBillingFirstName] = useState('')
  const [billingAddress, setBillingAddress] = useState({})
  const [shippingAddress, setShippingAddress] = useState({})
  const { query, pathname, push } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
  }
  const getOrder = async () => {
    if (token) {
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
      } catch (error) {
        console.error(error)
      }
    }
  }
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getCustomerToken(
        {
          clientId,
          endpoint,
          scope,
        },
        {
          username,
          password,
        }
      )
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
  const handleClick = async () => {
    await getOrder()
  }
  const handleShowBillingForm = () => {
    setShowBillingAddressForm(!showBillingAddressForm)
    setBillingFirstName('')
  }
  const handleShowShippingForm = () =>
    setShowShippingAddressForm(!showShippingAddressForm)
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId}>
            <CustomerContainer>
              <AddressesContainer
                shipToDifferentAddress={shipToDifferentAddress}
              >
                <h2 className="p-2 font-semibold text-2xl">Billing Address</h2>
                <div>
                  <BillingAddressContainer>
                    <Address
                      className="w-1/2 p-2 border cursor-pointer rounded hover:border-blue-500 m-2 shadow-sm"
                      selectedClassName="border-blue-500"
                      data-cy="customer-billing-address"
                      deselect={showBillingAddressForm}
                      onSelect={() =>
                        showBillingAddressForm &&
                        setShowBillingAddressForm(false)
                      }
                    >
                      {/* {(props) => <CustomAddressCards {...props} />} */}
                      <AddressField name="first_name" />
                      <div className="font-bold">
                        <AddressField name="last_name" className="ml-1" />
                      </div>
                      <div>
                        <AddressField name="full_address" />
                      </div>
                    </Address>
                  </BillingAddressContainer>
                </div>
                <div className="flex p-2 my-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleShowBillingForm}
                    data-cy="add-new-billing-address"
                  >
                    Add new address
                    <svg
                      className="ml-2 -mr-1 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </button>
                </div>
                <div className={`${showBillingAddressForm ? '' : 'hidden'}`}>
                  <BillingAddressForm
                    autoComplete="on"
                    className="p-2"
                    reset={!showBillingAddressForm}
                  >
                    <div>
                      <label
                        htmlFor="billing_address_first_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First name
                      </label>
                      <div className="mt-1">
                        <NestedInput value={billingFirstName} />
                        {/* <AddressInput
                          data-cy="billing_address_first_name"
                          name="billing_address_first_name"
                          type="text"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="First name"
                          value={billingFirstName}
                        /> */}
                      </div>
                      <p className="mt-2 text-sm text-red-600" id="email-error">
                        <Errors
                          data-cy="billing_address_first_name_error"
                          resource="billing_address"
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
                          resource="billing_address"
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
                          resource="billing_address"
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
                      <p className="mt-2 text-sm text-red-600" id="email-error">
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
                      <p className="mt-2 text-sm text-red-600" id="email-error">
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
                      <p className="mt-2 text-sm text-red-600" id="email-error">
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
                      <p className="mt-2 text-sm text-red-600" id="email-error">
                        <Errors
                          data-cy="billing_address_billing_info_error"
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
                </div>
                <div className="flex p-2 my-2">
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
                <div className={`${!shipToDifferentAddress ? 'hidden' : ''}`}>
                  <h2 className="p-2 font-semibold text-2xl">
                    Shipping Address
                  </h2>
                  <div className="flex">
                    <ShippingAddressContainer>
                      <Address
                        data-cy="customer-shipping-address"
                        className="w-1/2 p-2 border cursor-pointer rounded hover:border-blue-500 m-2 shadow-sm"
                        selectedClassName={'border-blue-500'}
                        disabledClassName={'opacity-50 cursor-not-allowed'}
                        deselect={showShippingAddressForm}
                        onSelect={() =>
                          showShippingAddressForm &&
                          setShowShippingAddressForm(false)
                        }
                      >
                        <div className="flex font-bold">
                          <AddressField name="first_name" />
                          <AddressField name="last_name" className="ml-1" />
                        </div>
                        <div>
                          <AddressField name="full_address" />
                        </div>
                      </Address>
                    </ShippingAddressContainer>
                  </div>
                  <div className="flex p-2 my-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={handleShowShippingForm}
                      data-cy="add-new-shipping-address"
                    >
                      Add new address
                      <svg
                        className="ml-2 -mr-1 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </button>
                  </div>
                  <div
                    className={`${!showShippingAddressForm ? 'hidden' : ''}`}
                  >
                    <ShippingAddressForm
                      autoComplete="on"
                      className={
                        shipToDifferentAddress ? `block p-2` : `hidden`
                      }
                      reset={!showShippingAddressForm}
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                          <AddressInput
                            data-cy="shipping_address_state_code"
                            name="shipping_address_state_code"
                            type="text"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="State"
                          />
                        </div>
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="email-error"
                        >
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
                    </ShippingAddressForm>
                  </div>
                </div>
                <div className="my-5 p-2">
                  <SaveAddressesButton
                    data-cy="save-addresses-button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={handleClick}
                  />
                </div>
              </AddressesContainer>
            </CustomerContainer>
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
            <div className="mt-5">
              <h2 className="font-semibold text-2xl">
                Current Billing Address
              </h2>
              <Address addresses={[billingAddress as any]}>
                <div className="flex font-bold">
                  <AddressField name="first_name" />
                  <AddressField name="last_name" className="ml-1" />
                </div>
                <div>
                  <AddressField name="line_1" />
                  <AddressField name="country_code" />
                  <AddressField name="zip_code" />
                  <AddressField name="phone" />
                </div>
              </Address>
            </div>
            <div className="mt-5">
              <h2 className="font-semibold text-2xl">
                Current Shipping Address
              </h2>
              <Address addresses={[shippingAddress as any]}>
                <div className="flex font-bold">
                  <AddressField name="first_name" />
                  <AddressField name="last_name" className="ml-1" />
                </div>
                <div>
                  <AddressField name="line_1" />
                  <AddressField name="country_code" />
                  <AddressField name="zip_code" />
                  <AddressField name="phone" />
                </div>
              </Address>
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

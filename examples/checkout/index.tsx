import { useState, useEffect, Fragment } from 'react'
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
  LineItemsContainer,
  LineItem,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  LineItemAmount,
  SubTotalAmount,
  LineItemsCount,
  TotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
  GiftCardAmount,
  Shipment,
  ShipmentsContainer,
  ShippingMethodName,
  ShippingMethod,
  ShippingMethodRadioButton,
  ShippingMethodPrice,
  StockTransfer,
  StockTransferField,
  DeliveryLeadTime,
  ShipmentField,
  PaymentMethod,
  PaymentMethodName,
  PaymentMethodPrice,
  PaymentMethodRadioButton,
  PaymentMethodsContainer,
  PaymentSource,
  PaymentSourceBrandIcon,
  PaymentSourceBrandName,
  PaymentSourceDetail,
  PaymentSourceEditButton,
  PlaceOrderButton,
  PlaceOrderContainer,
  PrivacyAndTermsCheckbox,
  PaymentMethodAmount,
} from 'packages/react-components/src'
import { useRouter } from 'next/router'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
const scope = process.env.NEXT_PUBLIC_MARKET_ID as string

let orderId = ''
let paypalPayerId = ''
let paypalReturnUrl = ''

export default function Main() {
  const [token, setToken] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [saveOnBlur, setSaveOnBlur] = useState(false)
  const [billingAddress, setBillingAddress] = useState({})
  const [shippingAddress, setShippingAddress] = useState({})
  const { query } = useRouter()
  if (query.orderId) {
    orderId = query.orderId as string
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
    // if (token) {
    //   const config = { accessToken: token, endpoint }
    //   try {
    //     const order = await Order.withCredentials(config)
    //       .select('customerEmail')
    //       .find(orderId)
    //     setCustomerEmail(order.customerEmail)
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
  }
  const handleClick = async () => {
    // if (token) {
    //   const config = { accessToken: token, endpoint }
    //   try {
    //     const order = await Order.withCredentials(config)
    //       .includes('billingAddress', 'shippingAddress')
    //       .find(orderId)
    //     const billing: any = order.billingAddress()
    //     const shipping: any = order.shippingAddress()
    //     if (billing) {
    //       setBillingAddress({
    //         firstName: billing.firstName,
    //         lastName: billing.lastName,
    //         line1: billing.line1,
    //         city: billing.city,
    //         countryCode: billing.countryCode,
    //         stateCode: billing.stateCode,
    //         zipCode: billing.zipCode,
    //         phone: billing.phone,
    //       })
    //     }
    //     if (shipping) {
    //       setShippingAddress({
    //         firstName: shipping.firstName,
    //         lastName: shipping.lastName,
    //         line1: shipping.line1,
    //         city: shipping.city,
    //         countryCode: shipping.countryCode,
    //         stateCode: shipping.stateCode,
    //         zipCode: shipping.zipCode,
    //         phone: shipping.phone,
    //       })
    //     }
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
  }
  const handleChange = () => null
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
                <p className="mt-2 text-sm text-red-600" id="email-error">
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
            <AddressesContainer shipToDifferentAddress={shipToDifferentAddress}>
              <h3 className="text-lg font-medium leading-6 text-gray-900 bg-gray-50 p-2 my-3 shadow rounded-sm">
                Billing Address
              </h3>
              <BillingAddressForm
                errorClassName="border-red-600 focus:ring-red-600 focus:border-red-600"
                autoComplete="on"
                className="p-2"
              >
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
                      value="IT"
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
                      value={'GE'}
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
                      shipToDifferentAddress ? 'translate-x-5' : 'translate-x-0'
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
                  <p className="mt-2 text-sm text-red-600" id="email-error">
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
            <ShipmentsContainer>
              <Shipment loader={<>Caricamento...</>}>
                <div className="flex">
                  Shipments N:
                  <ShipmentField className="font-bold pl-1" name="key_number" />
                </div>
                <LineItemsContainer>
                  <LineItem>
                    <div className="flex justify-between items-center border-b p-5">
                      <LineItemImage className="p-2" width={80} />
                      <LineItemName data-cy="line-item-name" className="p-2" />
                      <LineItemQuantity
                        readonly
                        data-cy="line-item-quantity"
                        max={100}
                        className="p-2"
                      />
                    </div>
                    <div>
                      <StockTransfer>
                        <div className="flex flex-row" data-cy="stock-transfer">
                          <StockTransferField
                            className="px-1"
                            type="quantity"
                          />{' '}
                          of <LineItemQuantity readonly className="px-1" />
                          items will undergo a transfer
                        </div>
                      </StockTransfer>
                    </div>
                  </LineItem>
                  <LineItem type="bundles">
                    <div className="flex justify-between items-center border-b p-5">
                      <LineItemImage className="p-2" width={80} />
                      <LineItemName data-cy="line-item-name" className="p-2" />
                      <LineItemQuantity
                        readonly
                        data-cy="line-item-quantity"
                        max={100}
                        className="p-2"
                      />
                    </div>
                    <div>
                      <StockTransfer>
                        <div className="flex flex-row" data-cy="stock-transfer">
                          <StockTransferField
                            className="px-1"
                            type="quantity"
                          />{' '}
                          of <LineItemQuantity readonly className="px-1" />
                          items will undergo a transfer
                        </div>
                      </StockTransfer>
                    </div>
                  </LineItem>
                </LineItemsContainer>
                <ShippingMethod>
                  <div className="flex justify-around w-2/3 items-center p-5">
                    <ShippingMethodRadioButton
                      data-cy="shipping-method-button"
                      onChange={handleChange}
                    />
                    <ShippingMethodName data-cy="shipping-method-name" />
                    <ShippingMethodPrice data-cy="shipping-method-price" />
                    <div className="flex">
                      <DeliveryLeadTime
                        type="min_days"
                        data-cy="delivery-lead-time-min-days"
                      />{' '}
                      -{' '}
                      <DeliveryLeadTime
                        type="max_days"
                        data-cy="delivery-lead-time-max-days"
                        className="mr-1"
                      />
                      days
                    </div>
                  </div>
                </ShippingMethod>
              </Shipment>
            </ShipmentsContainer>
            <PaymentMethodsContainer
              config={{
                stripePayment: {
                  // fonts: [
                  //   {
                  //     cssSrc:
                  //       'https://fonts.googleapis.com/css2?family=Josefin+Slab:ital,wght@0,100;1,100&display=swap',
                  //   },
                  // ],
                  options: {
                    // style: {
                    //   base: {
                    //     color: '#000',
                    //     fontWeight: '400',
                    //     fontFamily: 'Josefin Slab',
                    //     ':-webkit-autofill': {
                    //       color: '#fce883',
                    //     },
                    //     '::placeholder': {
                    //       color: '#e0e0e0',
                    //     },
                    //   },
                    //   invalid: {
                    //     iconColor: '#FFC7EE',
                    //     color: '#FFC7EE',
                    //   },
                    // },
                    hideIcon: false,
                    hidePostalCode: true,
                  },
                  containerClassName: 'w-1/2 px-3',
                },
                paypalPayment: {
                  cancel_url: paypalReturnUrl,
                  return_url: paypalReturnUrl,
                },
              }}
            >
              <PlaceOrderContainer options={{ paypalPayerId }}>
                <PaymentMethod
                  className="p-2 my-1 flex items-center justify-items-center bg-gray-300 cursor-pointer"
                  activeClass="bg-opacity-25"
                  clickableContainer
                >
                  <PaymentMethodRadioButton data-cy="payment-radio-button" />
                  <PaymentMethodName className="pl-3" />
                  <PaymentMethodPrice className="pl-3" />
                  <PaymentSource
                    data-cy="payment-source"
                    className="p-5 my-2"
                    loader={'Caricamento...'}
                  >
                    <div className="flex flex-row items-center justify-start bg-gray-100 p-5 my-10">
                      <div className="flex flex-row items-center">
                        <PaymentSourceBrandIcon className="mr-3" />
                        <PaymentSourceBrandName
                          className="mr-1"
                          data-cy="payment-brand-name-card"
                        />
                        ending in
                        <PaymentSourceDetail
                          data-cy="payment-last4"
                          className="ml-1"
                          type="last4"
                        />
                      </div>
                      <div className="text-gray-500 ml-5">
                        <PaymentSourceDetail
                          data-cy="payment-exp-month"
                          type="exp_month"
                        />
                        <PaymentSourceDetail
                          data-cy="payment-exp-year"
                          type="exp_year"
                        />
                      </div>
                      <div className="ml-5">
                        <PaymentSourceEditButton
                          data-cy="payment-edit-button"
                          className="text-blue-500 hover:underline hover:text-blue-600"
                        />
                      </div>
                    </div>
                  </PaymentSource>
                  <Errors
                    className="text-red-600 block"
                    resource="payment_methods"
                  />
                </PaymentMethod>

                <div className="flex flex-row-reverse justify-end">
                  <label
                    htmlFor="privacy-terms"
                    className="block text-sm font-medium text-gray-700 ml-3 self-end"
                  >
                    Accept privacy and terms
                  </label>
                  <div className="mt-1">
                    <PrivacyAndTermsCheckbox
                      id="privacy-terms"
                      className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <PlaceOrderButton
                    onClick={(res: any) => {
                      console.log('res', res)
                    }}
                    className="mt-5 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  />
                </div>
              </PlaceOrderContainer>
            </PaymentMethodsContainer>
            <LineItemsContainer>
              <p className="text-sm m-2">
                Your shopping bag contains{' '}
                <LineItemsCount data-test="items-count" className="font-bold" />{' '}
                items
              </p>
              <div className="flex flex-col p-2">
                <LineItem>
                  <div className="flex justify-around items-center border-b p-5">
                    <LineItemImage className="p-2" width={80} />
                    <LineItemName data-test="line-item-name" className="p-2" />
                    <Errors
                      className="text-red-700 p-2"
                      resource="line_items"
                      field="quantity"
                    />
                    <LineItemAmount
                      data-test="line-item-total"
                      className="p-2"
                    />
                  </div>
                </LineItem>
                <LineItem type="gift_cards">
                  <div className="flex justify-between items-center border-b p-5">
                    <LineItemImage className="p-2" width={40} />
                    <LineItemName data-test="line-item-name" className="p-2" />
                    <LineItemAmount
                      data-test="line-item-total"
                      className="p-2"
                    />
                  </div>
                </LineItem>
                <LineItem type="bundles">
                  <div className="flex justify-between items-center border-b p-5">
                    <LineItemImage className="p-2" width={40} />
                    <LineItemName data-test="line-item-name" className="p-2" />
                    <LineItemAmount
                      data-test="line-item-total"
                      className="p-2"
                    />
                  </div>
                </LineItem>
                <LineItem type="adjustments">
                  <div className="flex justify-between items-center border-b p-5">
                    <LineItemImage
                      className="p-2"
                      width={40}
                      placeholder={{
                        adjustments: '',
                      }}
                    />
                    <LineItemName data-test="line-item-name" className="p-2" />
                    <LineItemAmount
                      data-test="line-item-total"
                      className="p-2"
                    />
                  </div>
                </LineItem>
              </div>
            </LineItemsContainer>
            <div className="flex flex-col w-1/2 m-auto">
              <div className="flex items-center p-2 justify-around font-medium text-left">
                <div className="w-full">
                  <p className="text-lg">Subtotal </p>
                </div>
                <div className="text-right">
                  <SubTotalAmount data-test="subtotal-amount" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Discount </p>
                </div>
                <div className="text-right">
                  <DiscountAmount data-test="discount-amount" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Shipping </p>
                </div>
                <div className="text-right">
                  <ShippingAmount data-test="shipping-amount" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">
                    Taxes <span className="text-sm font-tin">(included)</span>
                  </p>
                </div>
                <div className="text-right">
                  <TaxesAmount data-test="taxes-amount" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Gift card </p>
                </div>
                <div className="text-right">
                  <GiftCardAmount data-test="gift-card-amount" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around text-gray-600 text-left">
                <div className="w-full">
                  <p className="text-lg">Payment Method </p>
                </div>
                <div className="text-right">
                  <PaymentMethodAmount data-test="payment-method-amount" />
                </div>
              </div>
              <div className=" flex items-center p-2 justify-around font-bold text-left">
                <div className="w-full">
                  <p className="text-lg mr-2">Total </p>
                </div>
                <div className="text-right">
                  <TotalAmount data-test="total-amount" />
                </div>
              </div>
            </div>
          </OrderContainer>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}

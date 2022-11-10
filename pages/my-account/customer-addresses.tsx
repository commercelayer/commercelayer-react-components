import {
  CommerceLayer,
  CustomerContainer,
  AddressesContainer,
  Address,
  AddressField,
  AddressInput,
  BillingAddressForm,
  Errors,
  AddressStateSelector,
  AddressCountrySelector,
  AddressesEmpty,
} from 'packages/react-components/src'
import { useState } from 'react'
import useGetToken from '../../hooks/useGetToken'
import SaveAddressesButton from '../../#components/addresses/SaveAddressesButton'

const messages: any = [
  {
    code: 'EMPTY_ERROR',
    resource: 'addresses',
    field: 'firstName',
    message: `Can't be blank`,
  },
  {
    code: 'VALIDATION_ERROR',
    resource: 'addresses',
    field: 'email',
    message: `Must be valid email`,
  },
]

const addresseses = () => {
  const config = useGetToken({ userMode: true })
  const [address, setAddress] = useState<any>({})
  const [showForm, setShowForm] = useState(false)
  console.log(`addressId`, address)
  return (
    <CommerceLayer {...config}>
      <CustomerContainer>
        <AddressesContainer>
        <AddressesEmpty />
          <div className="w-full p-5">
            <div className="flex flex-wrap mx-auto w-full">
              <Address className="w-1/3 p-2 border hover:border-blue-500 rounded m-2 shadow-sm">
                <div className="flex flex-col justify-between h-full">
                  <div className="flex font-bold">
                    <AddressField name="first_name" />
                    <AddressField name="last_name" className="ml-1" />
                  </div>
                  <div>
                    <AddressField className="w-2/3" name="full_address" />
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <AddressField
                        className="cursor-pointer"
                        type="edit"
                        label="Edit"
                        onClick={(address) => {
                          console.log('address', address)
                          setAddress(address)
                          setShowForm(true)
                        }}
                      />
                    </div>
                    <div>
                      <AddressField
                        className="cursor-pointer"
                        type="delete"
                        label="Delete"
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </Address>
            </div>
            <div className="mt-3 ml-2">
              <button
                title='button'
                type="button"
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  setAddress({})
                  setShowForm(true)
                }}
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {showForm ? (
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 bg-gray-50 p-2 my-3 shadow rounded-sm">
                  Fill up the form
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
                        value={address?.first_name || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_first_name_error"
                        resource="addresses"
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
                        value={address?.last_name || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_last_name_error"
                        resource="addresses"
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
                        value={address?.line_1 || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_line_1_error"
                        resource="addresses"
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
                        value={address?.city || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_city_error"
                        resource="addresses"
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
                        value={address?.country_code || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_country_code_error"
                        resource="addresses"
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
                        value={address?.state_code || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_state_code_error"
                        resource="addresses"
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
                        value={address?.zip_code || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_zip_code_error"
                        resource="addresses"
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
                        value={address?.phone || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      <Errors
                        data-cy="billing_address_phone_error"
                        resource="addresses"
                        field="billing_address_phone"
                        messages={messages}
                      />
                    </p>
                  </div>
                  {/* <div>
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
                        resource="addresses"
                        field="billing_address_billing_info"
                        messages={messages}
                      />
                    </p>
                  </div> */}
                </BillingAddressForm>
                <div className="mt-5 p-2 flex justify-between">
                  <SaveAddressesButton
                    data-cy="save-addresses-button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => setShowForm(false)}
                    addressId={address.id}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowForm(false)}
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

export default addresseses

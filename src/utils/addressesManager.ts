import { isEmpty } from 'lodash'
import { fieldsExist } from '#utils/validateFormFields'
import { BaseError } from '#typings/errors'
import { addressFields } from '#reducers/AddressReducer'

type AddressController = (params: {
  address?: Record<string, any>
  addressId?: string
  errors?: BaseError[]
  requiresBillingInfo?: boolean
}) => boolean

export const addressController: AddressController = ({
  address,
  addressId,
  errors,
  requiresBillingInfo = false,
}) => {
  let addressDisable = !isEmpty(errors) || isEmpty(address)
  if (isEmpty(errors) && !isEmpty(address)) {
    let billingInfo = [...addressFields]
    if (requiresBillingInfo) billingInfo = [...billingInfo, 'billing_info']
    addressDisable = !!(address && fieldsExist(address, billingInfo))
  }
  if (addressDisable && !isEmpty(addressId) && isEmpty(address)) {
    addressDisable = false
  }
  return addressDisable
}

type ShippingAddressController = (params: {
  billingDisable?: boolean
  errors?: BaseError[]
  shipToDifferentAddress?: boolean
  shippingAddress?: Record<string, any>
  shippingAddressId?: string
}) => boolean

export const shippingAddressController: ShippingAddressController = ({
  billingDisable,
  errors,
  shipToDifferentAddress,
  shippingAddress,
  shippingAddressId,
}) => {
  let shippingDisable = !!(!billingDisable && shipToDifferentAddress)
  if (shippingDisable && isEmpty(errors) && !isEmpty(shippingAddress)) {
    shippingDisable = !!(shippingAddress && fieldsExist(shippingAddress))
  }
  if (
    shippingDisable &&
    !isEmpty(shippingAddressId) &&
    isEmpty(shippingAddress)
  ) {
    shippingDisable = false
  }
  return shippingDisable
}

type CountryLockController = (params: {
  addresses?: Record<string, any>[]
  billingAddress?: Record<string, any>
  billingAddressId?: string
  countryCodeLock?: string
  shipToDifferentAddress?: boolean
  shippingAddress?: Record<string, any>
  shippingAddressId?: string
}) => boolean

export const countryLockController: CountryLockController = ({
  addresses,
  billingAddress,
  billingAddressId,
  countryCodeLock,
  shipToDifferentAddress,
  shippingAddress,
  shippingAddressId,
}) => {
  if (
    countryCodeLock &&
    !isEmpty(addresses) &&
    billingAddressId &&
    !shipToDifferentAddress
  ) {
    const addressLocked = addresses?.find(
      (a) =>
        (a.id === billingAddressId || a.reference === billingAddressId) &&
        a.countryCode !== countryCodeLock
    )
    if (!isEmpty(addressLocked)) return true
  }
  if (countryCodeLock && !isEmpty(billingAddress) && !shipToDifferentAddress) {
    return billingAddress?.['country_code'] !== countryCodeLock
  }
  if (countryCodeLock && !isEmpty(shippingAddress) && shipToDifferentAddress) {
    return shippingAddress?.['country_code'] !== countryCodeLock
  }
  if (
    countryCodeLock &&
    !isEmpty(addresses) &&
    shippingAddressId &&
    shipToDifferentAddress
  ) {
    const addressLocked = addresses?.find(
      (a) =>
        (a.id === shippingAddressId || a.reference === shippingAddressId) &&
        a.countryCode !== countryCodeLock
    )
    if (!isEmpty(addressLocked)) return true
  }
  return false
}

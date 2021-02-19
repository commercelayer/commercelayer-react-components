import _ from 'lodash'
import { fieldsExist } from '#utils/validateFormFields'
import { BaseError } from '#typings/errors'

type BillingAddressController = (params: {
  billingAddress?: Record<string, any>
  billingAddressId?: string
  errors?: BaseError[]
}) => boolean

export const billingAddressController: BillingAddressController = ({
  billingAddress,
  billingAddressId,
  errors,
}) => {
  let billingDisable = !_.isEmpty(errors) || _.isEmpty(billingAddress)
  if (_.isEmpty(errors) && !_.isEmpty(billingAddress)) {
    billingDisable = !!(billingAddress && fieldsExist(billingAddress))
  }
  if (
    billingDisable &&
    !_.isEmpty(billingAddressId) &&
    _.isEmpty(billingAddress)
  ) {
    billingDisable = false
  }
  return billingDisable
}

type ShippingAddressController = (params: {
  billingDisable: boolean
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
  if (shippingDisable && _.isEmpty(errors) && !_.isEmpty(shippingAddress)) {
    shippingDisable = !!(shippingAddress && fieldsExist(shippingAddress))
  }
  if (
    shippingDisable &&
    !_.isEmpty(shippingAddressId) &&
    _.isEmpty(shippingAddress)
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
    !_.isEmpty(addresses) &&
    billingAddressId &&
    !shipToDifferentAddress
  ) {
    const addressLocked = addresses?.find(
      (a) =>
        (a.id === billingAddressId || a.reference === billingAddressId) &&
        a.countryCode !== countryCodeLock
    )
    if (!_.isEmpty(addressLocked)) return true
  }
  if (
    countryCodeLock &&
    !_.isEmpty(billingAddress) &&
    !shipToDifferentAddress
  ) {
    return billingAddress?.['country_code'] !== countryCodeLock
  }
  if (
    countryCodeLock &&
    !_.isEmpty(shippingAddress) &&
    shipToDifferentAddress
  ) {
    return shippingAddress?.['country_code'] !== countryCodeLock
  }
  if (
    countryCodeLock &&
    !_.isEmpty(addresses) &&
    shippingAddressId &&
    shipToDifferentAddress
  ) {
    const addressLocked = addresses?.find(
      (a) =>
        (a.id === shippingAddressId || a.reference === shippingAddressId) &&
        a.countryCode !== countryCodeLock
    )
    if (!_.isEmpty(addressLocked)) return true
  }
  return false
}

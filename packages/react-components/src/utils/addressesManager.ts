/* eslint-disable @typescript-eslint/naming-convention */
import isEmpty from 'lodash/isEmpty'
import { fieldsExist } from '#utils/validateFormFields'
import { type BaseError } from '#typings/errors'
import { addressFields } from '#reducers/AddressReducer'
import { type Address, type AddressCreate } from '@commercelayer/sdk'
import { type TCustomerAddress } from '#reducers/CustomerReducer'

type BillingAddressController = (params: {
  billing_address?: AddressCreate
  billingAddressId?: string
  errors?: BaseError[]
  requiresBillingInfo?: boolean
}) => boolean

export const billingAddressController: BillingAddressController = ({
  billing_address,
  billingAddressId,
  errors,
  requiresBillingInfo = false
}) => {
  let billingDisable = !isEmpty(errors) || isEmpty(billing_address)
  if (isEmpty(errors) && !isEmpty(billing_address)) {
    let billingInfo = [...addressFields]
    if (requiresBillingInfo) billingInfo = [...billingInfo, 'billing_info']
    billingDisable = !!(
      billing_address && fieldsExist(billing_address, billingInfo)
    )
  }
  if (
    billingDisable &&
    !isEmpty(billingAddressId) &&
    isEmpty(billing_address)
  ) {
    billingDisable = false
  }
  return billingDisable
}

type ShippingAddressController = (params: {
  billingDisable?: boolean
  errors?: BaseError[]
  shipToDifferentAddress?: boolean
  shipping_address?: AddressCreate
  shippingAddressId?: string
}) => boolean

export const shippingAddressController: ShippingAddressController = ({
  billingDisable,
  errors,
  shipToDifferentAddress,
  shipping_address,
  shippingAddressId
}) => {
  let shippingDisable = !!(!billingDisable && shipToDifferentAddress)
  if (shippingDisable && isEmpty(errors) && !isEmpty(shipping_address)) {
    shippingDisable = !!(shipping_address && fieldsExist(shipping_address))
  }
  if (
    shippingDisable &&
    !isEmpty(shippingAddressId) &&
    isEmpty(shipping_address)
  ) {
    shippingDisable = false
  }
  return shippingDisable
}

type CountryLockController = (params: {
  addresses?: Address[] | null
  billing_address?: TCustomerAddress
  billingAddressId?: string
  countryCodeLock?: string
  shipToDifferentAddress?: boolean
  shipping_address?: AddressCreate
  shippingAddressId?: string
}) => boolean

export const countryLockController: CountryLockController = ({
  addresses,
  billing_address,
  billingAddressId,
  countryCodeLock,
  shipToDifferentAddress,
  shipping_address,
  shippingAddressId
}) => {
  if (
    countryCodeLock &&
    !isEmpty(addresses) &&
    billingAddressId &&
    !shipToDifferentAddress
  ) {
    const addressLocked = addresses?.find(
      (a) =>
        (a?.id === billingAddressId || a?.reference === billingAddressId) &&
        a?.country_code !== countryCodeLock
    )
    if (!isEmpty(addressLocked)) return true
  }
  if (countryCodeLock && !isEmpty(billing_address) && !shipToDifferentAddress) {
    return billing_address?.country_code !== countryCodeLock
  }
  if (countryCodeLock && !isEmpty(shipping_address) && shipToDifferentAddress) {
    return shipping_address?.country_code !== countryCodeLock
  }
  if (
    countryCodeLock &&
    !isEmpty(addresses) &&
    shippingAddressId &&
    shipToDifferentAddress
  ) {
    const addressLocked = addresses?.find(
      (a) =>
        (a?.id === shippingAddressId || a?.reference === shippingAddressId) &&
        a?.country_code !== countryCodeLock
    )
    if (!isEmpty(addressLocked)) return true
  }
  return false
}

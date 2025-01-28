/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/naming-convention */
import isEmpty from 'lodash/isEmpty'
import { fieldsExist } from '#utils/validateFormFields'
import type { BaseError } from '#typings/errors'
import { type AddressField, addressFields } from '#reducers/AddressReducer'
import type {
  OrderUpdate,
  Order,
  CommerceLayerClient,
  LineItem,
  Address,
  AddressCreate
} from '@commercelayer/sdk'
import type { TCustomerAddress } from '#reducers/CustomerReducer'

interface BillingAddressControllerProps {
  billing_address?: AddressCreate
  billingAddressId?: string
  errors?: BaseError[]
  requiresBillingInfo?: boolean | null
  invertAddresses?: boolean
  shippingDisable?: boolean
  shipToDifferentAddress?: boolean
  requiredMetadataFields?: string[]
}

export function billingAddressController({
  billing_address,
  billingAddressId,
  errors,
  requiresBillingInfo = false,
  invertAddresses = false,
  shipToDifferentAddress,
  shippingDisable,
  requiredMetadataFields
}: BillingAddressControllerProps): boolean {
  let billingDisable = invertAddresses
    ? !!(!shippingDisable && shipToDifferentAddress)
    : !isEmpty(errors) || isEmpty(billing_address)
  if (isEmpty(errors) && !isEmpty(billing_address)) {
    let formFields: Array<AddressField | string> = [...addressFields]
    if (requiredMetadataFields != null && requiredMetadataFields.length > 0)
      formFields = [...formFields, ...requiredMetadataFields]
    if (invertAddresses) {
      billingDisable = !!(
        billing_address && fieldsExist(billing_address, formFields)
      )
    } else {
      if (requiresBillingInfo) formFields = [...formFields, 'billing_info']
      billingDisable = !!(
        billing_address && fieldsExist(billing_address, formFields)
      )
    }
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

interface ShippingAddressControllerProps {
  billingDisable?: boolean
  errors?: BaseError[]
  requiresBillingInfo?: boolean | null
  shipToDifferentAddress?: boolean
  shipping_address?: AddressCreate
  shippingAddressId?: string
  invertAddresses?: boolean
  requiredMetadataFields?: string[]
}

export function shippingAddressController({
  billingDisable,
  errors,
  shipToDifferentAddress,
  shipping_address,
  shippingAddressId,
  invertAddresses = false,
  requiresBillingInfo = false,
  requiredMetadataFields
}: ShippingAddressControllerProps): boolean {
  let shippingDisable = invertAddresses
    ? !isEmpty(errors) || isEmpty(shipping_address)
    : !!(!billingDisable && shipToDifferentAddress)

  if (isEmpty(errors) && !isEmpty(shipping_address)) {
    let formField: Array<AddressField | string> = [...addressFields]
    if (requiredMetadataFields != null && requiredMetadataFields.length > 0)
      formField = [...formField, ...requiredMetadataFields]
    if (invertAddresses) {
      if (requiresBillingInfo) formField = [...formField, 'billing_info']
      shippingDisable = !!(
        shipping_address && fieldsExist(shipping_address, formField)
      )
    } else if (shipToDifferentAddress) {
      delete shipping_address?.billing_info
      shippingDisable = !!(
        shipping_address && fieldsExist(shipping_address, formField)
      )
    }
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

interface CountryLockControllerProps {
  addresses?: Address[] | null
  billing_address?: TCustomerAddress
  billingAddressId?: string
  countryCodeLock?: string | null
  shipToDifferentAddress?: boolean
  shipping_address?: AddressCreate
  shippingAddressId?: string
  lineItems?: LineItem[] | null
}

export function countryLockController({
  addresses,
  billing_address,
  billingAddressId,
  countryCodeLock,
  shipToDifferentAddress,
  shipping_address,
  shippingAddressId,
  lineItems
}: CountryLockControllerProps): boolean {
  const doNotShipItems = lineItems
    ?.filter(
      (lineItem) =>
        lineItem?.item?.type != null &&
        ['skus', 'bundles'].includes(lineItem?.item?.type)
    )
    ?.every(
      (lineItem) =>
        // @ts-expect-error no type for do_not_ship on SDK
        lineItem?.item?.do_not_ship === true
    )
  if (doNotShipItems) return false
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

interface InvertedAddressesHandlerParams {
  billingAddress?: AddressCreate
  billingAddressId?: string
  customerEmail?: string
  order: Order
  shipToDifferentAddress?: boolean
  shippingAddress?: AddressCreate
  shippingAddressId?: string
  sdk: CommerceLayerClient
}

export async function invertedAddressesHandler({
  order,
  billingAddress,
  billingAddressId,
  customerEmail,
  shipToDifferentAddress,
  shippingAddress,
  shippingAddressId,
  sdk
}: InvertedAddressesHandlerParams): Promise<OrderUpdate | null> {
  const currentShippingAddressRef = order?.shipping_address?.reference
  const orderAttributes: OrderUpdate = {
    id: order?.id,
    _billing_address_clone_id: shippingAddressId,
    _shipping_address_clone_id: shippingAddressId,
    customer_email: customerEmail
  }
  if (currentShippingAddressRef === shippingAddressId) {
    orderAttributes._billing_address_clone_id = order?.billing_address?.id
    orderAttributes._shipping_address_clone_id = order?.shipping_address?.id
  }
  if (
    shippingAddress != null &&
    Object.keys(shippingAddress).length > 0 &&
    !shippingAddressId
  ) {
    delete orderAttributes._billing_address_clone_id
    delete orderAttributes._shipping_address_clone_id
    orderAttributes._billing_address_same_as_shipping = true
    const hasMetadata = Object.keys(shippingAddress).filter((key) => {
      if (key.startsWith('metadata_')) {
        return true
      }
      return false
    })
    if (hasMetadata?.length > 0) {
      hasMetadata.forEach((key) => {
        const metadataKey = key.replace('metadata_', '')
        shippingAddress.metadata = {
          ...(shippingAddress.metadata || {}),
          // @ts-expect-error type mismatch
          [metadataKey]: shippingAddress[key]
        }
        // @ts-expect-error type mismatch
        delete shippingAddress[key]
      })
    }
    const address = await sdk.addresses.create(shippingAddress)
    orderAttributes.shipping_address = sdk.addresses.relationship(address.id)
  }
  if (shipToDifferentAddress) {
    delete orderAttributes._billing_address_same_as_shipping
    if (billingAddressId)
      orderAttributes._billing_address_clone_id = billingAddressId
    if (billingAddress != null && Object.keys(billingAddress).length > 0) {
      delete orderAttributes._billing_address_clone_id
      const hasMetadata = Object.keys(billingAddress).filter((key) => {
        if (key.startsWith('metadata_')) {
          return true
        }
        return false
      })
      if (hasMetadata?.length > 0) {
        hasMetadata.forEach((key) => {
          const metadataKey = key.replace('metadata_', '')
          billingAddress.metadata = {
            ...(billingAddress.metadata || {}),
            // @ts-expect-error type mismatch
            [metadataKey]: billingAddress[key]
          }
          // @ts-expect-error type mismatch
          delete billingAddress[key]
        })
      }
      const address = await sdk.addresses.create(billingAddress)
      orderAttributes.billing_address = sdk.addresses.relationship(address.id)
    }
  }
  return orderAttributes
}

interface AddressControllerProps {
  billing_address?: AddressCreate
  billingAddressId?: string
  shipToDifferentAddress?: boolean
  shipping_address?: AddressCreate
  shippingAddressId?: string
  errors?: BaseError[]
  requiresBillingInfo?: boolean | null
  invertAddresses?: boolean
  requiredMetadataFields?: string[]
}

export function addressesController({
  billing_address,
  billingAddressId,
  shipToDifferentAddress,
  shipping_address,
  shippingAddressId,
  errors,
  requiresBillingInfo,
  invertAddresses,
  requiredMetadataFields
}: AddressControllerProps): {
  billingDisable: boolean
  shippingDisable: boolean
} {
  if (invertAddresses) {
    const shippingDisable = shippingAddressController({
      errors,
      shipToDifferentAddress,
      shipping_address,
      shippingAddressId,
      invertAddresses,
      requiresBillingInfo,
      requiredMetadataFields
    })
    const billingDisable = billingAddressController({
      shippingDisable,
      billing_address,
      billingAddressId,
      errors,
      requiresBillingInfo,
      invertAddresses,
      requiredMetadataFields
    })
    return {
      shippingDisable,
      billingDisable
    }
  }
  const billingDisable = billingAddressController({
    billing_address,
    billingAddressId,
    errors,
    requiresBillingInfo,
    requiredMetadataFields
  })
  const shippingDisable = shippingAddressController({
    billingDisable,
    errors,
    shipToDifferentAddress,
    shipping_address,
    shippingAddressId,
    requiredMetadataFields
  })
  return {
    billingDisable,
    shippingDisable
  }
}

export function sanitizeMetadataFields(address: AddressCreate): AddressCreate {
  const hasMetadata = Object.keys(address).filter((key) => {
    if (key.startsWith('metadata_')) {
      return true
    }
    return false
  })
  if (hasMetadata?.length > 0) {
    hasMetadata.forEach((key) => {
      const metadataKey = key.replace('metadata_', '')
      address.metadata = {
        ...(address.metadata || {}),
        [metadataKey]: address[key as keyof AddressCreate]
      }
      delete address[key as keyof AddressCreate]
    })
  }
  return address
}

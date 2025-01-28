import baseReducer from '#utils/baseReducer'
import type { Dispatch } from 'react'
import type { CodeErrorType, BaseError } from '#typings/errors'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { OrderUpdate, Address, Order } from '@commercelayer/sdk'
import getSdk from '#utils/getSdk'
import type { updateOrder } from './OrderReducer'
import camelCase from 'lodash/camelCase'
import type { TCustomerAddress } from './CustomerReducer'
import type { TResourceError } from '#components/errors/Errors'
import {
  invertedAddressesHandler,
  sanitizeMetadataFields
} from '#utils/addressesManager'
import { formCleaner } from '#utils/formCleaner'
import type { AddressValuesKeys } from '#context/BillingAddressFormContext'
import type { AddressInputName } from '#typings/index'

// TODO: Move in the future
export type CustomFieldMessageError = (props: {
  field: Extract<AddressValuesKeys, AddressInputName> | string
  code?: Extract<CodeErrorType, 'EMPTY_ERROR' | 'VALIDATION_ERROR'> | undefined
  message?: string | undefined
  value: string
  values?: Record<string, any>
}) =>
  | string
  | null
  | Array<{
      field: Extract<AddressValuesKeys, AddressInputName> | string
      value: string
      isValid: boolean
      message?: string
    }>

export type AddressActionType =
  | 'setErrors'
  | 'setAddress'
  | 'setShipToDifferentAddress'
  | 'setCloneAddress'
  | 'cleanup'

export type AddressField =
  | 'city'
  | 'company'
  | 'country_code'
  | 'first_name'
  | 'last_name'
  | 'line_1'
  | 'line_2'
  | 'phone'
  | 'state_code'
  | 'zip_code'
  | 'billing_info'

export type AddressFieldView = AddressField | 'full_address' | 'full_name'

export const addressFields: AddressField[] = [
  'city',
  'company',
  'country_code',
  'first_name',
  'last_name',
  'line_1',
  'line_2',
  'phone',
  'state_code',
  'zip_code'
]

export type AddressResource = Extract<
  TResourceError,
  'billing_address' | 'shipping_address'
>

export type AddressSchema = Omit<
  Address,
  'created_at' | 'updated_at' | 'id' | 'type'
>

export interface AddressActionPayload {
  errors: BaseError[]
  billing_address: TCustomerAddress
  shipping_address: TCustomerAddress
  shipToDifferentAddress: boolean
  billingAddressId: string
  shippingAddressId: string
  isBusiness: boolean
  invertAddresses: boolean
}

export type AddressState = Partial<AddressActionPayload>

export interface AddressAction {
  type: AddressActionType
  payload: Partial<AddressActionPayload>
}

export const addressInitialState: AddressState = {
  errors: []
}

export type SetAddressErrors = <V extends BaseError[]>(args: {
  errors: V
  resource: Extract<TResourceError, 'billing_address' | 'shipping_address'>
  dispatch?: Dispatch<AddressAction>
  currentErrors?: V
}) => void

export interface SetAddressParams<V extends TCustomerAddress> {
  values: V
  resource: AddressResource
  dispatch?: Dispatch<AddressAction>
}

export const setAddressErrors: SetAddressErrors = ({
  errors,
  dispatch,
  currentErrors = [],
  resource
}) => {
  const billingErrors =
    resource === 'billing_address'
      ? errors.filter((e) => e.resource === resource)
      : currentErrors.filter((e) => e.resource === 'billing_address')
  const shippingErrors =
    resource === 'shipping_address'
      ? errors.filter((e) => e.resource === resource)
      : currentErrors.filter((e) => e.resource === 'shipping_address')
  const finalErrors = [...billingErrors, ...shippingErrors]
  if (dispatch)
    dispatch({
      type: 'setErrors',
      payload: {
        errors: finalErrors
      }
    })
}

export function setAddress<V extends TCustomerAddress>({
  values,
  resource,
  dispatch
}: SetAddressParams<V>): void {
  const payload = {
    [`${resource}`]: {
      ...formCleaner(values)
    }
  }
  if (dispatch)
    dispatch({
      type: 'setAddress',
      payload
    })
}

type SetCloneAddress = (
  id: string,
  resource: AddressResource,
  dispatch: Dispatch<AddressAction>
) => void

export const setCloneAddress: SetCloneAddress = (id, resource, dispatch) => {
  dispatch({
    type: 'setCloneAddress',
    payload: {
      [`${camelCase(resource)}Id`]: id
    }
  })
}

export interface ICustomerAddress {
  id: string | undefined
  resource: AddressResource
}

interface TSaveAddressesParams {
  orderId?: string
  order?: Order | null
  updateOrder?: typeof updateOrder
  config: CommerceLayerConfig
  state: AddressState
  dispatch: Dispatch<AddressAction>
  getCustomerAddresses?: () => Promise<void>
  customerEmail?: string
  customerAddress?: ICustomerAddress
}

export async function saveAddresses({
  config,
  updateOrder,
  order,
  state,
  customerEmail,
  customerAddress
}: TSaveAddressesParams): Promise<{
  success: boolean
  order?: Order
  error?: unknown
}> {
  const {
    shipToDifferentAddress,
    invertAddresses,
    billing_address: billingAddressForm,
    shipping_address: shippingAddressForm,
    billingAddressId,
    shippingAddressId
  } = state
  try {
    const sdk = getSdk(config)
    const billingAddress = formCleaner(billingAddressForm)
    const shippingAddress = formCleaner(shippingAddressForm)
    if (order) {
      let orderAttributes: OrderUpdate | null = null
      const billingAddressCloneId =
        customerAddress?.resource === 'billing_address'
          ? customerAddress?.id
          : billingAddressId
      const shippingAddressCloneId =
        customerAddress?.resource === 'shipping_address'
          ? customerAddress?.id
          : shippingAddressId
      if (invertAddresses) {
        orderAttributes = await invertedAddressesHandler({
          billingAddress,
          billingAddressId: billingAddressCloneId,
          customerEmail,
          order,
          shipToDifferentAddress,
          shippingAddress,
          shippingAddressId: shippingAddressCloneId,
          sdk
        })
      } else {
        const doNotShipItems = order?.line_items?.every(
          // @ts-expect-error no type for do_not_ship on SDK
          (lineItem) => lineItem?.item?.do_not_ship === true
        )
        const currentBillingAddressRef = order?.billing_address?.reference
        orderAttributes = {
          id: order?.id,
          _billing_address_clone_id: billingAddressCloneId,
          _shipping_address_clone_id: billingAddressCloneId,
          customer_email: customerEmail
        }
        if (currentBillingAddressRef === billingAddressCloneId) {
          orderAttributes._billing_address_clone_id = order?.billing_address?.id
          orderAttributes._shipping_address_clone_id =
            order?.shipping_address?.id
        }
        if (
          billingAddress != null &&
          Object.keys(billingAddress).length > 0 &&
          !billingAddressCloneId
        ) {
          delete orderAttributes._billing_address_clone_id
          delete orderAttributes._shipping_address_clone_id
          if (!doNotShipItems) {
            orderAttributes._shipping_address_same_as_billing = true
          }
          const billingAddressWithMeta = sanitizeMetadataFields(billingAddress)
          const address = await sdk.addresses.create(billingAddressWithMeta)
          orderAttributes.billing_address = sdk.addresses.relationship(
            address.id
          )
        }
        if (shipToDifferentAddress) {
          delete orderAttributes._shipping_address_same_as_billing
          if (shippingAddressCloneId)
            orderAttributes._shipping_address_clone_id = shippingAddressCloneId
          if (
            shippingAddress != null &&
            Object.keys(shippingAddress).length > 0
          ) {
            delete orderAttributes._shipping_address_clone_id
            const shippingAddressWithMeta =
              sanitizeMetadataFields(shippingAddress)
            const address = await sdk.addresses.create(shippingAddressWithMeta)
            orderAttributes.shipping_address = sdk.addresses.relationship(
              address.id
            )
          }
        }
      }
      if (orderAttributes != null && updateOrder) {
        const orderUpdated = await updateOrder({
          id: order.id,
          attributes: orderAttributes
        })
        return { success: true, order: orderUpdated?.order }
      }
    }
    return { success: false }
  } catch (error) {
    console.error(error)
    return { success: false, error }
  }
}

const type: AddressActionType[] = [
  'setErrors',
  'setAddress',
  'setShipToDifferentAddress',
  'setCloneAddress',
  'cleanup'
]

const addressReducer = (
  state: AddressState,
  reducer: AddressAction
): AddressState =>
  baseReducer<AddressState, AddressAction, AddressActionType[]>(
    state,
    reducer,
    type
  )

export default addressReducer

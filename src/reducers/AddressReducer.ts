import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError, ResourceErrorType } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Address, AddressCreate, Order, OrderUpdate } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import getSdk from '#utils/getSdk'
import { updateOrder } from './OrderReducer'

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

export type AddressFieldView =
  | AddressField
  | 'full_address'
  | 'full_name'
  | 'edit_address'

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
  'zip_code',
]

export type AddressResource = Extract<
  ResourceErrorType,
  'billing_address' | 'shipping_address'
>

export type AddressSchema = Address

export interface AddressActionPayload {
  errors: BaseError[]
  billingAddress: AddressCreate
  shippingAddress: AddressCreate
  shipToDifferentAddress: boolean
  billingAddressId: string
  shippingAddressId: string
  customerAddressId: string
}

export type AddressState = Partial<AddressActionPayload>

export interface AddressAction {
  type: AddressActionType
  payload: Partial<AddressActionPayload>
}

export const addressInitialState: AddressState = {
  errors: [],
}

export interface SetAddressErrors {
  <V extends BaseError[]>(args: {
    errors: V
    resource: Extract<ResourceErrorType, 'billing_address' | 'shipping_address'>
    dispatch?: Dispatch<AddressAction>
    currentErrors?: V
  }): void
}

export type SetAddressParams<V extends AddressSchema> = {
  values: V
  resource: AddressResource
  dispatch?: Dispatch<AddressAction>
}

export interface SetAddress {
  <V extends AddressSchema>(params: SetAddressParams<V>): void
}

export interface SaveAddresses {
  (params: {
    orderId?: string
    order?: Order | null
    updateOrder?: typeof updateOrder
    config: CommerceLayerConfig
    state: AddressState
    dispatch: Dispatch<AddressAction>
    getCustomerAddresses?: any
  }): Promise<void>
}

export const setAddressErrors: SetAddressErrors = ({
  errors,
  dispatch,
  currentErrors = [],
  resource,
}) => {
  const billingErrors =
    resource === 'billing_address'
      ? errors.filter((e) => e.resource === resource)
      : currentErrors.filter((e) => e.resource === resource)
  const shippingErrors =
    resource === 'shipping_address'
      ? errors.filter((e) => e.resource === resource)
      : currentErrors.filter((e) => e.resource === resource)
  const finalErrors = [...billingErrors, ...shippingErrors]
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors: finalErrors,
      },
    })
}

export const setAddress: SetAddress = ({ values, resource, dispatch }) => {
  dispatch &&
    dispatch({
      type: 'setAddress',
      payload: {
        [`${resource}`]: values,
      },
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
      [`${resource}_id`]: id,
    },
  })
}

export const saveAddresses: SaveAddresses = async ({
  config,
  updateOrder,
  order,
  state,
  addressId,
  getCustomerAddresses,
}) => {
  const {
    shipToDifferentAddress,
    billingAddress,
    shippingAddress,
    billingAddressId,
    shippingAddressId,
    customerAddress,
  } = state
  try {
    // const currentBillingAddressRef = order?.billingAddress()?.reference
    const sdk = getSdk(config)
    if (order) {
      const currentBillingAddressRef = order?.billing_address?.reference
      const orderAttributes: OrderUpdate = {
        id: order?.id,
        _billing_address_clone_id: billingAddressId,
        _shipping_address_clone_id: billingAddressId,
      }
      if (currentBillingAddressRef === billingAddressId) {
        orderAttributes._billing_address_clone_id = order?.billing_address?.id
        orderAttributes._shipping_address_clone_id = order?.shipping_address?.id
      }
      if (!isEmpty(billingAddress) && billingAddress) {
        delete orderAttributes._billing_address_clone_id
        delete orderAttributes._shipping_address_clone_id
        orderAttributes._shipping_address_same_as_billing = true
        const address = await sdk.addresses.create(billingAddress)
        orderAttributes.billing_address = sdk.addresses.relationship(address.id)
      }
      if (shipToDifferentAddress) {
        delete orderAttributes._shipping_address_same_as_billing
        if (shippingAddressId)
          orderAttributes._shipping_address_clone_id = shippingAddressId
        if (!isEmpty(shippingAddress) && shippingAddress) {
          delete orderAttributes._shipping_address_clone_id
          const address = await sdk.addresses.create(shippingAddress)
          orderAttributes.shipping_address = sdk.addresses.relationship(
            address.id
          )
        }
      }
      if (!isEmpty(orderAttributes) && updateOrder) {
        await updateOrder({ id: order.id, attributes: orderAttributes })
      }
    }
    if (!isEmpty(customerAddress)) {
      if (addressId) {
        await Address.withCredentials(config)
          .build({ id: addressId })
          .update(
            {
              ...customerAddress,
            },
            null,
            // @ts-ignore
            { rawResponse: true }
          )
        getCustomerAddresses && (await getCustomerAddresses())
      } else {
        const address = await Address.withCredentials(config).create({
          ...customerAddress,
        })
        await CustomerAddress.withCredentials(config).create({ address })
        getCustomerAddresses && (await getCustomerAddresses())
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const type: AddressActionType[] = [
  'setErrors',
  'setAddress',
  'setShipToDifferentAddress',
  'setCloneAddress',
  'cleanup',
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

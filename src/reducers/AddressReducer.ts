import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Address, Order, OrderCollection } from '@commercelayer/js-sdk'
import { isEmpty } from 'lodash'

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
  'zip_code',
]

export type AddressResource = 'billingAddress' | 'shippingAddress'

export type AddressSchema = Record<AddressField | string, string>

export interface AddressActionPayload {
  errors: BaseError[]
  billingAddress: AddressSchema
  shippingAddress: AddressSchema
  shipToDifferentAddress: boolean
  billingAddressId: string
  shippingAddressId: string
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
  <V extends BaseError[]>(errors: V, dispatch?: Dispatch<AddressAction>): void
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
    order?: OrderCollection | null
    getOrder?: (orderId: string) => void
    config: CommerceLayerConfig
    state: AddressState
    dispatch: Dispatch<AddressAction>
  }): Promise<void>
}

export const setAddressErrors: SetAddressErrors = (errors, dispatch) => {
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
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
  resource: 'billingAddress' | 'shippingAddress',
  dispatch: Dispatch<AddressAction>
) => void

export const setCloneAddress: SetCloneAddress = (id, resource, dispatch) => {
  dispatch({
    type: 'setCloneAddress',
    payload: {
      [`${resource}Id`]: id,
    },
  })
}

export const saveAddresses: SaveAddresses = async ({
  config,
  getOrder,
  order,
  state,
}) => {
  const {
    shipToDifferentAddress,
    billingAddress,
    shippingAddress,
    billingAddressId,
    shippingAddressId,
  } = state
  try {
    const currentBillingAddressRef = order?.billingAddress()?.reference
    const orderAttributes: Partial<Record<string, any>> = {
      _billingAddressCloneId: billingAddressId,
      _shippingAddressCloneId: billingAddressId,
    }
    if (currentBillingAddressRef === billingAddressId) {
      orderAttributes._billingAddressCloneId = order?.billingAddress()?.id
      orderAttributes._shippingAddressCloneId = order?.billingAddress()?.id
    }
    if (!isEmpty(billingAddress) && billingAddress) {
      delete orderAttributes._billingAddressCloneId
      delete orderAttributes._shippingAddressCloneId
      orderAttributes._shippingAddressSameAsBilling = true
      orderAttributes.billingAddress = await Address.withCredentials(
        config
      ).create(billingAddress)
    }
    if (shipToDifferentAddress) {
      delete orderAttributes._shippingAddressSameAsBilling
      if (shippingAddressId)
        orderAttributes._shippingAddressCloneId = shippingAddressId
      if (!isEmpty(shippingAddress) && shippingAddress) {
        delete orderAttributes._shippingAddressCloneId
        orderAttributes.shippingAddress = await Address.withCredentials(
          config
        ).create(shippingAddress)
      }
    }
    if (order && getOrder && !isEmpty(orderAttributes)) {
      const o = await Order.build({ id: order.id })
      await o.withCredentials(config).update(orderAttributes)
      await getOrder(order.id)
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

import baseReducer from '@utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '@typings/errors'
import { CommerceLayerConfig } from '@context/CommerceLayerContext'
import { Address, Order, OrderCollection } from '@commercelayer/js-sdk'

export type AddressActionType =
  | 'setErrors'
  | 'setAddress'
  | 'setShipToDifferentAddress'

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

export type AddressSchema = Record<AddressField, string>

export interface AddressActionPayload {
  errors: BaseError[]
  billingAddress: AddressSchema
  shippingAddress: AddressSchema
  shipToDifferentAddress: boolean
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
  <V extends BaseError[]>(
    errors: V,
    state?: AddressState,
    dispatch?: Dispatch<AddressAction>
  ): void
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

export const setAddressErrors: SetAddressErrors = (errors, state, dispatch) => {
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

export const saveAddresses: SaveAddresses = async ({
  config,
  // dispatch,
  getOrder,
  order,
  orderId,
  state,
}) => {
  const { shipToDifferentAddress, billingAddress, shippingAddress } = state
  try {
    if (billingAddress) {
      const billing =
        billingAddress &&
        (await Address.withCredentials(config).create(billingAddress))
      const o =
        order ||
        (orderId && (await Order.withCredentials(config).find(orderId)))
      const updateObj: any = {
        billingAddress: billing,
        _shippingAddressSameAsBilling: true,
      }
      if (shipToDifferentAddress) {
        const shipping =
          shippingAddress &&
          (await Address.withCredentials(config).create(shippingAddress))
        updateObj['shippingAddress'] = shipping
        delete updateObj._shippingAddressSameAsBilling
      }
      if (o && getOrder) {
        const patchOrder = await o.withCredentials(config).update(updateObj)
        getOrder(patchOrder.id)
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

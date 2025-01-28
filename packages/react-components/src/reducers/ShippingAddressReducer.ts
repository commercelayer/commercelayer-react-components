import baseReducer from '#utils/baseReducer'
import type { Dispatch } from 'react'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { Order, AddressUpdate } from '@commercelayer/sdk'
import type { getOrderContext } from '#reducers/OrderReducer'
import type { AddressResource } from './AddressReducer'
import getSdk from '#utils/getSdk'

export type ShippingAddressActionType =
  | 'setShippingAddress'
  | 'setShippingCustomerAddressId'
  | 'cleanup'

export interface ShippingAddressActionPayload {
  _shipping_address_clone_id: string
  shippingCustomerAddressId: string
}

export type ShippingAddressState = Partial<ShippingAddressActionPayload>

export interface ShippingAddressAction {
  type: ShippingAddressActionType
  payload: Partial<ShippingAddressActionPayload>
}

export const shippingAddressInitialState: ShippingAddressState = {
  _shipping_address_clone_id: ''
}

export type SetShippingAddress = (
  id: string,
  options?: {
    config: CommerceLayerConfig
    dispatch: Dispatch<ShippingAddressAction>
    order?: Order | null
    getOrder?: getOrderContext
    customerAddressId?: string
  }
) => Promise<void>

export const setShippingAddress: SetShippingAddress = async (id, options) => {
  try {
    if (options?.order) {
      if (options.customerAddressId) {
        const sdk = getSdk(options.config)
        const attributes: AddressUpdate = {
          id,
          reference: options.customerAddressId
        }
        await sdk.addresses.update(attributes)
      }
      options.dispatch({
        type: 'setShippingAddress',
        payload: {
          _shipping_address_clone_id: id
        }
      })
    }
  } catch (error) {
    console.error(error)
  }
}

interface SetShippingCustomerAddressIdParams {
  dispatch: Dispatch<ShippingAddressAction>
  order: Order
  setCloneAddress: (id: string, resource: AddressResource) => void
}

export function setShippingCustomerAddressId({
  dispatch,
  order,
  setCloneAddress
}: SetShippingCustomerAddressIdParams): void {
  const customerAddressId = order?.shipping_address?.reference
  try {
    if (customerAddressId) {
      dispatch({
        type: 'setShippingCustomerAddressId',
        payload: { shippingCustomerAddressId: customerAddressId }
      })
      setCloneAddress(customerAddressId, 'shipping_address')
    }
  } catch (error) {
    console.error('error', error)
  }
}

const type: ShippingAddressActionType[] = [
  'setShippingAddress',
  'setShippingCustomerAddressId',
  'cleanup'
]

const shippingAddressReducer = (
  state: ShippingAddressState,
  reducer: ShippingAddressAction
): ShippingAddressState =>
  baseReducer<
    ShippingAddressState,
    ShippingAddressAction,
    ShippingAddressActionType[]
  >(state, reducer, type)

export default shippingAddressReducer

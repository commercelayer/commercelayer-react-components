import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Address, OrderCollection } from '@commercelayer/js-sdk'
import { getOrderContext } from '#reducers/OrderReducer'

export type ShippingAddressActionType =
  | 'setShippingAddress'
  | 'setShippingCustomerAddressId'

export interface ShippingAddressActionPayload {
  _shippingAddressCloneId: string
  shippingCustomerAddressId: string
}

export type ShippingAddressState = Partial<ShippingAddressActionPayload>

export interface ShippingAddressAction {
  type: ShippingAddressActionType
  payload: Partial<ShippingAddressActionPayload>
}

export const shippingAddressInitialState: ShippingAddressState = {
  _shippingAddressCloneId: '',
}

export type SetShippingAddress = (
  id: string,
  options?: {
    config: CommerceLayerConfig
    dispatch: Dispatch<ShippingAddressAction>
    order?: OrderCollection | null
    getOrder?: getOrderContext
    customerAddressId?: string
  }
) => Promise<void>

export const setShippingAddress: SetShippingAddress = async (id, options) => {
  try {
    if (options?.order) {
      if (options.customerAddressId) {
        const address = await Address.withCredentials(options.config).find(id)
        if (address.reference !== options.customerAddressId) {
          await address.withCredentials(options.config).update({
            reference: options.customerAddressId,
          })
        }
      }
      options.dispatch({
        type: 'setShippingAddress',
        payload: {
          _shippingAddressCloneId: id,
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

type SetShippingCustomerAddressId = (args: {
  customerAddressId: string
  dispatch: Dispatch<ShippingAddressAction>
}) => void

export const setShippingCustomerAddressId: SetShippingCustomerAddressId = ({
  customerAddressId,
  dispatch,
}) => {
  dispatch({
    type: 'setShippingCustomerAddressId',
    payload: { shippingCustomerAddressId: customerAddressId },
  })
}

const type: ShippingAddressActionType[] = [
  'setShippingAddress',
  'setShippingCustomerAddressId',
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

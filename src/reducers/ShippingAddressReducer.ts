import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { OrderCollection } from '@commercelayer/js-sdk'
import { getOrderContext } from '#reducers/OrderReducer'

export type ShippingAddressActionType = 'setShippingAddress'

export interface ShippingAddressActionPayload {
  _shippingAddressCloneId: string
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
  }
) => Promise<void>

export const setShippingAddress: SetShippingAddress = async (id, options) => {
  try {
    if (options?.order) {
      const orderId = options?.order.id
      await options?.order.withCredentials(options.config).update({
        _shippingAddressCloneId: id,
      })
      options?.getOrder && (await options?.getOrder(orderId))
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

const type: ShippingAddressActionType[] = ['setShippingAddress']

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

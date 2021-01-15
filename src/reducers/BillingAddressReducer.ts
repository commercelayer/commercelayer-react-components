import baseReducer from '@utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '@context/CommerceLayerContext'
import { OrderCollection } from '@commercelayer/js-sdk'
import { getOrderContext } from '@reducers/OrderReducer'

export type BillingAddressActionType = 'setBillingAddress'

export interface BillingAddressActionPayload {
  _billingAddressCloneId: string
}

export type BillingAddressState = Partial<BillingAddressActionPayload>

export interface BillingAddressAction {
  type: BillingAddressActionType
  payload: Partial<BillingAddressActionPayload>
}

export const billingAddressInitialState: BillingAddressState = {
  _billingAddressCloneId: '',
}

export type SetBillingAddress = (
  id: string,
  options?: {
    config: CommerceLayerConfig
    dispatch: Dispatch<BillingAddressAction>
    order?: OrderCollection | null
    getOrder?: getOrderContext
    shipToDifferentAddress?: boolean
  }
) => Promise<void>

export const setBillingAddress: SetBillingAddress = async (id, options) => {
  try {
    if (options?.order) {
      const orderId = options?.order.id
      const updateObj: Partial<Record<string, any>> = {
        _billingAddressCloneId: id,
        _shippingAddressSameAsBilling: true,
      }
      if (options?.shipToDifferentAddress) {
        delete updateObj._shippingAddressSameAsBilling
      }
      await options?.order.withCredentials(options.config).update(updateObj)
      options?.getOrder && (await options?.getOrder(orderId))
      options.dispatch({
        type: 'setBillingAddress',
        payload: {
          _billingAddressCloneId: id,
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const type: BillingAddressActionType[] = ['setBillingAddress']

const billingAddressReducer = (
  state: BillingAddressState,
  reducer: BillingAddressAction
): BillingAddressState =>
  baseReducer<
    BillingAddressState,
    BillingAddressAction,
    BillingAddressActionType[]
  >(state, reducer, type)

export default billingAddressReducer

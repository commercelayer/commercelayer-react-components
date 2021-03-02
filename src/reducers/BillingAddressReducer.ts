import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Address, OrderCollection } from '@commercelayer/js-sdk'
import { getOrderContext } from '#reducers/OrderReducer'

export type BillingAddressActionType =
  | 'setBillingAddress'
  | 'setBillingCustomerAddressId'

export interface BillingAddressActionPayload {
  _billingAddressCloneId: string
  billingCustomerAddressId: string
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
    order?: OrderCollection
    getOrder?: getOrderContext
    shipToDifferentAddress?: boolean
    customerAddressId?: string
  }
) => Promise<void>

export const setBillingAddress: SetBillingAddress = async (id, options) => {
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

type SetBillingCustomerAddressId = (args: {
  dispatch: Dispatch<BillingAddressAction>
  order: OrderCollection
  setCloneAddress: (
    id: string,
    resource: 'billingAddress' | 'shippingAddress'
  ) => void
}) => void

export const setBillingCustomerAddressId: SetBillingCustomerAddressId = async ({
  dispatch,
  order,
  setCloneAddress,
}) => {
  let customerAddressId = order?.billingAddress()?.customerAddressId
  try {
    if (!customerAddressId) {
      // @ts-ignore
      const address = await order.loadBillingAddress()
      customerAddressId = address?.reference
    }
    if (customerAddressId) {
      dispatch({
        type: 'setBillingCustomerAddressId',
        payload: { billingCustomerAddressId: customerAddressId },
      })
      setCloneAddress(customerAddressId, 'billingAddress')
    }
  } catch (error) {
    console.error('error', error)
  }
}

const type: BillingAddressActionType[] = [
  'setBillingAddress',
  'setBillingCustomerAddressId',
]

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

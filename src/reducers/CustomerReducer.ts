import baseReducer from '@utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '@typings/errors'
import {
  AddressCollection,
  CustomerAddress,
  OrderCollection,
} from '@commercelayer/js-sdk'
import { CommerceLayerConfig } from '@context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'
import getErrorsByCollection from '@utils/getErrorsByCollection'

export type CustomerActionType =
  | 'setErrors'
  | 'setCustomerEmail'
  | 'setAddresses'

export interface CustomerActionPayload {
  addresses: AddressCollection[]
  customerEmail: string
  errors: BaseError[]
}

export type CustomerState = Partial<CustomerActionPayload>

export interface CustomerAction {
  type: CustomerActionType
  payload: Partial<CustomerActionPayload>
}

export type SetSaveOnBlur = (args: {
  saveOnBlur: boolean
  dispatch: Dispatch<CustomerAction>
}) => void

export type SaveCustomerUser = (args: {
  config: CommerceLayerConfig
  customerEmail: string
  dispatch: Dispatch<CustomerAction>
  order: OrderCollection | null
  getOrder: getOrderContext
}) => Promise<void>

export const saveCustomerUser: SaveCustomerUser = async ({
  config,
  customerEmail,
  dispatch,
  order,
  getOrder,
}) => {
  try {
    if (order) {
      const orderId = order.id
      await order.withCredentials(config).update({ customerEmail })
      getOrder(orderId)
      dispatch({
        type: 'setCustomerEmail',
        payload: { customerEmail },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

export interface SetCustomerErrors {
  <V extends BaseError[]>(errors: V, dispatch?: Dispatch<CustomerAction>): void
}

export const setCustomerErrors: SetCustomerErrors = (errors, dispatch) => {
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
}

export type SetCustomerEmail = (
  customerEmail: string,
  dispatch?: Dispatch<CustomerAction>
) => void

export const setCustomerEmail: SetCustomerEmail = (customerEmail, dispatch) => {
  dispatch &&
    dispatch({
      type: 'setCustomerEmail',
      payload: {
        customerEmail,
      },
    })
}

export type GetCustomerAddresses = (params: {
  config: CommerceLayerConfig
  dispatch: Dispatch<CustomerAction>
}) => Promise<void>

export const getCustomerAddresses: GetCustomerAddresses = async ({
  config,
  dispatch,
}) => {
  try {
    const customerAddresses = await CustomerAddress.withCredentials(config)
      .includes('address')
      .all()
    const addresses = customerAddresses
      .toArray()
      .map((customerAddress) => customerAddress.address() as any)
    dispatch({
      type: 'setAddresses',
      payload: { addresses },
    })
  } catch (col) {
    const errors = getErrorsByCollection(col, 'address')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  }
}

export const customerInitialState: CustomerState = {
  errors: [],
  addresses: [],
}

const type: CustomerActionType[] = [
  'setErrors',
  'setCustomerEmail',
  'setAddresses',
]

const customerReducer = (
  state: CustomerState,
  reducer: CustomerAction
): CustomerState =>
  baseReducer<CustomerState, CustomerAction, CustomerActionType[]>(
    state,
    reducer,
    type
  )

export default customerReducer

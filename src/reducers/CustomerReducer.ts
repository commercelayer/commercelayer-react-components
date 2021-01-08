import baseReducer from '@utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '@typings/errors'
import { OrderCollection } from '@commercelayer/js-sdk'
import { CommerceLayerConfig } from '@context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'

export type CustomerActionType = 'setErrors' | 'setCustomerEmail'

export interface CustomerActionPayload {
  errors: BaseError[]
  customerEmail: string
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

export const customerInitialState: CustomerState = {
  errors: [],
}

const type: CustomerActionType[] = ['setErrors', 'setCustomerEmail']

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

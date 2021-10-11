import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import {
  AddressCollection,
  CustomerAddress,
  CustomerPaymentSourceCollection,
  Order,
  OrderCollection,
} from '@commercelayer/js-sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import { isEmpty } from 'lodash'

export type CustomerActionType =
  | 'setErrors'
  | 'setCustomerEmail'
  | 'setAddresses'
  | 'setPayments'

export interface CustomerActionPayload {
  addresses: AddressCollection[]
  payments: CustomerPaymentSourceCollection[]
  customerEmail: string
  errors: BaseError[]
  isGuest: boolean
  getCustomerPaymentSources: () => Promise<void>
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
  order?: OrderCollection
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
      const o = await Order.build({ id: order.id })
      await o.withCredentials(config).update({ customerEmail })
      getOrder(order.id)
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
    const addresses: any = customerAddresses
      .toArray()
      .map((customerAddress) => customerAddress.address())
    dispatch({
      type: 'setAddresses',
      payload: { addresses },
    })
  } catch (col: any) {
    const errors = getErrorsByCollection(col, 'address')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  }
}

export type GetCustomerPaymentSources = (params: {
  config: CommerceLayerConfig
  dispatch: Dispatch<CustomerAction>
  order?: OrderCollection
}) => Promise<void>

export const getCustomerPaymentSources: GetCustomerPaymentSources = async ({
  config,
  dispatch,
  order,
}) => {
  try {
    if (config && order) {
      const payments: CustomerPaymentSourceCollection[] | undefined = (
        await order
          .availableCustomerPaymentSources()
          ?.includes('paymentSource')
          ?.load()
      )?.toArray()
      if (!isEmpty(payments) && payments) {
        dispatch({
          type: 'setPayments',
          payload: { payments },
        })
      }
    }
  } catch (col: any) {
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
  payments: [],
}

const type: CustomerActionType[] = [
  'setErrors',
  'setCustomerEmail',
  'setAddresses',
  'setPayments',
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

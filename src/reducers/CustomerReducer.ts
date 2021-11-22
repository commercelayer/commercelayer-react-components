import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import {
  Address,
  CustomerPaymentSource,
  Order,
  OrderUpdate,
} from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { updateOrder } from './OrderReducer'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'

export type CustomerActionType =
  | 'setErrors'
  | 'setCustomerEmail'
  | 'setAddresses'
  | 'setPayments'

export interface CustomerActionPayload {
  addresses: Address[]
  payments: CustomerPaymentSource[]
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
  order?: Order
  updateOrder: typeof updateOrder
}) => void

export const saveCustomerUser: SaveCustomerUser = async ({
  customerEmail,
  order,
  updateOrder,
}) => {
  if (order) {
    const attributes: OrderUpdate = {
      customer_email: customerEmail,
      id: order.id,
    }
    await updateOrder({ id: order.id, attributes })
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
    const addresses = [] as Address[]
    const sdk = getSdk(config)
    const customerAddresses = await sdk.customer_addresses.list({
      include: ['address'],
    })
    customerAddresses.forEach((customerAddress) => {
      if (customerAddress.address) addresses.push(customerAddress.address)
    })
    dispatch({
      type: 'setAddresses',
      payload: { addresses },
    })
  } catch (error) {
    const errors = getErrors(error, 'addresses')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  }
}

export type GetCustomerPaymentSources = (params: {
  dispatch: Dispatch<CustomerAction>
  order?: Order
}) => Promise<void>

export const getCustomerPaymentSources: GetCustomerPaymentSources = async ({
  dispatch,
  order,
}) => {
  if (order?.available_customer_payment_sources) {
    dispatch({
      type: 'setPayments',
      payload: { payments: order.available_customer_payment_sources },
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

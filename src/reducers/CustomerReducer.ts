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
  | 'setOrders'

export interface CustomerActionPayload {
  addresses: Address[]
  payments: CustomerPaymentSource[]
  customerEmail: string
  errors: BaseError[]
  orders: OrderAttributes[]
  isGuest: boolean
  getCustomerPaymentSources: () => Promise<void>
  attributes: {
    email: string
  }
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

export type DeleteCustomerAddress = (args: {
  config?: CommerceLayerConfig
  dispatch?: Dispatch<CustomerAction>
  customerAddressId: string
  addresses?: AddressCollection[]
}) => void

export const deleteCustomerAddress: DeleteCustomerAddress = async ({
  config,
  dispatch,
  customerAddressId,
  addresses,
}) => {
  if (config && addresses && dispatch && config) {
    try {
      await CustomerAddress.build({ id: customerAddressId })
        .withCredentials(config)
        .destroy()
      const newAddresses = addresses.filter(
        ({ customerAddressId: customerId }) => customerId !== customerAddressId
      )
      dispatch({
        type: 'setAddresses',
        payload: {
          addresses: newAddresses,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }
}

export type GetCustomerPaymentSources = (params: {
  dispatch: Dispatch<CustomerAction>
  order: Order
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

export type GetCustomerOrders = (params: {
  config: CommerceLayerConfig
  dispatch: Dispatch<CustomerAction>
}) => Promise<void>

export const getCustomerOrders: GetCustomerOrders = async ({
  config,
  dispatch,
}) => {
  const { owner } = jwtDecode<Jwt>(config.accessToken)
  if (owner?.id) {
    // TODO: Change with customers/customer_id/orders with new SDK and filter them directly.
    const getOrders = await Customer.withCredentials(config)
      .includes('orders')
      .find(owner?.id, { rawResponse: true })
    const attributes = { email: getOrders.data.attributes.email }
    const orders = getOrders?.included
      ?.filter(
        (order) => !['pending', 'draft'].includes(order.attributes.status)
      )
      .map((order) => {
        return {
          id: order.id,
          ...order.attributes,
        } as OrderAttributes
      })
    dispatch({
      type: 'setOrders',
      payload: { orders, attributes },
    })
  }
}

export const customerInitialState: CustomerState = {
  errors: [],
  addresses: [],
  payments: [],
  orders: [],
}

const type: CustomerActionType[] = [
  'setErrors',
  'setCustomerEmail',
  'setAddresses',
  'setPayments',
  'setOrders',
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

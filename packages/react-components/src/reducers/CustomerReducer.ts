import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import type {
  Address,
  AddressCreate,
  AddressUpdate,
  Customer,
  CustomerPaymentSource,
  Order,
  OrderUpdate
} from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { updateOrder } from './OrderReducer'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'
import jwtDecode from '#utils/jwt'

export type CustomerActionType =
  | 'setErrors'
  | 'setCustomerEmail'
  | 'setAddresses'
  | 'setPayments'
  | 'setOrders'

export interface CustomerActionPayload {
  addresses: Address[] | null
  payments: CustomerPaymentSource[]
  customerEmail: string
  errors: BaseError[]
  orders: Order[]
  isGuest: boolean
  customers: Customer
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

export interface SaveCustomerUser {
  /**
   * The Commerce Layer Config
   */
  config: CommerceLayerConfig
  /**
   * The customer email
   */
  customerEmail: string
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<CustomerAction>
  /**
   * The Commerce Layer Order resource
   */
  order?: Order
  /**
   * The function to update the order resource
   */
  updateOrder: typeof updateOrder
}

export async function saveCustomerUser({
  customerEmail,
  order,
  updateOrder
}: SaveCustomerUser): Promise<void> {
  if (order) {
    const attributes: OrderUpdate = {
      customer_email: customerEmail,
      id: order.id
    }
    await updateOrder({ id: order.id, attributes })
  }
}

export type SetCustomerErrors = <V extends BaseError[]>(
  errors: V,
  dispatch?: Dispatch<CustomerAction>
) => void

export function setCustomerErrors(
  /**
   * @param errors - An array of errors
   */
  errors: BaseError[],
  /**
   * @param dispatch - The dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
): void {
  if (dispatch)
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
}

export function setCustomerEmail(
  /**
   * @param customerEmail The email address of the customer
   */
  customerEmail: string,
  /**
   * @param dispatch The dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
): void {
  if (dispatch)
    dispatch({
      type: 'setCustomerEmail',
      payload: {
        customerEmail
      }
    })
}

export interface GetCustomerAddresses {
  /**
   * The Commerce Layer config
   */
  config: CommerceLayerConfig
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<CustomerAction>
}

export async function getCustomerAddresses({
  config,
  dispatch
}: GetCustomerAddresses): Promise<void> {
  try {
    const addresses = [] as Address[]
    const sdk = getSdk(config)
    const customerAddresses = await sdk.customer_addresses.list({
      include: ['address']
    })
    customerAddresses.forEach((customerAddress) => {
      if (customerAddress.address) addresses.push(customerAddress.address)
    })
    addresses.sort((a, b) => {
      if (a.full_name && b.full_name)
        return a.full_name.localeCompare(b.full_name)
      return 0
    })
    dispatch({
      type: 'setAddresses',
      payload: { addresses }
    })
  } catch (error) {
    const errors = getErrors(error, 'addresses')
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

export interface DeleteCustomerAddress {
  config?: CommerceLayerConfig
  dispatch?: Dispatch<CustomerAction>
  customerAddressId: string
  addresses?: Address[] | null
}

export async function deleteCustomerAddress({
  config,
  dispatch,
  customerAddressId,
  addresses
}: DeleteCustomerAddress): Promise<void> {
  if (config && addresses && dispatch && config) {
    try {
      const sdk = getSdk(config)
      await sdk.customer_addresses.delete(customerAddressId)
      const newAddresses = addresses.filter(
        ({ reference }) => reference !== customerAddressId
      )
      dispatch({
        type: 'setAddresses',
        payload: {
          addresses: newAddresses
        }
      })
    } catch (error) {
      throw new Error("Couldn't delete address")
    }
  }
}

export interface GetCustomerPaymentSources {
  /**
   * The Customer dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
  /**
   * The Commerce Layer Order resource
   */
  order?: Order
}

export function getCustomerPaymentSources(
  params?: GetCustomerPaymentSources
): void {
  if (params) {
    const { order, dispatch } = params
    if (order?.available_customer_payment_sources && dispatch) {
      dispatch({
        type: 'setPayments',
        payload: { payments: order.available_customer_payment_sources }
      })
    }
  }
}

export type GetCustomerOrders = (params: {
  /**
   * The Commerce Layer config
   */
  config: CommerceLayerConfig
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<CustomerAction>
}) => Promise<void>

export const getCustomerOrders: GetCustomerOrders = async ({
  config,
  dispatch
}) => {
  if (config.accessToken) {
    const { owner } = jwtDecode(config.accessToken)
    if (owner?.id) {
      const sdk = getSdk(config)
      const customers = await sdk.customers.retrieve(owner.id, {
        include: ['orders']
      })
      const orders = customers.orders?.filter(
        (order) => order.status !== 'pending' && order.status !== 'draft'
      )
      dispatch({
        type: 'setOrders',
        payload: { orders, customers }
      })
    }
  }
}

export type TCustomerAddress = AddressCreate & AddressUpdate

interface TCreateCustomerAddress {
  /**
   * Customer address dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
  /**
   * The Commerce Layer Config
   */
  config?: CommerceLayerConfig
  /**
   * The address to create or update if there is an id
   */
  address: TCustomerAddress
  /**
   * Current state of the customer
   */
  state?: CustomerState
}

export async function createCustomerAddress({
  address,
  config,
  dispatch,
  state
}: TCreateCustomerAddress): Promise<void> {
  if (config && address) {
    const sdk = getSdk(config)
    const { id } = address
    try {
      if (id) {
        const upAddress = await sdk.addresses.update(address)
        const updatedAddresses = state?.addresses?.map((a) => {
          if (a.id === upAddress.id) return upAddress
          return a
        })
        if (dispatch) {
          dispatch({
            type: 'setAddresses',
            payload: { addresses: updatedAddresses }
          })
        }
      } else {
        const newAddress = await sdk.addresses.create(address)
        if (state?.customers?.id && newAddress?.id) {
          const newCustomerAddress = await sdk.customer_addresses.create({
            customer: sdk.customers.relationship(state?.customers?.id),
            address: sdk.addresses.relationship(newAddress.id)
          })
          await sdk.addresses.update({
            id: newAddress.id,
            reference: newCustomerAddress.id
          })
          if (dispatch && state?.addresses) {
            newAddress.reference = newCustomerAddress.id
            dispatch({
              type: 'setAddresses',
              payload: { addresses: [...state.addresses, newAddress] }
            })
          }
        }
      }
    } catch (error) {
      throw new Error("Couldn't create customer address")
    }
  }
}

export const customerInitialState: CustomerState = {
  errors: [],
  addresses: null,
  payments: []
}

const type: CustomerActionType[] = [
  'setErrors',
  'setCustomerEmail',
  'setAddresses',
  'setPayments',
  'setOrders'
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

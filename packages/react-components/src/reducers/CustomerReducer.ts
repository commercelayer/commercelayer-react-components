import baseReducer from '#utils/baseReducer'
import type { Dispatch } from 'react'
import type { BaseError } from '#typings/errors'
import type {
  Address,
  AddressCreate,
  AddressUpdate,
  Customer,
  CustomerPaymentSource,
  ListResponse,
  Order,
  OrderSubscription,
  OrderUpdate,
  QueryPageSize
} from '@commercelayer/sdk'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { updateOrder } from './OrderReducer'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'
import { jwt } from '#utils/jwt'
import { getCustomerIdByToken } from '#utils/getCustomerIdByToken'
import {
  type TriggerAttributeHelper,
  triggerAttributeHelper
} from '#utils/triggerAttributeHelper'
import { sanitizeMetadataFields } from '#utils/addressesManager'

export type CustomerActionType =
  | 'setErrors'
  | 'setCustomerEmail'
  | 'setAddresses'
  | 'setPayments'
  | 'setOrders'
  | 'setSubscriptions'
  | 'setCustomers'

export interface CustomerActionPayload {
  addresses: Address[] | null
  payments: CustomerPaymentSource[] | null
  customerEmail: string
  errors: BaseError[]
  orders: ListResponse<Order>
  subscriptions: ListResponse<OrderSubscription> | ListResponse<Order> | null
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
  /**
   * Order details
   */
  isOrderAvailable?: boolean
  /**
   * The page size
   * default: 10
   */
  pageSize?: QueryPageSize
}

export async function getCustomerAddresses({
  config,
  dispatch,
  isOrderAvailable,
  pageSize = 10
}: GetCustomerAddresses): Promise<void> {
  try {
    const addresses = [] as Address[]
    const sdk = getSdk(config)
    const customerAddresses = await sdk.customer_addresses.list({
      include: ['address'],
      pageSize
    })
    customerAddresses.forEach((customerAddress) => {
      if (customerAddress.address) {
        if (customerAddress.address.reference == null) {
          customerAddress.address.reference = customerAddress.id
        }
        if (
          customerAddress.id !== customerAddress.address.reference &&
          !isOrderAvailable
        ) {
          customerAddress.address.reference = customerAddress.id
        }
        addresses.push(customerAddress.address)
      }
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
  } catch (error: any) {
    const errors = getErrors({ error, resource: 'addresses' })
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
    const payments = order?.available_customer_payment_sources
    if (payments != null && payments.length > 0 && dispatch) {
      dispatch({
        type: 'setPayments',
        payload: { payments }
      })
    }
  }
}

interface GetCustomerOrdersProps {
  /**
   * The Commerce Layer config
   */
  config: CommerceLayerConfig
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<CustomerAction>
  /**
   * The page size
   */
  pageSize?: QueryPageSize
  /**
   * The page number
   */
  pageNumber?: number
  /**
   * Retrieve a specific subscription or order by id
   */
  id?: string
}

export async function getCustomerOrders({
  config,
  dispatch,
  pageSize = 10,
  pageNumber = 1
}: GetCustomerOrdersProps): Promise<void> {
  if (config.accessToken) {
    const { owner } = jwt(config.accessToken)
    if (owner?.id) {
      const sdk = getSdk(config)
      const orders = await sdk.customers.orders(owner.id, {
        filters: { status_not_in: 'draft,pending' },
        pageSize,
        pageNumber
      })
      dispatch({
        type: 'setOrders',
        payload: { orders }
      })
    }
  }
}

export async function getCustomerSubscriptions({
  id,
  config,
  dispatch,
  pageSize = 10,
  pageNumber = 1
}: GetCustomerOrdersProps): Promise<void> {
  if (config.accessToken) {
    const { owner } = jwt(config.accessToken)
    if (owner?.id) {
      const sdk = getSdk(config)
      if (id != null) {
        const subscriptions = await sdk.customers.orders(owner.id, {
          filters: { order_subscription_id_eq: id },
          include: ['authorizations'],
          pageSize,
          pageNumber
        })
        dispatch({
          type: 'setSubscriptions',
          payload: { subscriptions }
        })
      } else {
        const subscriptions = await sdk.customers.order_subscriptions(
          owner.id,
          {
            pageSize,
            pageNumber
          }
        )
        dispatch({
          type: 'setSubscriptions',
          payload: { subscriptions }
        })
      }
    }
  }
}

export type TCustomerAddress = AddressCreate &
  AddressUpdate &
  Record<string, string | null | undefined>

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
        const addressWithMeta = sanitizeMetadataFields(address) as AddressUpdate
        const upAddress = await sdk.addresses.update(addressWithMeta)
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
        const addressWithMeta = sanitizeMetadataFields(address)
        const newAddress = await sdk.addresses.create(addressWithMeta)
        if (state?.customers?.id && newAddress?.id) {
          // @ts-expect-error Expected customer_email
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

interface GetCustomerPaymentsParams extends GetCustomerOrdersProps {}

export async function getCustomerPayments({
  config,
  dispatch,
  pageSize = 10,
  pageNumber = 1
}: GetCustomerPaymentsParams): Promise<void> {
  if (config?.accessToken != null && dispatch != null) {
    const sdk = getSdk(config)
    const { owner } = jwt(config.accessToken)
    if (owner?.id) {
      const payments = await sdk.customer_payment_sources.list({
        include: ['payment_source'],
        pageNumber,
        pageSize
      })
      dispatch({
        type: 'setPayments',
        payload: {
          payments
        }
      })
    }
  }
}

export async function getCustomerInfo({
  config,
  dispatch
}: GetCustomerPaymentsParams): Promise<void> {
  if (config.accessToken && dispatch != null) {
    const sdk = getSdk(config)
    const customerId = getCustomerIdByToken(config.accessToken)
    if (customerId) {
      const customers = await sdk.customers.retrieve(customerId)
      const customerEmail = customers.email
      dispatch({
        type: 'setCustomers',
        payload: {
          customers,
          customerEmail
        }
      })
    }
  }
}

export type SetResourceTriggerParams = {
  /**
   * The CommerceLayer config
   */
  config?: CommerceLayerConfig
  /**
   * The dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
  /**
   * The page size
   */
  pageSize?: QueryPageSize
  /**
   * The page number
   */
  pageNumber?: number
  /**
   *  Reload the list of orders or subscriptions if the trigger is successful. Default: false
   */
  reloadList?: boolean
} & TriggerAttributeHelper

/**
 * Helper to trigger and activate an attribute on a resource
 */
export async function setResourceTrigger({
  config,
  dispatch,
  resource,
  attribute,
  id,
  pageSize = 10,
  pageNumber = 1,
  reloadList = false
}: SetResourceTriggerParams): Promise<boolean> {
  if (config.accessToken) {
    const { owner } = jwt(config.accessToken)
    if (owner?.id) {
      const params = {
        config,
        resource,
        attribute,
        id
      }
      const response = await triggerAttributeHelper(
        params as TriggerAttributeHelper
      )
      if (response != null && dispatch != null && reloadList) {
        switch (resource) {
          case 'orders':
            await getCustomerOrders({
              config,
              dispatch,
              pageSize,
              pageNumber
            })
            break
          case 'order_subscriptions':
            await getCustomerSubscriptions({
              config,
              dispatch,
              pageSize,
              pageNumber
            })
            break
          default:
            return false
        }
        return true
      }
    }
  }
  return false
}

export const customerInitialState: CustomerState = {
  errors: [],
  addresses: null,
  payments: null
}

const type: CustomerActionType[] = [
  'setErrors',
  'setCustomerEmail',
  'setAddresses',
  'setPayments',
  'setOrders',
  'setSubscriptions',
  'setCustomers'
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

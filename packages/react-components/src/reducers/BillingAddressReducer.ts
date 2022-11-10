import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { AddressUpdate, Order } from '@commercelayer/sdk'
import getSdk from '#utils/getSdk'
import { AddressResource } from './AddressReducer'

export type BillingAddressActionType =
  | 'setBillingAddress'
  | 'setBillingCustomerAddressId'
  | 'cleanup'

export interface BillingAddressActionPayload {
  _billing_address_clone_id: string
  billingCustomerAddressId: string
}

export type BillingAddressState = Partial<BillingAddressActionPayload>

export interface BillingAddressAction {
  type: BillingAddressActionType
  payload: Partial<BillingAddressActionPayload>
}

export const billingAddressInitialState: BillingAddressState = {
  _billing_address_clone_id: '',
}

export type SetBillingAddress = (
  id: string,
  options?: {
    config: CommerceLayerConfig
    dispatch: Dispatch<BillingAddressAction>
    order?: Order
    shipToDifferentAddress?: boolean
    customerAddressId?: string
  }
) => Promise<void>

export const setBillingAddress: SetBillingAddress = async (id, options) => {
  try {
    if (options?.order) {
      if (options.customerAddressId) {
        const sdk = getSdk(options.config)
        const attributes: AddressUpdate = {
          id,
          reference: options.customerAddressId,
        }
        await sdk.addresses.update(attributes)
      }
      options.dispatch({
        type: 'setBillingAddress',
        payload: {
          _billing_address_clone_id: id,
        },
      })
    }
  } catch (error) {
    console.error('Set billing address', error)
  }
}

type SetBillingCustomerAddressId = (args: {
  dispatch: Dispatch<BillingAddressAction>
  order: Order
  setCloneAddress: (id: string, resource: AddressResource) => void
}) => void

export const setBillingCustomerAddressId: SetBillingCustomerAddressId = async ({
  dispatch,
  order,
  setCloneAddress,
}) => {
  const customerAddressId = order?.billing_address?.reference
  try {
    if (customerAddressId) {
      dispatch({
        type: 'setBillingCustomerAddressId',
        payload: { billingCustomerAddressId: customerAddressId },
      })
      setCloneAddress(customerAddressId, 'billing_address')
    }
  } catch (error) {
    console.error('error', error)
  }
}

const type: BillingAddressActionType[] = [
  'setBillingAddress',
  'setBillingCustomerAddressId',
  'cleanup',
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

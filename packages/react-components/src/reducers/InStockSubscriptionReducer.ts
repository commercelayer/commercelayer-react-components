import baseReducer from '#utils/baseReducer'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import getSdk from '#utils/getSdk'
import type { BaseAction } from '#typings'
import type { Dispatch } from 'react'
import type { BaseError } from '#typings/errors'
import type { InStockSubscriptionCreate } from '@commercelayer/sdk'
import getErrors from '#utils/getErrors'

type InStockSubscriptionActionType = 'setErrors'
type InStockSubscriptionAction = BaseAction<
  InStockSubscriptionActionType,
  InStockSubscriptionState
>
export interface InStockSubscriptionState {
  errors?: BaseError[]
}

const actionType: InStockSubscriptionActionType[] = ['setErrors']

export const inStockSubscriptionInitialState: InStockSubscriptionState = {
  errors: []
}

interface TSetInStockSubscriptionParams {
  /**
   * Commerce Layer config
   */
  config?: CommerceLayerConfig
  /**
   * Customer email
   */
  customerEmail?: string
  /**
   * Sku code
   */
  skuCode: string
  /**
   * Dispatch function
   */
  dispatch?: Dispatch<InStockSubscriptionAction>
}

export async function setInStockSubscription<
  T extends TSetInStockSubscriptionParams
>({
  config,
  customerEmail,
  skuCode,
  dispatch
}: T): Promise<{ success: boolean }> {
  try {
    if (config == null) throw new Error('Access token and endpoint is required')
    const sdk = getSdk(config)
    // @ts-expect-error OpenAPI schema is not updated
    const attributes: InStockSubscriptionCreate = {
      sku_code: skuCode
    }
    if (customerEmail != null) {
      attributes.customer_email = customerEmail
    }
    await sdk.in_stock_subscriptions.create(attributes)
    return { success: true }
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: 'in_stock_subscriptions'
    })
    if (dispatch != null) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors
        }
      })
    }
    return { success: false }
  }
}

export default function inStockSubscriptionReducer(
  state: InStockSubscriptionState,
  reducer: InStockSubscriptionAction
): InStockSubscriptionState {
  return baseReducer<
    InStockSubscriptionState,
    InStockSubscriptionAction,
    InStockSubscriptionActionType[]
  >(state, reducer, actionType)
}

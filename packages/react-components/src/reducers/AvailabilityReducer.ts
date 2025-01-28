import baseReducer from '#utils/baseReducer'
import type { BaseError } from '#typings/errors'
import type { Sku } from '@commercelayer/sdk'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { Dispatch } from 'react'
import getSdk from '#utils/getSdk'

export interface DeliveryLeadTime {
  shipping_method: {
    name: string
    reference: string
    price_amount_cents: number
    free_over_amount_cents: number
    formatted_price_amount: string
    formatted_free_over_amount: string
  }
  min: LeadTimes
  max: LeadTimes
}

interface Level {
  delivery_lead_times: Partial<DeliveryLeadTime>[]
  quantity: number
}

interface Inventory {
  inventory: {
    available: boolean
    quantity: number
    levels: Level[]
  }
}

export type SkuInventory = Sku & Inventory

export interface LeadTimes {
  hours: number
  days: number
}

export type AvailabilityPayload = {
  skuCode?: string
  quantity?: number
  errors?: BaseError[]
  parent?: boolean
} & Partial<DeliveryLeadTime>

export type AvailabilityState = AvailabilityPayload

export interface AvailabilityAction {
  type: AvailabilityActionType
  payload: AvailabilityPayload
}

export const availabilityInitialState: AvailabilityState = {}

export async function getAvailability({
  skuCode,
  skuId,
  dispatch,
  config
}: {
  skuCode?: string
  skuId?: string
  dispatch: Dispatch<AvailabilityAction>
  config: CommerceLayerConfig
}): Promise<void> {
  const sdk = getSdk(config)
  try {
    const [sku] =
      skuId != null
        ? [{ id: skuId }]
        : skuCode != null
          ? await sdk.skus.list({
              fields: { skus: ['id'] },
              filters: { code_in: skuCode }
            })
          : []
    if (sku) {
      const skuInventory = (await sdk.skus.retrieve(sku.id, {
        fields: { skus: ['inventory'] }
      })) as SkuInventory
      const [level] = skuInventory.inventory?.levels || []
      const [delivery] = level?.delivery_lead_times || []
      dispatch({
        type: 'setAvailability',
        payload: {
          ...delivery,
          quantity: skuInventory.inventory.quantity,
          skuCode
        }
      })
    }
  } catch (error) {
    console.error('Get SKU availability', error)
  }
}

export type AvailabilityActionType = 'setAvailability' | 'setErrors'

const typeAction: AvailabilityActionType[] = ['setAvailability', 'setErrors']

const availabilityReducer = (
  state: AvailabilityState,
  reducer: AvailabilityAction
): AvailabilityState =>
  baseReducer<AvailabilityState, AvailabilityAction, AvailabilityActionType[]>(
    state,
    reducer,
    typeAction
  )

export default availabilityReducer

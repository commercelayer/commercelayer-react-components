import baseReducer from '#utils/baseReducer'
import { BaseError } from '#typings/errors'
import { Sku } from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Dispatch } from 'react'
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
  delivery_lead_times: Array<Partial<DeliveryLeadTime>>
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
  dispatch,
  config
}: {
  skuCode: string
  dispatch: Dispatch<AvailabilityAction>
  config: CommerceLayerConfig
}): Promise<void> {
  const sdk = getSdk(config)
  try {
    const [sku] = await sdk.skus.list({
      fields: { skus: ['id'] },
      filters: { code_in: skuCode }
    })
    if (sku) {
      const skuInventory = (await sdk.skus.retrieve(sku.id, {
        fields: { skus: ['inventory'] }
      })) as SkuInventory
      const [level] = skuInventory.inventory?.levels || []
      const [delivery] = level?.delivery_lead_times || []
      dispatch({
        type: 'setAvailability',
        payload: { ...delivery, quantity: skuInventory.inventory.quantity }
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

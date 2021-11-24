import baseReducer from '#utils/baseReducer'
import { BaseError } from '#typings/errors'
import { Sku } from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Dispatch } from 'react'
import getSdk from '#utils/getSdk'

export type DeliveryLeadTime = {
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

type Level = {
  delivery_lead_times: Partial<DeliveryLeadTime>[]
  quantity: number
}

type Inventory = {
  inventory: {
    available: boolean
    quantity: number
    levels: Level[]
  }
}

export type SkuInventory = Sku & Inventory

export type LeadTimes = {
  hours: number
  days: number
}

export type AvailabilityPayload = {
  quantity?: number | null
  errors?: BaseError[]
} & Partial<DeliveryLeadTime>

export type AvailabilityState = AvailabilityPayload

export interface AvailabilityAction {
  type: AvailabilityActionType
  payload: AvailabilityPayload
}

export const availabilityInitialState: AvailabilityState = {
  quantity: null,
  min: {
    days: 0,
    hours: 0,
  },
  max: {
    days: 0,
    hours: 0,
  },
  errors: [],
}

interface GetAvailability {
  (args: {
    skuCode: string
    dispatch: Dispatch<AvailabilityAction>
    config: CommerceLayerConfig
  }): void
}

export const getAvailability: GetAvailability = async ({
  skuCode,
  dispatch,
  config,
}) => {
  const sdk = getSdk(config)
  try {
    const [sku] = await sdk.skus.list({
      fields: { skus: ['id'] },
      filters: { code_in: skuCode },
    })
    const skuInventory = (await sdk.skus.retrieve(sku.id, {
      fields: { skus: ['inventory'] },
    })) as SkuInventory
    const [level] = skuInventory.inventory?.levels || []
    const [delivery] = level?.delivery_lead_times || []
    dispatch({
      type: 'setAvailability',
      payload: { ...delivery, quantity: skuInventory.inventory.quantity },
    })
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

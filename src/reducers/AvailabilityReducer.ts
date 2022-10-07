import baseReducer from '#utils/baseReducer'
import { BaseError } from '#typings/errors'
import { Sku } from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Dispatch } from 'react'
import getSdk from '#utils/getSdk'
import { Items } from '#reducers/ItemReducer'

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
    hours: 0
  },
  max: {
    days: 0,
    hours: 0
  },
  errors: []
}

type GetAvailability = (args: {
  skuCode: string
  dispatch: Dispatch<AvailabilityAction>
  config: CommerceLayerConfig
  setItem?: (item: Items) => void
  item?: Items
}) => void

export const getAvailability: GetAvailability = async ({
  skuCode,
  dispatch,
  config,
  setItem,
  item
}) => {
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
      if (setItem) setItem({ ...item, [skuCode]: skuInventory })
    }
  } catch (error) {
    console.error('Get SKU availability', error)
  }
}

interface GetAvailabilityArgs {
  skusIds: string[]
  dispatch: Dispatch<AvailabilityAction>
  config: CommerceLayerConfig
  setItem?: (item: Items) => void
}

export async function getAvailabilityByIds({
  skusIds,
  config,
  setItem
}: GetAvailabilityArgs) {
  const sdk = getSdk(config)
  try {
    const inventories = await Promise.all(
      skusIds.map(async (id) => {
        return (await sdk.skus.retrieve(id, {
          fields: { skus: ['inventory', 'code'] }
        })) as SkuInventory
      })
    )
    const item = {} as Items
    inventories.forEach((v) => {
      if (v?.code) {
        item[v.code] = v
      }
    })
    if (setItem) setItem(item)
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

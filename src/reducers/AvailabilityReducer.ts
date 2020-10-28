import baseReducer from '../utils/baseReducer'
import { BaseError } from '../typings/errors'
import { Sku } from '@commercelayer/js-sdk'
import _ from 'lodash'
import { CommerceLayerConfig } from 'context/CommerceLayerContext'
import { Dispatch } from 'react'

export interface LeadTimes {
  hours: number
  days: number
}

export interface ShippingMethod {
  name: string
  reference: null | string
  priceAmountCents: number
  freeOverAmountCents: null | number
  formattedPriceAmount: string
  formattedFreeOverAmount: null | string
}

export interface AvailabilityPayload {
  quantity?: number | null
  shippingMethod?: ShippingMethod
  errors?: BaseError[]
}

export interface AvailabilityState extends AvailabilityPayload {
  min: LeadTimes
  max: LeadTimes
}

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
  const sku = await Sku.withCredentials(config)
    .select('id')
    .where({ codeIn: skuCode })
    .first()
  const inventorySku = await Sku.withCredentials(config)
    .select('inventory')
    .find(sku.id)
  const firstLevel = _.first(inventorySku?.inventory?.levels)
  const firstDelivery = _.first(firstLevel?.deliveryLeadTimes)
  dispatch({
    type: 'setAvailability',
    payload: { ...firstDelivery, quantity: firstLevel?.quantity },
  })
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

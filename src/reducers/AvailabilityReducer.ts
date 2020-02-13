import baseReducer from '../utils/baseReducer'

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

export interface AvailabilityState {
  shippingMethod?: ShippingMethod
  min?: LeadTimes
  max?: LeadTimes
}

export interface AvailabilityAction {
  type: 'setAvailability'
  payload: AvailabilityState
}

export const availabilityInitialState: AvailabilityState = {}

export type AvailabilityActionType = 'setAvailability'

const typeAction: AvailabilityActionType[] = ['setAvailability']

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

import { BaseReducer, BaseAction } from '../@types/index'

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

export interface AvailabilityAction extends BaseAction {
  type: 'setAvailability'
}

export const availabilityInitialState: AvailabilityState = {}

const availabilityReducer: BaseReducer<
  AvailabilityState,
  AvailabilityAction
> = (state, action) => {
  const actions = ['setAvailability']
  if (actions.indexOf(action.type) !== -1) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default availabilityReducer

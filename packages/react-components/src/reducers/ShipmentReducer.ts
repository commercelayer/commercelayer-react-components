import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { DeliveryLeadTime, LineItem, Order, Shipment } from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'
import getSdk from '#utils/getSdk'

export type ShipmentActionType =
  | 'setErrors'
  | 'setShipments'
  | 'setShippingMethod'

export type ShipmentLineItem = LineItem & { line_item: LineItem }

export interface ShipmentActionPayload {
  errors: BaseError[]
  shipments: Shipment[]
  deliveryLeadTimes: DeliveryLeadTime[]
}

export type ShipmentState = Partial<ShipmentActionPayload>

export interface ShipmentAction {
  type: ShipmentActionType
  payload: Partial<ShipmentActionPayload>
}

export const shipmentInitialState: ShipmentState = {
  errors: []
}

export type SetShipmentErrors = <V extends BaseError[]>(
  errors: V,
  dispatch?: Dispatch<ShipmentAction>
) => void

export const setShipmentErrors: SetShipmentErrors = (errors, dispatch) => {
  if (dispatch) {
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

type GetShipments = (args: {
  order: Order
  dispatch: Dispatch<ShipmentAction>
  config: CommerceLayerConfig
}) => Promise<void>

export const getShipments: GetShipments = async ({
  order,
  dispatch,
  config
}) => {
  try {
    const sdk = getSdk(config)
    const shipments = order.shipments
    const deliveryLeadTimes = await sdk.delivery_lead_times.list({
      include: ['shipping_method', 'stock_location']
    })
    dispatch({
      type: 'setShipments',
      payload: {
        shipments,
        deliveryLeadTimes
      }
    })
  } catch (error) {
    console.error(error)
  }
}

interface TSetShippingMethodParams {
  config: CommerceLayerConfig
  shipmentId: string
  shippingMethodId: string
  order?: Order
  getOrder?: getOrderContext
}

export async function setShippingMethod({
  config,
  shipmentId,
  shippingMethodId,
  getOrder,
  order
}: TSetShippingMethodParams): Promise<{ success: boolean; order?: Order }> {
  try {
    if (shippingMethodId) {
      const sdk = getSdk(config)
      await sdk.shipments.update({
        id: shipmentId,
        shipping_method: sdk.shipping_methods.relationship(shippingMethodId)
      })
      if (getOrder != null && order != null) {
        const currentOrder = await getOrder(order.id)
        return { success: true, order: currentOrder }
      }
    }
    return { success: false }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

const type: ShipmentActionType[] = [
  'setErrors',
  'setShipments',
  'setShippingMethod'
]

const shipmentReducer = (
  state: ShipmentState,
  reducer: ShipmentAction
): ShipmentState =>
  baseReducer<ShipmentState, ShipmentAction, ShipmentActionType[]>(
    state,
    reducer,
    type
  )

export default shipmentReducer

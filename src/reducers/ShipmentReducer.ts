import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import {
  OrderCollection,
  Shipment,
  ShipmentCollection,
  ShippingMethod,
} from '@commercelayer/js-sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'

export type ShipmentActionType =
  | 'setErrors'
  | 'setShipments'
  | 'setShippingMethod'

export interface ShipmentActionPayload {
  errors: BaseError[]
  shipments: ShipmentCollection[]
}

export type ShipmentState = Partial<ShipmentActionPayload>

export interface ShipmentAction {
  type: ShipmentActionType
  payload: Partial<ShipmentActionPayload>
}

export const shipmentInitialState: ShipmentState = {
  errors: [],
}

export interface SetShipmentErrors {
  <V extends BaseError[]>(errors: V, dispatch?: Dispatch<ShipmentAction>): void
}

export const setShipmentErrors: SetShipmentErrors = (errors, dispatch) => {
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
}

type GetShipments = (args: {
  order: OrderCollection
  dispatch: Dispatch<ShipmentAction>
  config: CommerceLayerConfig
}) => Promise<void>

export const getShipments: GetShipments = async ({
  order,
  dispatch,
  config,
}) => {
  try {
    const shipments = await order
      .withCredentials(config)
      .shipments()
      ?.includes(
        'availableShippingMethods',
        'availableShippingMethods.deliveryLeadTimeForShipment',
        'shipmentLineItems',
        'shipmentLineItems.lineItem',
        'stockTransfers',
        'shippingMethod'
      )
      .load()
    console.log('shipments', shipments)
    dispatch({
      type: 'setShipments',
      payload: { shipments: shipments?.toArray() },
    })
  } catch (error) {
    console.error(error)
  }
}

type SetShippingMethod = (args: {
  config: CommerceLayerConfig
  shipmentId: string
  shippingMethodId: string
  order?: OrderCollection
  getOrder?: getOrderContext
}) => Promise<void>

export const setShippingMethod: SetShippingMethod = async ({
  config,
  shipmentId,
  shippingMethodId,
  getOrder,
  order,
}) => {
  try {
    if (shippingMethodId) {
      const shipment = await Shipment.withCredentials(config)
        .includes(
          'availableShippingMethods',
          'availableShippingMethods.deliveryLeadTimeForShipment',
          'shipmentLineItems',
          'shipmentLineItems.lineItem',
          'stockTransfers',
          'shippingMethod'
        )
        .find(shipmentId)
      const shippingMethod = ShippingMethod.build({ id: shippingMethodId })
      await shipment.withCredentials(config).update({ shippingMethod })
      getOrder && order && getOrder(order.id)
    }
  } catch (error) {
    console.error(error)
  }
}

const type: ShipmentActionType[] = [
  'setErrors',
  'setShipments',
  'setShippingMethod',
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

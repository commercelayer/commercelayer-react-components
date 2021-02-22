import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { OrderCollection, PaymentMethodCollection } from '@commercelayer/js-sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'

export type PaymentMethodActionType = 'setErrors' | 'setPaymentMethods'

export interface PaymentMethodActionPayload {
  errors: BaseError[]
  paymentMethods: PaymentMethodCollection[]
}

export type PaymentMethodState = Partial<PaymentMethodActionPayload>

export interface PaymentMethodAction {
  type: PaymentMethodActionType
  payload: Partial<PaymentMethodActionPayload>
}

export const paymentMethodInitialState: PaymentMethodState = {
  errors: [],
}

export interface SetPaymentMethodErrors {
  <V extends BaseError[]>(
    errors: V,
    dispatch?: Dispatch<PaymentMethodAction>
  ): void
}

export const setPaymentMethodErrors: SetPaymentMethodErrors = (
  errors,
  dispatch
) => {
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
}

type GetPaymentMethods = (args: {
  order: OrderCollection
  dispatch: Dispatch<PaymentMethodAction>
  config: CommerceLayerConfig
}) => Promise<void>

export const getPaymentMethods: GetPaymentMethods = async ({
  order,
  dispatch,
  config,
}) => {
  try {
    const paymentMethods = await order
      .withCredentials(config)
      .availablePaymentMethods()
      ?.load()
    dispatch({
      type: 'setPaymentMethods',
      payload: { paymentMethods: paymentMethods?.toArray() },
    })
  } catch (error) {
    console.error(error)
  }
}

// type SetShippingMethod = (args: {
//   config: CommerceLayerConfig
//   shipmentId: string
//   shippingMethodId: string
//   order?: OrderCollection
//   getOrder?: getOrderContext
// }) => Promise<void>

// export const setShippingMethod: SetShippingMethod = async ({
//   config,
//   shipmentId,
//   shippingMethodId,
//   getOrder,
//   order,
// }) => {
//   try {
//     if (shippingMethodId) {
//       const shipment = await Shipment.withCredentials(config)
//         .includes(
//           'availableShippingMethods',
//           'availableShippingMethods.deliveryLeadTimeForShipment',
//           'shipmentLineItems',
//           'shipmentLineItems.lineItem',
//           'stockTransfers',
//           'shippingMethod'
//         )
//         .find(shipmentId)
//       const shippingMethod = ShippingMethod.build({ id: shippingMethodId })
//       await shipment.withCredentials(config).update({ shippingMethod })
//       getOrder && order && getOrder(order.id)
//     }
//   } catch (error) {
//     console.error(error)
//   }
// }

const type: PaymentMethodActionType[] = ['setErrors', 'setPaymentMethods']

const paymentMethodReducer = (
  state: PaymentMethodState,
  reducer: PaymentMethodAction
): PaymentMethodState =>
  baseReducer<
    PaymentMethodState,
    PaymentMethodAction,
    PaymentMethodActionType[]
  >(state, reducer, type)

export default paymentMethodReducer

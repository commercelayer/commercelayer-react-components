import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Order, OrderUpdate } from '@commercelayer/sdk'
import { isEmpty, isFunction } from 'lodash'
import { shipmentsFilled } from '#utils/shipments'
import { PaymentResource } from './PaymentMethodReducer'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import { PaymentSourceType } from './PaymentMethodReducer'
import {
  saveBillingAddress,
  saveShippingAddress,
  saveToWallet,
} from '#utils/customerOrderOptions'
import getSdk from '#utils/getSdk'
import { updateOrder } from './OrderReducer'
import getErrors from '#utils/getErrors'

export type PlaceOrderActionType = 'setErrors' | 'setPlaceOrderPermitted'

export type PlaceOrderOptions = {
  paypalPayerId?: string
}

export interface PlaceOrderActionPayload {
  errors: BaseError[]
  isPermitted: boolean
  paymentType: PaymentResource
  paymentSecret: string
  paymentId: string
  paymentSource: PaymentSourceType
  options?: PlaceOrderOptions
}

export type PlaceOrderState = Partial<PlaceOrderActionPayload>

export interface PlaceOrderAction {
  type: PlaceOrderActionType
  payload: Partial<PlaceOrderActionPayload>
}

export const placeOrderInitialState: PlaceOrderState = {
  errors: [],
  isPermitted: false,
}

export interface SetPlaceOrderErrors {
  <V extends BaseError[]>(
    errors: V,
    dispatch?: Dispatch<PlaceOrderAction>
  ): void
}

export const setPlaceOrderErrors: SetPlaceOrderErrors = (errors, dispatch) => {
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
}

type PlaceOrderPermitted = (args: {
  config?: CommerceLayerConfig
  dispatch: Dispatch<PlaceOrderAction>
  order?: Order
  // TODO: Remove it soon
  options?: PlaceOrderOptions
}) => void

export const placeOrderPermitted: PlaceOrderPermitted = async ({
  config,
  order,
  dispatch,
  options,
}) => {
  if (order && config) {
    let isPermitted = true
    if (order.privacy_url && order.terms_url) {
      isPermitted = localStorage.getItem('privacy-terms') === 'true'
    }
    const billingAddress = order.billing_address
    if (isEmpty(billingAddress)) isPermitted = false
    const shippingAddress = order.shipping_address
    if (isEmpty(shippingAddress)) isPermitted = false
    const shipments = order.shipments
    const shipment = shipments && shipmentsFilled(shipments)
    if (!isEmpty(shipments) && !shipment) isPermitted = false
    const paymentMethod = order.payment_method
    const paymentSource = order.payment_source
    if (order.total_amount_with_taxes_cents !== 0 && isEmpty(paymentMethod?.id))
      isPermitted = false
    console.log(paymentSource)
    dispatch({
      type: 'setPlaceOrderPermitted',
      payload: {
        isPermitted,
        paymentType: paymentMethod?.payment_source_type as PaymentResource,
        // @ts-ignore
        paymentSecret: paymentSource?.client_secret,
        // @ts-ignore
        paymentId: paymentSource?.options?.id,
        paymentSource,
        options,
      },
    })
  }
}

export type SetPlaceOrder = (args: {
  config?: CommerceLayerConfig
  order?: Order
  state?: PlaceOrderState
  setOrderErrors?: (collection: any) => void
  paymentSource?: Record<string, string>
}) => Promise<{
  placed: boolean
}>

export const setPlaceOrder: SetPlaceOrder = async ({
  state,
  order,
  config,
  setOrderErrors,
  paymentSource,
}) => {
  const response = {
    placed: false,
  }
  try {
    debugger
    if (state && order && config && paymentSource) {
      const sdk = getSdk(config)
      const { options, paymentType } = state
      if (paymentType === 'paypal_payments') {
        if (!options?.paypalPayerId && paymentSource?.approval_url) {
          window.location.href = paymentSource?.approval_url as string
          return response
        }
        await sdk.paypal_payments.update({
          id: paymentSource.id,
          paypal_payer_id: options?.paypalPayerId,
        })
      }
      const updateAttributes: OrderUpdate = {
        id: order.id,
        _place: true,
      }
      if (saveBillingAddress()) {
        await sdk.orders.update({
          id: order.id,
          _save_billing_address_to_customer_address_book: true,
        })
      }
      if (saveShippingAddress()) {
        await sdk.orders.update({
          id: order.id,
          _save_shipping_address_to_customer_address_book: true,
        })
      }
      switch (paymentType) {
        case 'braintree_payments':
          if (saveToWallet()) {
            await sdk.orders.update({
              id: order.id,
              _save_payment_source_to_customer_wallet: true,
            })
          }
          await sdk.orders.update(updateAttributes)
          setOrderErrors && setOrderErrors([])
          return {
            placed: true,
          }
        default:
          // await sdk.orders.
          if (saveToWallet()) {
            await sdk.orders.update({
              id: order.id,
              _save_payment_source_to_customer_wallet: true,
            })
          }
          await sdk.orders.update(updateAttributes)
          setOrderErrors && setOrderErrors([])
          return {
            placed: true,
          }
      }
    }
    return response
  } catch (error) {
    // const errors = getErrorsByCollection(error, 'order')
    const errors = getErrors(error, 'orders')
    setOrderErrors && setOrderErrors(errors)
    return {
      ...response,
      errors,
    }
  }
}

const type: PlaceOrderActionType[] = ['setErrors', 'setPlaceOrderPermitted']

const placeOrderReducer = (
  state: PlaceOrderState,
  reducer: PlaceOrderAction
): PlaceOrderState =>
  baseReducer<PlaceOrderState, PlaceOrderAction, PlaceOrderActionType[]>(
    state,
    reducer,
    type
  )

export default placeOrderReducer

import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Order, OrderUpdate } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { isDoNotShip, shipmentsFilled } from '#utils/shipments'
import { PaymentResource } from './PaymentMethodReducer'
import { PaymentSourceType } from './PaymentMethodReducer'
import {
  saveBillingAddress,
  saveShippingAddress,
  saveToWallet,
} from '#utils/customerOrderOptions'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'

export type PlaceOrderActionType = 'setErrors' | 'setPlaceOrderPermitted'

export type PlaceOrderOptions = {
  paypalPayerId?: string
  adyen?: {
    MD: string
    PaRes: string
  }
  checkoutCom?: {
    session_id: string
  }
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
    const doNotShip = isDoNotShip(order.line_items)
    if (isEmpty(shippingAddress) && !doNotShip) isPermitted = false
    const shipments = order.shipments
    const shipment = shipments && shipmentsFilled(shipments)
    if (!isEmpty(shipments) && !shipment) isPermitted = false
    const paymentMethod = order.payment_method
    const paymentSource = order.payment_source
    // @ts-ignore
    if (paymentSource?.mismatched_amounts) isPermitted = false
    if (order.total_amount_with_taxes_cents !== 0 && isEmpty(paymentMethod?.id))
      isPermitted = false
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
  setOrderErrors?: (collection: unknown) => void
  paymentSource?: PaymentSourceType & { approval_url?: string }
  include?: string[]
  setOrder?: (order: Order) => void
}) => Promise<{
  placed: boolean
}>

export const setPlaceOrder: SetPlaceOrder = async ({
  state,
  order,
  config,
  setOrderErrors,
  paymentSource,
  setOrder,
  include,
}) => {
  const response = {
    placed: false,
  }
  if (state && config && order) {
    const sdk = getSdk(config)
    const { options, paymentType } = state
    try {
      if (paymentType === 'paypal_payments' && paymentSource) {
        if (!options?.paypalPayerId && paymentSource?.approval_url) {
          window.location.href = paymentSource?.approval_url as string
          return response
        }
        await sdk[paymentType].update({
          id: paymentSource.id,
          paypal_payer_id: options?.paypalPayerId,
        })
      }
      if (
        paymentType === 'checkout_com_payments' &&
        paymentSource &&
        options?.checkoutCom?.session_id
      ) {
        const payment = await sdk[paymentType].update({
          id: paymentSource.id,
          _details: true,
          session_id: options?.checkoutCom?.session_id,
        })
        // @ts-ignore
        if (payment?.payment_response?.status !== 'Authorized') {
          // @ts-ignore
          const [action] = payment?.payment_response?.actions || ['']
          const errors: BaseError[] = [
            {
              code: 'PAYMENT_NOT_APPROVED_FOR_EXECUTION',
              message: action?.response_summary,
              resource: 'orders',
              field: 'checkout_com_payments',
            },
          ]
          throw { errors }
        }
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
        case 'braintree_payments': {
          if (saveToWallet()) {
            await sdk.orders.update({
              id: order.id,
              _save_payment_source_to_customer_wallet: true,
            })
          }
          const orderUpdated = await sdk.orders.update(updateAttributes, {
            include,
          })
          setOrder && setOrder(orderUpdated)
          setOrderErrors && setOrderErrors([])
          return {
            placed: true,
          }
        }
        default: {
          const orderUpdated = await sdk.orders.update(updateAttributes, {
            include,
          })
          setOrder && setOrder(orderUpdated)
          if (saveToWallet()) {
            await sdk.orders.update({
              id: order.id,
              _save_payment_source_to_customer_wallet: true,
            })
          }
          setOrderErrors && setOrderErrors([])
          return {
            placed: true,
          }
        }
      }
    } catch (error) {
      const errors = getErrors(error, 'orders', paymentType)
      setOrderErrors && setOrderErrors(errors)
      return {
        ...response,
        errors,
      }
    }
  }
  return response
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

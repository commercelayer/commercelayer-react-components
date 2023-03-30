import baseReducer from '#utils/baseReducer'
import type { Dispatch, RefObject } from 'react'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { BaseError } from '#typings/errors'
import type { Order, OrderUpdate } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { isDoNotShip, shipmentsFilled } from '#utils/shipments'
import {
  type PaymentResource,
  type PaymentSourceType
} from './PaymentMethodReducer'
import {
  saveBillingAddress,
  saveShippingAddress,
  saveToWallet
} from '#utils/customerOrderOptions'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'

export type PlaceOrderActionType =
  | 'setErrors'
  | 'setPlaceOrderPermitted'
  | 'setButtonRef'

export interface PlaceOrderOptions {
  paypalPayerId?: string
  adyen?: {
    MD?: string
    PaRes?: string
    redirectResult?: string
  }
  checkoutCom?: {
    session_id: string
  }
  stripe?: {
    redirectStatus: string
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
  placeOrderButtonRef?: RefObject<HTMLButtonElement>
}

export function setButtonRef(
  ref: RefObject<HTMLButtonElement>,
  dispatch: Dispatch<PlaceOrderAction>
): void {
  if (ref?.current != null) {
    dispatch({
      type: 'setButtonRef',
      payload: {
        placeOrderButtonRef: ref
      }
    })
  }
}

export type PlaceOrderState = Partial<PlaceOrderActionPayload>

export interface PlaceOrderAction {
  type: PlaceOrderActionType
  payload: Partial<PlaceOrderActionPayload>
}

export const placeOrderInitialState: PlaceOrderState = {
  errors: [],
  isPermitted: false
}

export function setPlaceOrderErrors<V extends BaseError[]>(
  errors: V,
  dispatch: Dispatch<PlaceOrderAction>
): void {
  if (dispatch) {
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

interface TPlaceOrderPermittedParams {
  config?: CommerceLayerConfig
  dispatch: Dispatch<PlaceOrderAction>
  order?: Order
  // TODO: Remove it soon
  options?: PlaceOrderOptions
}

export function placeOrderPermitted({
  config,
  order,
  dispatch,
  options
}: TPlaceOrderPermittedParams): void {
  if (order && config) {
    let isPermitted = true
    if (order.privacy_url && order.terms_url) {
      isPermitted = localStorage.getItem('privacy-terms') === 'true'
    }
    const billingAddress = order.billing_address
    const shippingAddress = order.shipping_address
    const doNotShip = isDoNotShip(order.line_items)
    const shipments = order.shipments
    const shipment = shipments && shipmentsFilled(shipments)
    const paymentMethod = order.payment_method
    const paymentSource = order.payment_source
    if (order.total_amount_with_taxes_cents !== 0 && isEmpty(paymentMethod?.id))
      isPermitted = false
    if (isEmpty(billingAddress)) isPermitted = false
    if (isEmpty(shippingAddress) && !doNotShip) isPermitted = false
    if (!isEmpty(shipments) && !shipment) isPermitted = false
    // @ts-expect-error no type
    if (paymentSource?.mismatched_amounts) isPermitted = false
    dispatch({
      type: 'setPlaceOrderPermitted',
      payload: {
        isPermitted,
        paymentType: paymentMethod?.payment_source_type as PaymentResource,
        // @ts-expect-error no type
        paymentSecret: paymentSource?.client_secret,
        // @ts-expect-error no type
        paymentId: paymentSource?.options?.id,
        paymentSource,
        options
      }
    })
  }
}

interface TSetPlaceOrderParams {
  config?: CommerceLayerConfig
  order?: Order
  state?: PlaceOrderState
  setOrderErrors?: (errors: BaseError[]) => void
  paymentSource?: PaymentSourceType & { approval_url?: string }
  include?: string[]
  setOrder?: (order: Order) => void
}

export async function setPlaceOrder({
  state,
  order,
  config,
  setOrderErrors,
  paymentSource,
  setOrder,
  include
}: TSetPlaceOrderParams): Promise<{
  placed: boolean
  errors?: BaseError[]
  order?: Order
}> {
  const response = {
    placed: false
  }
  if (state && config && order) {
    const sdk = getSdk(config)
    const { options, paymentType } = state
    try {
      if (paymentType === 'paypal_payments' && paymentSource) {
        if (!options?.paypalPayerId && paymentSource?.approval_url) {
          window.location.href = paymentSource?.approval_url
          return response
        }
        await sdk[paymentType].update({
          id: paymentSource.id,
          paypal_payer_id: options?.paypalPayerId
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
          session_id: options?.checkoutCom?.session_id
        })
        // @ts-expect-error no type
        if (payment?.payment_response?.status !== 'Authorized') {
          // @ts-expect-error no type
          const [action] = payment?.payment_response?.actions || ['']
          const errors: BaseError[] = [
            {
              code: 'PAYMENT_NOT_APPROVED_FOR_EXECUTION',
              message: action?.response_summary,
              resource: 'orders',
              field: 'checkout_com_payments'
            }
          ]
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw { errors }
        }
      }
      const updateAttributes: OrderUpdate = {
        id: order.id,
        _place: true
      }
      if (saveBillingAddress()) {
        await sdk.orders.update({
          id: order.id,
          _save_billing_address_to_customer_address_book: true
        })
      }
      if (saveShippingAddress()) {
        await sdk.orders.update({
          id: order.id,
          _save_shipping_address_to_customer_address_book: true
        })
      }
      switch (paymentType) {
        case 'braintree_payments': {
          if (saveToWallet()) {
            await sdk.orders.update({
              id: order.id,
              _save_payment_source_to_customer_wallet: true
            })
          }
          const orderUpdated = await sdk.orders.update(updateAttributes, {
            include
          })
          if (setOrder) setOrder(orderUpdated)
          if (setOrderErrors) setOrderErrors([])
          return {
            placed: true,
            order: orderUpdated
          }
        }
        default: {
          const orderUpdated = await sdk.orders.update(updateAttributes, {
            include
          })
          if (setOrder) setOrder(orderUpdated)
          if (saveToWallet()) {
            await sdk.orders.update({
              id: order.id,
              _save_payment_source_to_customer_wallet: true
            })
          }
          if (setOrderErrors) setOrderErrors([])
          return {
            placed: true,
            order: orderUpdated
          }
        }
      }
    } catch (error: any) {
      const errors = getErrors({
        error,
        resource: 'orders',
        field: paymentType
      })
      if (setOrderErrors) setOrderErrors(errors)
      return {
        ...response,
        errors
      }
    }
  }
  return response
}

const type: PlaceOrderActionType[] = [
  'setErrors',
  'setPlaceOrderPermitted',
  'setButtonRef'
]

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

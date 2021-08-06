import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Order, OrderCollection, PaypalPayment } from '@commercelayer/js-sdk'
import { isEmpty, isFunction } from 'lodash'
import { shipmentsFilled } from '#utils/shipments'
import { PaymentResource } from './PaymentMethodReducer'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import {
  saveBillingAddress,
  saveShippingAddress,
  saveToWallet,
} from '#utils/customerOrderOptions'

export type PlaceOrderActionType = 'setErrors' | 'setPlaceOrderPermitted'

export type PlaceOrderOptions = {
  saveBillingAddressToCustomerAddressBook?: boolean
  saveShippingAddressToCustomerAddressBook?: boolean
  savePaymentSourceToCustomerWallet?: boolean
  paypalPayerId?: string
}

export interface PlaceOrderActionPayload {
  errors: BaseError[]
  isPermitted: boolean
  paymentType: PaymentResource
  paymentSecret: string
  paymentId: string
  paymentSource: Record<string, string>
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
  order?: OrderCollection
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
    if (order.privacyUrl && order.termsUrl) {
      isPermitted = localStorage.getItem('privacy-terms') === 'true'
    }
    const billingAddress =
      order.billingAddress() ||
      (await order.withCredentials(config).loadBillingAddress())
    if (isEmpty(billingAddress)) isPermitted = false
    const shippingAddress =
      order.shippingAddress() ||
      (await order.withCredentials(config).loadShippingAddress())
    if (isEmpty(shippingAddress)) isPermitted = false
    const shipments = (
      await order.withCredentials(config).loadShipments()
    )?.toArray()
    const shipment = shipments && (await shipmentsFilled(shipments, config))
    if (!isEmpty(shipments) && !shipment) isPermitted = false
    const paymentMethod =
      order.paymentMethod() ||
      (await order.withCredentials(config).paymentMethod())
    const paymentSource: any = (
      await Order.withCredentials(config)
        .select('id')
        .includes('paymentSource')
        .find(order.id)
    ).paymentSource()
    if (order.totalAmountWithTaxesCents !== 0 && isEmpty(paymentMethod?.id))
      isPermitted = false
    dispatch({
      type: 'setPlaceOrderPermitted',
      payload: {
        isPermitted,
        paymentType: paymentMethod?.paymentSourceType as PaymentResource,
        paymentSecret: paymentSource?.clientSecret,
        paymentId: paymentSource?.options?.id,
        paymentSource: paymentSource?.attributes(),
        options,
      },
    })
  }
}

export type SetPlaceOrder = (args: {
  config?: CommerceLayerConfig
  order?: OrderCollection
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
    if (state && order && config) {
      const { options, paymentType } = state
      if (paymentType === 'paypal_payments') {
        if (!options?.paypalPayerId && paymentSource?.approvalUrl) {
          window.location.href = paymentSource?.approvalUrl as string
          return response
        }
        const paypalPayment = PaypalPayment.build({ id: paymentSource?.id })
        await paypalPayment
          .withCredentials(config)
          .update({ paypalPayerId: options?.paypalPayerId })
      }
      const updateAttributes: Record<string, any> = {
        _place: true,
      }
      if (options && saveBillingAddress(options)) {
        updateAttributes._saveBillingAddressToCustomerAddressBook = true
      }
      if (options && saveShippingAddress(options)) {
        updateAttributes._saveShippingAddressToCustomerAddressBook = true
      }
      switch (paymentType) {
        default:
          const o = await Order.withCredentials(config).find(order.id)
          const u = await o.withCredentials(config).update(updateAttributes)
          if (isFunction(u?.errors) && !u?.errors()?.empty()) throw u
          if (options && saveToWallet(options)) {
            await Order.build({
              id: order.id,
            })
              .withCredentials(config)
              .update({ _savePaymentSourceToCustomerWallet: true })
          }
          setOrderErrors && setOrderErrors([])
          return {
            placed: true,
          }
      }
    }
    return response
  } catch (error) {
    setOrderErrors && setOrderErrors(error)
    const errors = getErrorsByCollection(error, 'order')
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

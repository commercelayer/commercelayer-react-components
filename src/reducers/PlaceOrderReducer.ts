import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Order, OrderCollection } from '@commercelayer/js-sdk'
import { isEmpty, isFunction } from 'lodash'
import { shipmentsFilled } from '#utils/shipments'
import { PaymentResource } from './PaymentMethodReducer'
import { getLocalOrder } from '#utils/localStorage'
import getErrorsByCollection from '#utils/getErrorsByCollection'

export type PlaceOrderActionType = 'setErrors' | 'setPlaceOrderPermitted'

export type PlaceOrderOptions = {
  saveBillingAddressToCustomerAddressBook?: boolean
  saveShippingAddressToCustomerAddressBook?: boolean
  savePaymentSourceToCustomerWallet?: boolean
}

export interface PlaceOrderActionPayload {
  errors: BaseError[]
  isPermitted: boolean
  paymentType: PaymentResource
  paymentSecret: string
  paymentId: string
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
    if (
      order.totalAmountWithTaxesCents !== 0 &&
      isEmpty(paymentSource?.options)
    )
      isPermitted = false
    dispatch({
      type: 'setPlaceOrderPermitted',
      payload: {
        isPermitted,
        paymentType: paymentMethod?.paymentSourceType as PaymentResource,
        paymentSecret: paymentSource?.clientSecret,
        paymentId: paymentSource?.options?.id,
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
}) => Promise<{
  placed: boolean
}>

export const setPlaceOrder: SetPlaceOrder = async ({
  state,
  order,
  config,
  setOrderErrors,
}) => {
  const response = {
    placed: false,
  }
  try {
    if (state && order && config) {
      const { options, paymentType } = state
      const updateAttributes: Record<string, any> = {
        _place: true,
      }
      if (
        options?.saveBillingAddressToCustomerAddressBook ||
        getLocalOrder('saveBillingAddressToCustomerAddressBook') === 'true'
      )
        updateAttributes._saveBillingAddressToCustomerAddressBook =
          options?.saveBillingAddressToCustomerAddressBook ||
          getLocalOrder('saveBillingAddressToCustomerAddressBook') === 'true'
      if (
        options?.saveShippingAddressToCustomerAddressBook ||
        getLocalOrder('saveShippingAddressToCustomerAddressBook') === 'true'
      )
        updateAttributes._saveShippingAddressToCustomerAddressBook =
          options?.saveShippingAddressToCustomerAddressBook ||
          getLocalOrder('saveShippingAddressToCustomerAddressBook') === 'true'
      if (
        options?.savePaymentSourceToCustomerWallet ||
        getLocalOrder('savePaymentSourceToCustomerWallet') === 'true'
      ) {
        const _savePaymentSourceToCustomerWallet =
          options?.savePaymentSourceToCustomerWallet ||
          getLocalOrder('savePaymentSourceToCustomerWallet') === 'true'
        if (_savePaymentSourceToCustomerWallet)
          updateAttributes._savePaymentSourceToCustomerWallet =
            !!_savePaymentSourceToCustomerWallet
      }
      switch (paymentType) {
        default:
          const o = await Order.withCredentials(config).find(order.id)
          const u = await o.withCredentials(config).update(updateAttributes)
          if (isFunction(u?.errors) && !u?.errors()?.empty()) throw u
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

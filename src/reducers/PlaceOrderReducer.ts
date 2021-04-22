import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Order, OrderCollection } from '@commercelayer/js-sdk'
import { isEmpty } from 'lodash'
import { shipmentsFilled } from '#utils/shipments'
import { PaymentResource } from './PaymentMethodReducer'
import { loadStripe } from '@stripe/stripe-js'
import { getLocalOrder } from '#utils/localStorage'

export type PlaceOrderActionType = 'setErrors' | 'setPlaceOrderPermitted'

export type PlaceOrderOptions = {
  stripePayment?: {
    publishableKey: string
  }
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
    const paymentSource: any = await Order.withCredentials(config)
      .select('id')
      .includes('paymentSource')
      .find(order.id)
    if (
      isEmpty(paymentMethod) &&
      isEmpty(paymentSource.paymentSourceId) &&
      order.totalAmountWithTaxesCents !== 0
    )
      isPermitted = false
    dispatch({
      type: 'setPlaceOrderPermitted',
      payload: {
        isPermitted,
        paymentType: paymentMethod?.paymentSourceType as PaymentResource,
        paymentSecret: paymentSource?.paymentSource()?.clientSecret,
        paymentId: paymentSource?.paymentSource()?.options.id,
        options,
      },
    })
  }
}

export type SetPlaceOrder = (args: {
  config?: CommerceLayerConfig
  order?: OrderCollection
  state?: PlaceOrderState
}) => Promise<{
  placed: boolean
}>

export const setPlaceOrder: SetPlaceOrder = async ({
  state,
  order,
  config,
}) => {
  const response = {
    placed: false,
  }
  try {
    if (state && order && config) {
      const { options, paymentType, paymentSecret, paymentId } = state
      const updateAttributes: Record<string, any> = {
        _place: true,
      }
      if (
        options?.saveBillingAddressToCustomerAddressBook ||
        getLocalOrder('saveBillingAddressToCustomerAddressBook')
      )
        updateAttributes._saveBillingAddressToCustomerAddressBook =
          options?.saveBillingAddressToCustomerAddressBook ||
          getLocalOrder('saveBillingAddressToCustomerAddressBook')
      if (
        options?.saveShippingAddressToCustomerAddressBook ||
        getLocalOrder('saveShippingAddressToCustomerAddressBook')
      )
        updateAttributes._saveShippingAddressToCustomerAddressBook =
          options?.saveShippingAddressToCustomerAddressBook ||
          getLocalOrder('saveShippingAddressToCustomerAddressBook')
      if (
        options?.savePaymentSourceToCustomerWallet ||
        getLocalOrder('savePaymentSourceToCustomerWallet')
      ) {
        const _savePaymentSourceToCustomerWallet =
          options?.savePaymentSourceToCustomerWallet ||
          getLocalOrder('savePaymentSourceToCustomerWallet')
        updateAttributes._savePaymentSourceToCustomerWallet = !!_savePaymentSourceToCustomerWallet
      }
      switch (paymentType) {
        case 'stripe_payments':
          const stripe = await loadStripe(
            options?.stripePayment?.publishableKey as string
          )
          if (stripe && paymentSecret) {
            const { paymentIntent, error } = await stripe.confirmCardPayment(
              paymentSecret,
              {
                payment_method: paymentId,
              }
            )
            if (paymentIntent) {
              const o = await Order.withCredentials(config).find(order.id)
              await o.withCredentials(config).update(updateAttributes)
              return {
                placed: true,
              }
            }
            throw new Error(error?.message)
          }
          throw new Error('Stripe and payment secret are not available')
        default:
          const o = await Order.withCredentials(config).find(order.id)
          await o.withCredentials(config).update(updateAttributes)
          return {
            placed: true,
          }
      }
    }
    return response
  } catch (error) {
    console.error('place order', error)
    return response
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

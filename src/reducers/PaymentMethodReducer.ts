import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from '#reducers/OrderReducer'
import { BaseError } from '#typings/errors'
import baseReducer from '#utils/baseReducer'
import CLayer, {
  Order,
  OrderCollection,
  PaymentMethod,
  PaymentMethodCollection,
  StripePaymentCollection,
  WireTransferCollection,
} from '@commercelayer/js-sdk'
import {
  CssFontSource,
  CustomFontSource,
  StripeCardElementOptions,
} from '@stripe/stripe-js'
import { camelCase, isEmpty } from 'lodash'
import { Dispatch, ReactNode } from 'react'

export type PaymentMethodActionType =
  | 'setErrors'
  | 'setPaymentMethods'
  | 'setPaymentMethodConfig'
  | 'setPaymentSource'

export interface PaymentMethodActionPayload {
  errors: BaseError[]
  paymentMethods: PaymentMethodCollection[]
  currentPaymentMethodType: PaymentResource
  currentPaymentMethodId: string
  config: PaymentMethodConfig
  paymentSource: PaymentSourceTypes
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
  state: PaymentMethodState
}) => Promise<void>

export const getPaymentMethods: GetPaymentMethods = async ({
  order,
  dispatch,
  config,
  state,
}) => {
  try {
    const payload: PaymentMethodState = {}
    if (isEmpty(state.paymentMethods)) {
      const paymentMethods = await order
        .withCredentials(config)
        .loadAvailablePaymentMethods()
      payload.paymentMethods = paymentMethods?.toArray()
    }
    const paymentMethod = await order
      ?.withCredentials(config)
      .loadPaymentMethod()
    const paymentSource: any = (
      await Order.withCredentials(config)
        .includes('paymentSource')
        .find(order.id)
    ).paymentSource()
    dispatch({
      type: 'setPaymentMethods',
      payload: {
        ...payload,
        currentPaymentMethodId: paymentMethod?.id,
        currentPaymentMethodType: paymentMethod?.paymentSourceType as PaymentResource,
        paymentSource,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export type PaymentResource =
  | 'adyen_payments'
  | 'braintree_payments'
  | 'external_payments'
  | 'paypal_payments'
  | 'stripe_payments'
  | 'wire_transfers'

export type PaymentResourceKey =
  // | 'adyenPayment'
  // | 'braintreePayment'
  // | 'externalPayment'
  // | 'paypalPayment'
  'stripePayment'
// | 'wireTransfer'

export type SDKPaymentResource =
  | 'AdyenPayment'
  | 'BraintreePayment'
  | 'ExternalPayment'
  | 'PaypalPayment'
  | 'StripePayment'
  | 'WireTransfer'

export type SetPaymentMethod = (args: {
  config?: CommerceLayerConfig
  dispatch?: Dispatch<PaymentMethodAction>
  getOrder?: getOrderContext
  order?: OrderCollection
  paymentMethodId: string
  paymentResource: PaymentResource
}) => Promise<void>

export const setPaymentMethod: SetPaymentMethod = async ({
  config,
  dispatch,
  order,
  paymentMethodId,
}) => {
  try {
    if (config && order) {
      dispatch &&
        dispatch({
          type: 'setPaymentMethods',
          payload: { currentPaymentMethodId: paymentMethodId },
        })
      const paymentMethod = PaymentMethod.build({ id: paymentMethodId })
      const patchOrder = Order.build({
        id: order.id,
        paymentMethod,
      })
      // @ts-ignore
      await patchOrder.withCredentials(config).save()
    }
  } catch (error) {
    console.error(error)
  }
}

type PaymentSourceTypes =
  | (StripePaymentCollection & WireTransferCollection)
  | (StripePaymentCollection | WireTransferCollection)

export type SetPaymentSourceResponse = {
  order: OrderCollection
  paymentSource: PaymentSourceTypes
} | null

export type SetPaymentSource = (args: {
  config?: CommerceLayerConfig
  dispatch?: Dispatch<PaymentMethodAction>
  getOrder?: getOrderContext
  options?: Record<string, string | Record<string, string | number | undefined>>
  order?: OrderCollection
  paymentResource: SDKPaymentResource
  customerPaymentSourceId?: string
  savePaymentSourceToCustomerWallet?: boolean
}) => Promise<SetPaymentSourceResponse>

export const setPaymentSource: SetPaymentSource = async ({
  config,
  dispatch,
  getOrder,
  options = {},
  order,
  paymentResource,
  customerPaymentSourceId,
  // savePaymentSourceToCustomerWallet,
}) => {
  try {
    if (config && order) {
      const resourceSdk = CLayer[paymentResource]
      const o = Order.build({ id: order.id })
      const paymentSource = !customerPaymentSourceId
        ? await resourceSdk.withCredentials(config).create({
            options,
            order: o,
          })
        : (
            await (
              await Order.withCredentials(config)
                .includes('paymentSource')
                .find(order.id)
            ).update({
              _customerPaymentSourceId: customerPaymentSourceId,
            })
          ).paymentSource()
      // if (savePaymentSourceToCustomerWallet && !customerPaymentSourceId)
      //   await o.withCredentials(config).update({
      //     _savePaymentSourceToCustomerWallet: savePaymentSourceToCustomerWallet,
      //   })
      if (order?.billingAddress() === null)
        await order.withCredentials(config).loadBillingAddress()
      if (order?.paymentSource() === null)
        await order.withCredentials(config).loadPaymentSource()
      if (getOrder) order = (await getOrder(order?.id)) as OrderCollection
      dispatch &&
        dispatch({
          type: 'setPaymentSource',
          payload: { paymentSource },
        })
      return {
        order,
        paymentSource,
      }
    }
  } catch (error) {
    console.error('error', error)
  }
  return null
}

export type PaymentMethodConfig = {
  stripePayment: {
    [key: string]: any
    containerClassName?: string
    fonts?: (CssFontSource | CustomFontSource)[]
    cssSrc?: string
    handleSubmit?: (response?: SetPaymentSourceResponse) => void
    hintLabel?: string
    name?: string
    options?: StripeCardElementOptions
    publishableKey: string
    submitClassName?: string
    submitContainerClassName?: string
    submitLabel?: string | ReactNode
  }
}

type SetPaymentMethodConfig = (
  config: PaymentMethodConfig,
  dispatch: Dispatch<PaymentMethodAction>
) => void

export const setPaymentMethodConfig: SetPaymentMethodConfig = (
  config,
  dispatch
) => {
  dispatch({
    type: 'setPaymentMethodConfig',
    payload: { config },
  })
}

export const getPaymentConfig = (
  paymentResource: PaymentResource,
  config: PaymentMethodConfig
) => {
  const resource = camelCase(paymentResource)
    .replace('Payments', 'Payment')
    .replace('Transfers', 'Transfer') as PaymentResourceKey
  return config[resource]
}

const type: PaymentMethodActionType[] = [
  'setErrors',
  'setPaymentMethodConfig',
  'setPaymentMethods',
  'setPaymentSource',
]

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

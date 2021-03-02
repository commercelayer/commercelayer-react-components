import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { BaseError } from '#typings/errors'
import CLayer, {
  Order,
  OrderCollection,
  PaymentMethod,
  PaymentMethodCollection,
  PaymentSourceCollection,
  StripePaymentCollection,
  WireTransferCollection,
} from '@commercelayer/js-sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from '#reducers/OrderReducer'
import _ from 'lodash'
import { StripeCardElementOptions } from '@stripe/stripe-js'

export type PaymentMethodActionType =
  | 'setErrors'
  | 'setPaymentMethods'
  | 'setPaymentMethodConfig'
  | 'setPaymentSource'

export interface PaymentMethodActionPayload {
  errors: BaseError[]
  paymentMethods: PaymentMethodCollection[]
  currentPaymentMethodId: string
  config: PaymentMethodConfig
  paymentSource: PaymentSourceCollection
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
    if (_.isEmpty(state.paymentMethods)) {
      const paymentMethods = await order
        .withCredentials(config)
        .availablePaymentMethods()
        ?.load()
      payload.paymentMethods = paymentMethods?.toArray()
    }
    const paymentMethod = await order
      ?.withCredentials(config)
      .loadPaymentMethod()
    dispatch({
      type: 'setPaymentMethods',
      payload: {
        ...payload,
        currentPaymentMethodId: paymentMethod?.id,
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
  // paymentResource,
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
      // await order.withCredentials(config).update({ paymentMethod })
      // const resource = _.startCase(paymentResource)
      //   .replace('Payments', 'Payment')
      //   .replace('Transfers', 'Transfer')
      //   .replace(' ', '') as SDKResource
      // const payment = await CLayer[resource].withCredentials(config).create({
      //   order,
      // })
      // console.log('payment', payment)
      // getOrder && (await getOrder(order?.id))
    }
  } catch (error) {
    console.error(error)
  }
}

export type SetPaymentSourceResponse = {
  order: OrderCollection
  paymentSource: StripePaymentCollection | WireTransferCollection
} | null

export type SetPaymentSource = (args: {
  config?: CommerceLayerConfig
  dispatch?: Dispatch<PaymentMethodAction>
  getOrder?: getOrderContext
  order?: OrderCollection
  paymentResource: SDKPaymentResource
  options?: Record<string, string | Record<string, string | number | undefined>>
}) => Promise<SetPaymentSourceResponse>

export const setPaymentSource: SetPaymentSource = async ({
  config,
  dispatch,
  order,
  options = {},
  paymentResource,
}) => {
  try {
    if (config && order) {
      const paymentSource = await CLayer[paymentResource]
        .withCredentials(config)
        .create({
          options,
          order,
        })
      if (order?.billingAddress() === null)
        await order.withCredentials(config).loadBillingAddress()
      if (order?.paymentSource() === null)
        // @ts-ignore
        await order.withCredentials(config).loadPaymentSource()
      // getOrder && (await getOrder(order?.id))
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
    publishableKey: string
    hintLabel?: string
    name?: string
    options?: StripeCardElementOptions
    submitClassName?: string
    submitLabel?: string
    handleSubmit?: (response?: SetPaymentSourceResponse) => void
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
  const resource = _.camelCase(paymentResource)
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

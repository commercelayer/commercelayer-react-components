import { BraintreeConfig } from '#components/BraintreePayment'
import { PaypalConfig } from '#components/PaypalPayment'
import { StripeConfig } from '#components/StripePayment'
import { WireTransferConfig } from '#components/WireTransferPayment'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from '#reducers/OrderReducer'
import { BaseError } from '#typings/errors'
import baseReducer from '#utils/baseReducer'
import dynamicNaming from '#utils/dynamicNaming'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import {
  Order,
  OrderCollection,
  PaymentMethod,
  PaymentMethodCollection,
  StripePaymentCollection,
  WireTransferCollection,
} from '@commercelayer/js-sdk'
import camelCase from 'lodash/camelCase'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import { Dispatch } from 'react'

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
        currentPaymentMethodType:
          paymentMethod?.paymentSourceType as PaymentResource,
        paymentSource,
      },
    })
  } catch (error) {
    console.error(error)
    const errors = getErrorsByCollection(error, 'paymentMethod')
    setPaymentMethodErrors(errors, dispatch)
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
  | 'braintreePayment'
  | 'stripePayment'
  | 'wireTransfer'
  | 'paypalPayment'
// | 'adyenPayment'
// | 'externalPayment'
// | 'checkoutPayment'

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
  paymentResource?: PaymentResource
}) => Promise<void>

export const setPaymentMethod: SetPaymentMethod = async ({
  config,
  dispatch,
  order,
  paymentMethodId,
  getOrder,
}) => {
  try {
    if (config && order && dispatch) {
      const paymentMethod = PaymentMethod.build({ id: paymentMethodId })
      const patchOrder = Order.build({
        id: order.id,
        paymentMethod,
      })
      // @ts-ignore
      await patchOrder.withCredentials(config).save()
      getOrder && (await getOrder(order.id))
      dispatch({
        type: 'setPaymentMethods',
        payload: { currentPaymentMethodId: paymentMethodId, errors: [] },
      })
    }
  } catch (error) {
    const errors = getErrorsByCollection(error, 'paymentMethod')
    console.error('Set payment method', errors)
    setPaymentMethodErrors(errors, dispatch)
  }
}

type PaymentSourceTypes =
  | (StripePaymentCollection & WireTransferCollection)
  | (StripePaymentCollection | WireTransferCollection)

export type SetPaymentSourceResponse = {
  order: OrderCollection
  paymentSource: PaymentSourceTypes
} | null

export type SetPaymentSource = (
  args: {
    config?: CommerceLayerConfig
    dispatch?: Dispatch<PaymentMethodAction>
    getOrder?: getOrderContext
    attributes?: Record<
      string,
      | string
      | Record<string, string | number | undefined | Record<string, string>>
    >
    order?: OrderCollection
    paymentResource: PaymentResource
    paymentSourceId?: string
    customerPaymentSourceId?: string
  } & PaymentMethodState
) => Promise<SetPaymentSourceResponse>

export const setPaymentSource: SetPaymentSource = async ({
  config,
  dispatch,
  getOrder,
  attributes = {},
  order,
  paymentResource,
  customerPaymentSourceId,
  paymentSourceId,
  currentPaymentMethodId,
  currentPaymentMethodType,
}) => {
  try {
    if (config && order) {
      let paymentSource: any
      const resourceSdk = dynamicNaming(paymentResource)
      const o = Order.build({ id: order.id })
      if (!customerPaymentSourceId) {
        if (!paymentSourceId) {
          paymentSource = await resourceSdk.withCredentials(config).create({
            ...attributes,
            order: o,
          })
        } else {
          paymentSource = await resourceSdk
            .build({ id: paymentSourceId })
            .withCredentials(config)
            .update({ ...attributes })
        }
      } else {
        paymentSource = (
          await Order.includes('paymentSource')
            .build({ id: order.id })
            .withCredentials(config)
            .update({
              _customerPaymentSourceId: customerPaymentSourceId,
            })
        ).paymentSource()
      }
      if (order?.billingAddress() === null)
        await order.withCredentials(config).loadBillingAddress()
      if (order?.paymentSource() === null)
        await order.withCredentials(config).loadPaymentSource()
      dispatch &&
        dispatch({
          type: 'setPaymentSource',
          payload: { paymentSource, errors: [] },
        })
      if (getOrder) order = (await getOrder(order?.id)) as OrderCollection
      return {
        order,
        paymentSource,
      }
    }
  } catch (error) {
    const errors = getErrorsByCollection(error, 'paymentMethod', {
      id: currentPaymentMethodId,
      field: currentPaymentMethodType,
    })
    console.error('Set payment source:', errors)
    setPaymentMethodErrors(errors, dispatch)
  }
  return null
}

export type DestroyPaymentSource = (args: {
  paymentSourceId: string
  paymentResource: PaymentResource
  dispatch?: Dispatch<PaymentMethodAction>
}) => Promise<void>

export const destroyPaymentSource: DestroyPaymentSource = async ({
  paymentSourceId,
  paymentResource,
  dispatch,
}) => {
  if (paymentSourceId && paymentResource) {
    try {
      dispatch &&
        dispatch({
          type: 'setPaymentSource',
          payload: { paymentSource: undefined },
        })
    } catch (error) {
      const errors = getErrorsByCollection(error, 'paymentMethod')
      setPaymentMethodErrors(errors, dispatch)
    }
  }
}

export type PaymentMethodConfig = {
  stripePayment?: StripeConfig
  braintreePayment?: BraintreeConfig
  wireTransfer?: Partial<WireTransferConfig>
  paypalPayment?: PaypalConfig
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

export function getPaymentConfig<K extends PaymentResourceKey>(
  paymentResource: PaymentResource,
  config: PaymentMethodConfig
): PaymentMethodConfig[K] {
  const resource = camelCase(paymentResource)
    .replace('Payments', 'Payment')
    .replace('Transfers', 'Transfer') as K
  return !isEmpty(config) && has(config, resource)
    ? config[resource]
    : undefined
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

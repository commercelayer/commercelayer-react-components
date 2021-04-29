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
import { isEmpty, camelCase } from 'lodash'
import dynamicNaming from '#utils/dynamicNaming'
import { StripeConfig } from '#components/StripePayment'
import { BraintreeConfig } from '#components/BraintreePayment'
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
  paymentResource,
}) => {
  try {
    if (config && order && dispatch) {
      dispatch({
        type: 'setPaymentMethods',
        payload: { currentPaymentMethodId: paymentMethodId },
      })
      const resource = dynamicNaming(paymentResource)
      const paymentMethod = PaymentMethod.build({ id: paymentMethodId })
      const patchOrder = Order.build({
        id: order.id,
        paymentMethod,
      })
      // @ts-ignore
      await patchOrder.withCredentials(config).save()
      if (resource) {
        const o = Order.build({ id: order.id, resource: resource })
        const ps = await resource.withCredentials(config).create({
          order: o,
        })
        dispatch({
          type: 'setPaymentSource',
          payload: {
            paymentSource: ps,
          },
        })
      }
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
  attributes?: Record<
    string,
    string | Record<string, string | number | undefined>
  >
  order?: OrderCollection
  paymentResource: SDKPaymentResource
  paymentSourceId?: string
  customerPaymentSourceId?: string
}) => Promise<SetPaymentSourceResponse>

export const setPaymentSource: SetPaymentSource = async ({
  config,
  dispatch,
  getOrder,
  attributes = {},
  order,
  paymentResource,
  customerPaymentSourceId,
  paymentSourceId,
}) => {
  try {
    if (config && order) {
      let paymentSource = null
      const resourceSdk = CLayer[paymentResource]
      const o = Order.build({ id: order.id })
      if (!customerPaymentSourceId) {
        if (!paymentSourceId) {
          paymentSource = await resourceSdk.withCredentials(config).create({
            ...attributes,
            order: o,
          })
        } else {
          debugger
          paymentSource = await resourceSdk
            .build({ id: paymentSourceId })
            .withCredentials(config)
            .update({ ...attributes })
        }
      } else {
        paymentSource = (
          await Order.withCredentials(config).build({ id: order.id }).update({
            _customerPaymentSourceId: customerPaymentSourceId,
          })
        )
          // @ts-ignore
          .paymentSource()
      }
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
  stripePayment?: StripeConfig
  braintreePayment?: BraintreeConfig
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

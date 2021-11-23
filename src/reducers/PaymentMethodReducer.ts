import { AdyenPaymentConfig } from '#components/AdyenPayment'
import { BraintreeConfig } from '#components/BraintreePayment'
import { PaypalConfig } from '#components/PaypalPayment'
import { StripeConfig } from '#components/StripePayment'
import { WireTransferConfig } from '#components/WireTransferPayment'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext, updateOrder } from '#reducers/OrderReducer'
import { BaseError } from '#typings/errors'
import baseReducer from '#utils/baseReducer'
import getErrors, { setErrors } from '#utils/getErrors'
import getSdk from '#utils/getSdk'
import {
  Order,
  PaymentMethod,
  StripePayment,
  WireTransfer,
  AdyenPayment,
  BraintreePayment,
  CheckoutComPayment,
  ExternalPayment,
  PaypalPayment,
} from '@commercelayer/sdk'
import camelCase from 'lodash/camelCase'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import { Dispatch, MutableRefObject } from 'react'

export type PaymentSourceType =
  | AdyenPayment
  | BraintreePayment
  | CheckoutComPayment
  | ExternalPayment
  | PaypalPayment
  | StripePayment
  | WireTransfer

export type PaymentMethodActionType =
  | 'setErrors'
  | 'setPaymentMethods'
  | 'setPaymentMethodConfig'
  | 'setPaymentSource'
  | 'setPaymentRef'
  | 'setLoading'

export type PaymentRef = MutableRefObject<null | HTMLFormElement>

export interface PaymentMethodActionPayload {
  errors: BaseError[]
  paymentMethods: PaymentMethod[]
  currentPaymentMethodType: PaymentResource
  currentPaymentMethodId: string
  currentPaymentMethodRef: PaymentRef
  config: PaymentMethodConfig
  paymentSource: PaymentSourceTypes
  loading: boolean
}

export function setLoading({
  loading,
  dispatch,
}: {
  loading: boolean
  dispatch?: Dispatch<PaymentMethodAction>
}) {
  dispatch &&
    dispatch({
      type: 'setLoading',
      payload: { loading },
    })
}

export type SetPaymentRef = (args: {
  ref: PaymentRef
  dispatch?: Dispatch<PaymentMethodAction>
}) => void

export const setPaymentRef: SetPaymentRef = ({ ref, dispatch }) => {
  if (ref && dispatch) {
    dispatch({
      type: 'setPaymentRef',
      payload: {
        currentPaymentMethodRef: ref,
      },
    })
  }
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
  order: Order
  dispatch: Dispatch<PaymentMethodAction>
}) => Promise<void>

export const getPaymentMethods: GetPaymentMethods = async ({
  order,
  dispatch,
}) => {
  const paymentMethods = order.available_payment_methods
  const paymentMethod = order.payment_method
  const paymentSource = order.payment_source
  dispatch({
    type: 'setPaymentMethods',
    payload: {
      paymentMethods,
      currentPaymentMethodId: paymentMethod?.id,
      currentPaymentMethodType:
        paymentMethod?.payment_source_type as PaymentResource,
      paymentSource,
    },
  })
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
  | 'adyenPayment'

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
  updateOrder?: typeof updateOrder
  setOrderErrors?: (collection: any) => { success: boolean }
  order?: Order
  paymentMethodId: string
  paymentResource?: PaymentResource
}) => Promise<void>

export const setPaymentMethod: SetPaymentMethod = async ({
  config,
  dispatch,
  order,
  paymentMethodId,
  updateOrder,
  setOrderErrors,
  paymentResource,
}) => {
  try {
    if (config && order && dispatch && paymentResource) {
      localStorage.removeItem('_save_payment_source_to_customer_wallet')
      const sdk = getSdk(config)
      const attributes = {
        payment_method: sdk.payment_methods.relationship(paymentMethodId),
      }
      dispatch({
        type: 'setPaymentMethods',
        payload: {
          currentPaymentMethodId: paymentMethodId,
          currentPaymentMethodType: paymentResource,
          errors: [],
        },
      })
      updateOrder && (await updateOrder({ id: order.id, attributes }))
      // const attrs: any = {
      //   order: sdk.orders.relationship(order.id),
      // }
      // debugger
      // const paymentSource = await sdk[paymentResource].create(attrs)
      // dispatch({
      //   type: 'setPaymentMethods',
      //   payload: {
      //     currentPaymentMethodId: paymentMethodId,
      //     currentPaymentMethodType: paymentResource,
      //     paymentSource,
      //     errors: [],
      //   },
      // })
      setOrderErrors && setOrderErrors([])
    }
  } catch (error) {
    const errors = getErrors(error, 'orders')
    console.error('Set payment method', errors)
    // if (dispatch)
    // setErrors({
    //   currentErrors: state?.errors,
    //   newErrors: errors,
    //   dispatch,
    // })
  }
}

type PaymentSourceTypes =
  | (StripePayment & WireTransfer)
  | (StripePayment | WireTransfer)

export type SetPaymentSourceResponse = {
  order: Order
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
    order?: Order
    paymentResource: PaymentResource
    paymentSourceId?: string
    customerPaymentSourceId?: string
    updateOrder?: typeof updateOrder
  } & PaymentMethodState
) => Promise<PaymentSourceType | void>

export const setPaymentSource: SetPaymentSource = async ({
  config,
  dispatch,
  getOrder,
  attributes = {},
  order,
  paymentResource,
  customerPaymentSourceId,
  paymentSourceId,
  updateOrder,
  errors: currentErrors,
}) => {
  try {
    if (config && order) {
      let paymentSource: PaymentSourceType
      const sdk = getSdk(config)
      // const resourceSdk = dynamicNaming(paymentResource)
      // const o = Order.build({ id: order.id })
      if (!customerPaymentSourceId) {
        if (!paymentSourceId) {
          const attrs: any = {
            ...attributes,
            order: sdk.orders.relationship(order.id),
          }
          paymentSource = await sdk[paymentResource].create(attrs)
        } else {
          paymentSource = await sdk[paymentResource].update({
            id: paymentSourceId,
            ...attributes,
          })
        }
        dispatch &&
          dispatch({
            type: 'setPaymentSource',
            payload: { paymentSource, errors: [] },
          })
        getOrder && (await getOrder(order.id))
        return paymentSource
      } else {
        updateOrder &&
          (await updateOrder({
            id: order.id,
            attributes: {
              _customer_payment_source_id: customerPaymentSourceId,
            },
          }))
        // paymentSource = (
        //   await Order.includes('paymentSource')
        //     .build({ id: order.id })
        //     .withCredentials(config)
        //     .update({
        //       _customerPaymentSourceId: customerPaymentSourceId,
        //     })
        // ).paymentSource()
      }
      // if (order?.billingAddress() === null)
      //   await order.withCredentials(config).loadBillingAddress()
      // if (order?.paymentSource() === null)
      //   await order.withCredentials(config).loadPaymentSource()
      // dispatch &&
      //   dispatch({
      //     type: 'setPaymentSource',
      //     payload: { paymentSource, errors: [] },
      //   })
      // if (getOrder) order = (await getOrder(order?.id)) as Order
      // return {
      //   order,
      //   paymentSource,
      // }
    }
  } catch (error: any) {
    const errors = getErrors(error, 'payment_methods')
    console.error('Set payment source:', errors)
    if (dispatch)
      setErrors({
        currentErrors,
        newErrors: errors,
        dispatch,
      })
  }
  return
}

export type UpdatePaymentSource = (args: {
  id: string
  attributes: Record<string, any>
  paymentResource: PaymentResource
  config?: CommerceLayerConfig
  dispatch?: Dispatch<PaymentMethodAction>
}) => Promise<void>

export const updatePaymentSource: UpdatePaymentSource = async ({
  id,
  attributes,
  config,
  dispatch,
  paymentResource,
}) => {
  if (config) {
    try {
      const sdk = getSdk(config)
      const paymentSource = await sdk[paymentResource].update({
        id,
        ...attributes,
      })
      dispatch &&
        dispatch({
          type: 'setPaymentSource',
          payload: { paymentSource },
        })
    } catch (err) {
      console.error('Update payment source:', err)
    }
  }
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
    dispatch &&
      dispatch({
        type: 'setPaymentSource',
        payload: { paymentSource: undefined },
      })
  }
}

export type PaymentMethodConfig = {
  stripePayment?: StripeConfig
  braintreePayment?: BraintreeConfig
  wireTransfer?: Partial<WireTransferConfig>
  paypalPayment?: PaypalConfig
  adyenPayment?: AdyenPaymentConfig
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
  'setPaymentRef',
  'setLoading',
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

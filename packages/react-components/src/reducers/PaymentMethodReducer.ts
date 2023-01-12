import { AdyenPaymentConfig } from '#components/payment_source/AdyenPayment'
import { BraintreeConfig } from '#components/payment_source/BraintreePayment'
import { PaypalConfig } from '#components/payment_source/PaypalPayment'
import { StripeConfig } from '#components/payment_source/StripePayment'
import { WireTransferConfig } from '#components/payment_source/WireTransferPayment'
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
  KlarnaPayment
} from '@commercelayer/sdk'
import { Dispatch, MutableRefObject } from 'react'
import { CheckoutComConfig } from '#components/payment_source/CheckoutComPayment'
import { ExternalPaymentConfig } from '#components/payment_source/ExternalPayment'
import { snakeToCamelCase } from '#utils/snakeToCamelCase'
import { replace } from '#utils/replace'
import { pick } from '#utils/pick'
import { ResourceKeys } from '#utils/getPaymentAttributes'

export type PaymentSourceType =
  | AdyenPayment
  | BraintreePayment
  | CheckoutComPayment
  | ExternalPayment
  | PaypalPayment
  | StripePayment
  | WireTransfer

interface Card {
  type: string
  brand: string
  last4: string
  exp_year: number
  exp_month: number
}

export interface PaymentSourceObject {
  adyen_payments: AdyenPayment & {
    payment_request_data?: {
      payment_method?: Card
    }
    payment_response?: {
      resultCode?: 'Authorised'
    }
  }
  braintree_payments: BraintreePayment & {
    options?: {
      card: Card
    }
  }
  external_payments: ExternalPayment & {
    payment_source_token?: string
  }
  paypal_payments: PaypalPayment
  stripe_payments: StripePayment & {
    options?: {
      card: Card
    }
  }
  wire_transfers: WireTransfer
  checkout_com_payments: CheckoutComPayment & {
    payment_response: {
      source?: Pick<Card, 'last4'> & {
        scheme: string
        expiry_year: number
        expiry_month: number
      }
    }
  }
  klarna_payments: KlarnaPayment
}

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
  dispatch
}: {
  loading: boolean
  dispatch?: Dispatch<PaymentMethodAction>
}): void {
  if (dispatch)
    dispatch({
      type: 'setLoading',
      payload: { loading }
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
        currentPaymentMethodRef: ref
      }
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
  paymentMethods: undefined
}

export type SetPaymentMethodErrors = <V extends BaseError[]>(
  errors: V,
  dispatch?: Dispatch<PaymentMethodAction>
) => void

export const setPaymentMethodErrors: SetPaymentMethodErrors = (
  errors,
  dispatch
) => {
  if (dispatch)
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
}

type GetPaymentMethods = (args: {
  order: Order
  dispatch: Dispatch<PaymentMethodAction>
}) => Promise<void>

export const getPaymentMethods: GetPaymentMethods = async ({
  order,
  dispatch
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
      paymentSource
    }
  })
}

export type PaymentResource = keyof PaymentSourceObject

export type PaymentResourceKey =
  | 'braintreePayment'
  | 'stripePayment'
  | 'klarnaPayment'
  | 'wireTransfer'
  | 'paypalPayment'
  | 'adyenPayment'
  | 'checkoutComPayment'

export type SDKPaymentResource =
  | 'AdyenPayment'
  | 'BraintreePayment'
  | 'ExternalPayment'
  | 'PaypalPayment'
  | 'StripePayment'
  | 'WireTransfer'
  | 'CheckoutComPayment'

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
  paymentResource
}) => {
  try {
    if (config && order && dispatch && paymentResource) {
      localStorage.removeItem('_save_payment_source_to_customer_wallet')
      const sdk = getSdk(config)
      const attributes = {
        payment_method: sdk.payment_methods.relationship(paymentMethodId)
      }
      updateOrder && (await updateOrder({ id: order.id, attributes }))
      dispatch({
        type: 'setPaymentMethods',
        payload: {
          currentPaymentMethodId: paymentMethodId,
          currentPaymentMethodType: paymentResource,
          errors: []
        }
      })
      if (setOrderErrors) setOrderErrors([])
    }
  } catch (error) {
    const errors = getErrors(error, 'orders', paymentResource)
    console.error('Set payment method', errors)
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
    attributes?: Record<string, unknown>
    order?: Order
    paymentResource: PaymentResource
    paymentSourceId?: string
    customerPaymentSourceId?: string
    updateOrder?: typeof updateOrder
  } & PaymentMethodState
) => Promise<PaymentSourceType | undefined>

export const setPaymentSource: SetPaymentSource = async ({
  config,
  dispatch,
  getOrder,
  attributes,
  order,
  paymentResource,
  customerPaymentSourceId,
  paymentSourceId,
  updateOrder,
  errors: currentErrors
}): Promise<PaymentSourceType | undefined> => {
  try {
    if (config && order) {
      let paymentSource: PaymentSourceType
      const sdk = getSdk(config)
      if (!customerPaymentSourceId) {
        if (!paymentSourceId) {
          const attrs: any = {
            ...attributes,
            order: sdk.orders.relationship(order.id)
          }
          paymentSource = await sdk[paymentResource].create(attrs)
        } else {
          const attrs = {
            id: paymentSourceId,
            ...attributes
          }
          // @ts-expect-error
          paymentSource =
            attributes != null
              ? await sdk[paymentResource].update(attrs)
              : sdk[paymentResource].retrieve(paymentSourceId)
        }
        getOrder && (await getOrder(order.id))
        if (dispatch) {
          dispatch({
            type: 'setPaymentSource',
            payload: { paymentSource, errors: [] }
          })
        }
        return paymentSource
      } else {
        updateOrder &&
          (await updateOrder({
            id: order.id,
            attributes: {
              _customer_payment_source_id: customerPaymentSourceId
            }
          }))
      }
    }
  } catch (error: any) {
    const errors = getErrors(error, 'payment_methods', paymentResource)
    console.error('Set payment source:', errors)
    if (dispatch) {
      setErrors({
        currentErrors,
        newErrors: errors,
        dispatch
      })
    }
  }
  return undefined
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
  paymentResource
}) => {
  if (config) {
    try {
      const sdk = getSdk(config)
      const paymentSource = await sdk[paymentResource].update({
        id,
        ...attributes
      })
      if (dispatch) {
        dispatch({
          type: 'setPaymentSource',
          payload: { paymentSource }
        })
      }
    } catch (err) {
      console.error('Update payment source:', err)
    }
  }
}

export type DestroyPaymentSource = (args: {
  paymentSourceId: string
  paymentResource: PaymentResource
  dispatch?: Dispatch<PaymentMethodAction>
  updateOrder?: typeof updateOrder
  orderId?: string
}) => Promise<void>

export const destroyPaymentSource: DestroyPaymentSource = async ({
  paymentSourceId,
  paymentResource,
  dispatch
  // updateOrder,
  // orderId,
}) => {
  if (paymentSourceId && paymentResource) {
    // await updateOrder({
    //   id: orderId,
    //   attributes: {
    //     payment_source: {},
    //   },
    // })
    if (dispatch)
      dispatch({
        type: 'setPaymentSource',
        payload: { paymentSource: undefined }
      })
  }
}

export interface PaymentMethodConfig {
  adyenPayment?: AdyenPaymentConfig
  braintreePayment?: BraintreeConfig
  checkoutComPayment?: CheckoutComConfig
  externalPayment?: ExternalPaymentConfig
  klarnaPayment?: Pick<AdyenPaymentConfig, 'placeOrderCallback'> &
    Pick<StripeConfig, 'containerClassName'>
  paypalPayment?: PaypalConfig
  stripePayment?: StripeConfig
  wireTransfer?: Partial<WireTransferConfig>
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
    payload: { config }
  })
}

export function getPaymentConfig<
  R extends PaymentResource = PaymentResource,
  K extends PaymentMethodConfig = PaymentMethodConfig
>(paymentResource: R, config: K): Pick<K, ResourceKeys<R>> {
  const resourceKeys = replace(
    replace(paymentResource, 'payments', 'payment'),
    'transfers',
    'transfer'
  )
  const resource = snakeToCamelCase(resourceKeys)
  return pick(config, [resource])
}

const type: PaymentMethodActionType[] = [
  'setErrors',
  'setPaymentMethodConfig',
  'setPaymentMethods',
  'setPaymentSource',
  'setPaymentRef',
  'setLoading'
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

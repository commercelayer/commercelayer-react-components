import CLayer, { Order, OrderCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { SetLocalOrder, DeleteLocalOrder } from '#utils/localStorage'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import baseReducer from '#utils/baseReducer'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import { ItemOption, CustomLineItem } from './ItemReducer'
import { isEmpty, size, map } from 'lodash'
import { BaseMetadataObject } from '#typings/index'
import { BaseError } from '#typings/errors'

export interface GetOrderParams {
  clearWhenPlaced?: boolean
  config: CommerceLayerConfig
  deleteLocalOrder?: DeleteLocalOrder
  dispatch: Dispatch<OrderActions>
  id: string
  persistKey?: string
}

export interface GetOrder {
  (params: GetOrderParams): Promise<void | OrderCollection>
}

export interface SetOrderErrors {
  (params: { dispatch: Dispatch<OrderActions>; collection: any }): {
    success: boolean
  }
}

type CreateOrderParams = Pick<
  AddToCartParams,
  | 'config'
  | 'dispatch'
  | 'persistKey'
  | 'state'
  | 'orderMetadata'
  | 'orderAttributes'
  | 'setLocalOrder'
>

export interface CreateOrder {
  (params: CreateOrderParams): Promise<string>
}

export interface AddToCartParams {
  skuCode: string
  persistKey: string
  config: CommerceLayerConfig
  dispatch: Dispatch<OrderActions>
  state: Partial<OrderState>
  skuId?: string
  quantity?: number
  option?: ItemOption
  lineItem?: CustomLineItem
  orderMetadata?: BaseMetadataObject
  orderAttributes?: Record<string, any>
  errors?: BaseError[]
  setLocalOrder?: SetLocalOrder
}

export interface AddToCartImportParams
  extends Omit<
    AddToCartParams,
    'skuCode' | 'skuId' | 'quantity' | 'option' | 'lineItem'
  > {
  lineItems: CustomLineItem[]
}

export type AddToCartReturn = Promise<{
  success: boolean
}>

export interface AddToCart {
  (params: AddToCartParams): AddToCartReturn
}

export interface AddToCartImport {
  (params: AddToCartImportParams): AddToCartReturn
}

export interface UnsetOrderState {
  (dispatch: Dispatch<OrderActions>): void
}

export interface OrderPayload {
  loading?: boolean
  orderId?: string
  order?: OrderCollection
  errors?: BaseError[]
}

export type AddToCartValues = {
  skuCode: string
  skuId?: string
  quantity?: number
  option?: ItemOption
  lineItem?: CustomLineItem
}

export type AddToCartImportValues = Pick<AddToCartImportParams, 'lineItems'>

export type getOrderContext = (
  id: string
) => Promise<undefined | OrderCollection>

export interface OrderState extends OrderPayload {
  loading: boolean
  orderId: string
  order?: OrderCollection
  saveBillingAddressToCustomerAddressBook: boolean
  saveShippingAddressToCustomerAddressBook: boolean
  getOrder?: getOrderContext
  createOrder?: () => Promise<string>
  addToCart: (values: AddToCartValues) => AddToCartReturn
  setOrderErrors: (collection: any) => { success: boolean }
  setGiftCardOrCouponCode: SetGiftCardOrCouponCode
  removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode
  saveAddressToCustomerAddressBook: (
    type: 'BillingAddress' | 'ShippingAddress',
    value: boolean
  ) => void
}

export interface OrderActions {
  type: OrderActionType
  payload: OrderPayload
}

export type OrderActionType =
  | 'setLoading'
  | 'setOrderId'
  | 'setOrder'
  | 'setSingleQuantity'
  | 'setCurrentSkuCodes'
  | 'setCurrentSkuPrices'
  | 'setCurrentItem'
  | 'setErrors'
  | 'setSaveAddressToCustomerAddressBook'
  | 'setGiftCardOrCouponCode'

const actionType: OrderActionType[] = [
  'setLoading',
  'setOrderId',
  'setOrder',
  'setSingleQuantity',
  'setCurrentSkuCodes',
  'setCurrentSkuPrices',
  'setErrors',
  'setCurrentItem',
  'setSaveAddressToCustomerAddressBook',
]

export const createOrder: CreateOrder = async (params) => {
  const {
    persistKey,
    state,
    dispatch,
    config,
    orderMetadata: metadata,
    orderAttributes = {},
    setLocalOrder,
  } = params
  if (state.orderId) return state.orderId
  const o = await CLayer.Order.withCredentials(config).create({
    metadata,
    ...orderAttributes,
  })
  if (!o.id) return ''
  dispatch({
    type: 'setOrderId',
    payload: {
      orderId: o.id,
    },
  })
  dispatch({
    type: 'setOrder',
    payload: {
      order: o,
    },
  })
  persistKey && setLocalOrder && setLocalOrder(persistKey, o.id)
  return o.id
}

export const getApiOrder: GetOrder = async (params) => {
  const {
    id,
    dispatch,
    config,
    clearWhenPlaced,
    persistKey,
    deleteLocalOrder,
  } = params
  try {
    const o = await Order.withCredentials(config).find(id)
    if (o)
      if (
        (clearWhenPlaced && o.status === 'placed') ||
        o.status === 'approved' ||
        o.status === 'cancelled'
      ) {
        persistKey && deleteLocalOrder && deleteLocalOrder(persistKey)
        dispatch({
          type: 'setOrder',
          payload: {
            order: undefined,
            orderId: '',
          },
        })
      } else {
        dispatch({
          type: 'setOrder',
          payload: {
            order: o,
          },
        })
      }
    return o
  } catch (col) {
    persistKey && deleteLocalOrder && deleteLocalOrder(persistKey)
    dispatch({
      type: 'setOrder',
      payload: {
        order: undefined,
        orderId: '',
      },
    })
    return
  }
}

export const setOrder = (
  order: OrderCollection,
  dispatch: Dispatch<OrderActions>
): void => {
  dispatch({
    type: 'setOrder',
    payload: {
      order,
    },
  })
}

export const addToCart: AddToCart = async (params) => {
  const {
    skuCode,
    skuId,
    quantity,
    option,
    config,
    dispatch,
    lineItem,
    errors,
  } = params
  try {
    const id = await createOrder(params)
    const order = CLayer.Order.build({ id })
    const name = lineItem?.name
    const imageUrl = lineItem?.imageUrl
    const attrs: Record<string, any> = {
      order,
      skuCode,
      name,
      imageUrl,
      quantity: quantity || 1,
      _updateQuantity: 1,
    }
    if (skuId) {
      attrs['item'] = CLayer.Sku.build({ id: skuId })
    }
    const lineItemResource = await CLayer.LineItem.withCredentials(
      config
    ).create(attrs)
    if (!isEmpty(option)) {
      let c = 0
      map(option, async (opt) => {
        const { options, skuOptionId } = opt
        const skuOption = CLayer.SkuOption.build({ id: skuOptionId })
        await CLayer.LineItemOption.withCredentials(config).create({
          quantity: 1,
          options,
          lineItem: lineItemResource,
          skuOption,
        })
        c += 1
        if (c === size(option)) {
          await getApiOrder({ id, ...params })
        }
      })
    } else {
      await getApiOrder({ id, ...params })
    }
    if (!isEmpty(errors)) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
    }
    return { success: true }
  } catch (col) {
    const errors = getErrorsByCollection(col, 'order')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
    return { success: false }
  }
}

export const unsetOrderState: UnsetOrderState = (dispatch) => {
  dispatch({
    type: 'setOrderId',
    payload: {
      orderId: '',
    },
  })
  dispatch({
    type: 'setOrder',
    payload: {
      order: undefined,
    },
  })
}

export const setOrderErrors: SetOrderErrors = ({ dispatch, collection }) => {
  const errors = getErrorsByCollection(collection, 'order')
  dispatch({
    type: 'setErrors',
    payload: {
      errors,
    },
  })
  return { success: false }
}

type SaveAddressToCustomerAddressBook = (params: {
  dispatch: Dispatch<OrderActions>
  type: 'BillingAddress' | 'ShippingAddress'
  value: boolean
}) => void

export const saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook =
  ({ type, value, dispatch }) => {
    const k = `save${type}ToCustomerBook`
    const v = `${value}`
    localStorage.setItem(k, v)
    dispatch({
      type: 'setSaveAddressToCustomerAddressBook',
      payload: {
        [k]: v,
      },
    })
  }

type SetGiftCardOrCouponCode = (args: {
  code: string
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  order?: OrderCollection
}) => Promise<{ success: boolean }>

export const setGiftCardOrCouponCode: SetGiftCardOrCouponCode = async ({
  code,
  dispatch,
  config,
  order,
}) => {
  try {
    if (config && order && code && dispatch) {
      const o = await Order.build({ id: order.id })
        .withCredentials(config)
        .update({
          giftCardOrCouponCode: code,
        })
      if (!o.errors().empty()) throw o
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
      getApiOrder({ id: order.id, config, dispatch })
      return { success: true }
    }
    return { success: false }
  } catch (e) {
    dispatch && setOrderErrors({ collection: e, dispatch })
    return { success: false }
  }
}

export type CodeType = 'coupon' | 'giftCard'
export type OrderCodeType = `${CodeType}Code`

type RemoveGiftCardOrCouponCode = (args: {
  codeType: OrderCodeType
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  order?: OrderCollection
}) => Promise<{ success: boolean }>

export const removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode = async ({
  codeType,
  dispatch,
  config,
  order,
}) => {
  try {
    if (config && order && dispatch) {
      const o = await Order.build({ id: order.id })
        .withCredentials(config)
        .update({
          [codeType]: '',
        })
      if (!o.errors().empty()) throw o
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
      getApiOrder({ id: order.id, config, dispatch })
      return { success: true }
    }
    return { success: false }
  } catch (e) {
    dispatch && setOrderErrors({ collection: e, dispatch })
    return { success: false }
  }
}

export const orderInitialState: Partial<OrderState> = {
  loading: false,
  orderId: '',
  order: undefined,
  errors: [],
}

const orderReducer = (
  state: Partial<OrderState>,
  reducer: OrderActions
): Partial<OrderState> =>
  baseReducer<Partial<OrderState>, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType
  )

export default orderReducer

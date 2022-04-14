import { Dispatch } from 'react'
import {
  SetLocalOrder,
  DeleteLocalOrder,
  setCustomerOrderParam,
  CustomerOrderParams,
} from '#utils/localStorage'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import baseReducer from '#utils/baseReducer'
import { ItemOption, CustomLineItem } from './ItemReducer'
import { isEmpty, size, map } from 'lodash'
import { BaseMetadataObject } from '#typings/index'
import { BaseError } from '#typings/errors'
import getSdk from '#utils/getSdk'
import getErrors, { setErrors } from '../utils/getErrors'
import { AddressResource } from './AddressReducer'
import {
  Order,
  LineItemCreate,
  LineItemOptionCreate,
  OrderUpdate,
  QueryParamsRetrieve,
} from '@commercelayer/sdk'
import getOrganizationSlug from '#utils/organization'

export type GetOrderParams = Partial<{
  clearWhenPlaced: boolean
  config: CommerceLayerConfig
  deleteLocalOrder: DeleteLocalOrder
  dispatch: Dispatch<OrderActions>
  id: string
  persistKey: string
  state: OrderState
}>

export interface GetOrder {
  (params: GetOrderParams): Promise<void | Order>
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
  (params?: CreateOrderParams): Promise<string>
}

export type AddToCartParams = Partial<{
  bundleCode: string
  skuCode: string
  persistKey: string
  config: CommerceLayerConfig
  dispatch: Dispatch<OrderActions>
  state: Partial<OrderState>
  skuId: string
  quantity: number
  option: ItemOption
  lineItem: CustomLineItem
  orderMetadata: BaseMetadataObject
  orderAttributes: Record<string, any>
  errors: BaseError[]
  setLocalOrder: SetLocalOrder
  buyNowMode: boolean
  checkoutUrl: string
}>

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

export type ResourceIncluded =
  | 'billing_address'
  | 'shipping_address'
  | 'line_items.line_item_options.sku_option'
  | 'line_items.item'
  | 'available_customer_payment_sources.payment_source'
  | 'shipments.available_shipping_methods'
  | 'shipments.stock_transfers'
  | 'shipments.shipment_line_items.line_item'
  | 'shipments.shipping_method'
  | 'shipments.stock_location'
  | 'payment_source'
  | 'available_payment_methods'
  | 'payment_method'

type ResourceIncludedLoaded = Partial<Record<ResourceIncluded, boolean>>

export interface OrderPayload {
  loading?: boolean
  orderId?: string
  order?: Order
  errors?: BaseError[]
  include?: ResourceIncluded[]
  includeLoaded?: ResourceIncludedLoaded
}

export type AddToCartValues = Pick<
  AddToCartParams,
  | 'bundleCode'
  | 'lineItem'
  | 'quantity'
  | 'skuCode'
  | 'skuId'
  | 'option'
  | 'buyNowMode'
  | 'checkoutUrl'
>

export type AddToCartImportValues = Pick<AddToCartImportParams, 'lineItems'>

export type getOrderContext = (id: string) => Promise<void | Order>

export type OrderState = Partial<OrderPayload>

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
  | 'setIncludesResource'

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
  'setIncludesResource',
]

export const createOrder: CreateOrder = async (params) => {
  if (params) {
    const {
      persistKey,
      state,
      dispatch,
      config,
      orderMetadata: metadata,
      orderAttributes = {},
      setLocalOrder,
    } = params
    if (state?.orderId) return state.orderId
    const sdk = getSdk(config as CommerceLayerConfig)
    try {
      const o = await sdk?.orders.create({ metadata, ...orderAttributes })
      dispatch &&
        dispatch({
          type: 'setOrderId',
          payload: {
            orderId: o?.id,
          },
        })
      persistKey && setLocalOrder && setLocalOrder(persistKey, o.id)
      return o.id
    } catch (error: any) {
      const errors = getErrors(error, 'orders')
      console.error('Create order', errors)
      if (dispatch)
        setErrors({
          currentErrors: state?.errors,
          newErrors: errors,
          dispatch,
        })
    }
  }
  return ''
}

export const getApiOrder: GetOrder = async (params) => {
  const {
    id,
    dispatch,
    config,
    clearWhenPlaced,
    persistKey,
    deleteLocalOrder,
    state,
  } = params
  const sdk = getSdk(config as CommerceLayerConfig)
  try {
    const options: QueryParamsRetrieve = {}
    if (state?.include && state.include.length > 0) {
      options.include = state.include
    }
    const order = await sdk.orders.retrieve(id as string, options)
    if (
      (clearWhenPlaced && order.status === 'placed') ||
      order.status === 'approved' ||
      order.status === 'cancelled'
    ) {
      persistKey && deleteLocalOrder && deleteLocalOrder(persistKey)
      dispatch &&
        dispatch({
          type: 'setOrder',
          payload: {
            order: undefined,
            orderId: '',
          },
        })
    } else {
      dispatch &&
        dispatch({
          type: 'setOrder',
          payload: {
            order: order,
            orderId: order.id,
          },
        })
    }
    return order
  } catch (error: any) {
    const errors = getErrors(error, 'orders')
    console.error('Retrieve order', errors)
    if (dispatch)
      setErrors({
        currentErrors: state?.errors,
        newErrors: errors,
        dispatch,
      })
    return
  }
}

export type UpdateOrderArgs = {
  id: string
  attributes: Omit<OrderUpdate, 'id'>
  dispatch?: Dispatch<OrderActions>
  include?: string[]
  config?: CommerceLayerConfig
  state?: OrderState
}

export async function updateOrder({
  id,
  attributes,
  dispatch,
  config,
  include,
  state,
}: UpdateOrderArgs) {
  const sdk = getSdk(config as CommerceLayerConfig)
  try {
    const resource = { ...attributes, id }
    // const order = await sdk.orders.update(resource, { include })
    await sdk.orders.update(resource, { include })
    // NOTE: Retrieve doesn't response with attributes updated
    const order = await getApiOrder({ id, config, dispatch, state })
    dispatch && order && dispatch({ type: 'setOrder', payload: { order } })
    return { success: true }
  } catch (error) {
    const errors = getErrors(error, 'orders')
    if (dispatch) {
      setOrderErrors({ errors, dispatch })
      dispatch({
        type: 'setErrors',
        payload: {
          errors,
        },
      })
    }
    return { success: false, error }
  }
}

export const setOrder = (
  order: Order,
  dispatch?: Dispatch<OrderActions>
): void => {
  dispatch &&
    dispatch({
      type: 'setOrder',
      payload: {
        order,
      },
    })
}

export type AddResourceToInclude = {
  resourcesIncluded?: ResourceIncluded[]
  dispatch?: Dispatch<OrderActions>
  newResource?: ResourceIncluded | ResourceIncluded[]
  resourceIncludedLoaded?: ResourceIncludedLoaded
  newResourceLoaded?: ResourceIncludedLoaded
}

export function addResourceToInclude({
  resourcesIncluded = [],
  dispatch,
  newResource,
  newResourceLoaded,
  resourceIncludedLoaded,
}: AddResourceToInclude) {
  const payload: any = {
    include: undefined,
    includeLoaded: undefined,
  }
  if (newResource) {
    payload.include = [
      ...resourcesIncluded,
      ...(typeof newResource === 'string' ? [newResource] : newResource),
    ]
  } else {
    delete payload.include
  }
  payload.includeLoaded = { ...resourceIncludedLoaded, ...newResourceLoaded }
  dispatch &&
    dispatch({
      type: 'setIncludesResource',
      payload,
    })
}

export const addToCart: AddToCart = async (params) => {
  const {
    skuCode,
    bundleCode,
    skuId,
    quantity,
    option,
    config,
    dispatch,
    lineItem,
    state,
    errors = [],
    buyNowMode,
    checkoutUrl,
  } = params
  try {
    if (!config)
      throw {
        errors: [
          {
            code: 'INVALID_RESOURCE',
            resource: 'orders',
            title: 'Markup error',
            message:
              'You are trying to place an order outside the OrderContainer component',
          },
        ] as BaseError[],
      }
    const sdk = getSdk(config as CommerceLayerConfig)
    const id = await createOrder(params)
    if (id) {
      const order = sdk.orders.relationship(id)
      const name = lineItem?.name
      const imageUrl = lineItem?.imageUrl as string
      const attrs: LineItemCreate = {
        order,
        sku_code: skuCode,
        name,
        image_url: imageUrl,
        quantity: quantity || 1,
        _update_quantity: true,
        bundle_code: bundleCode,
      }
      if (skuId) {
        attrs['item'] = sdk.skus.relationship(skuId)
      }
      const newLineItem = await sdk.line_items.create(attrs)
      if (!isEmpty(option)) {
        let c = 0
        map(option, async (opt) => {
          const { options, skuOptionId } = opt
          const skuOption = sdk.sku_options.relationship(skuOptionId)
          const lineItemRel = sdk.line_items.relationship(newLineItem.id)
          const lineItemOptionsAttributes: LineItemOptionCreate = {
            quantity: 1,
            options,
            sku_option: skuOption,
            line_item: lineItemRel,
          }
          await sdk.line_item_options.create(lineItemOptionsAttributes)
          c += 1
          if (c === size(option)) {
            await getApiOrder({ id, ...params })
          }
        })
      } else {
        await getApiOrder({ id, ...params, state })
      }
      if (!isEmpty(errors) && dispatch) {
        dispatch({
          type: 'setErrors',
          payload: {
            errors: [],
          },
        })
      }
      if (buyNowMode) {
        const { organization } = getOrganizationSlug(config.endpoint)
        const params = `${id}?accessToken=${config.accessToken}`
        const redirectUrl = checkoutUrl
          ? `${checkoutUrl}/${params}`
          : `https://${organization}.checkout.commercelayer.app/${params}`
        location.href = redirectUrl
      }
      return { success: true }
    }
    return { success: false }
  } catch (error: any) {
    const errors = getErrors(error, 'orders')
    console.error('Add to cart', errors)
    if (dispatch)
      setErrors({
        currentErrors: state?.errors,
        newErrors: errors,
        dispatch,
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

type OrderErrors = {
  dispatch?: Dispatch<OrderActions>
  errors: BaseError[]
}

export function setOrderErrors({ dispatch, errors = [] }: OrderErrors) {
  dispatch &&
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  return { success: false }
}

export type SaveAddressToCustomerAddressBook = (params: {
  dispatch?: Dispatch<OrderActions>
  type: AddressResource
  value: boolean
}) => void

export const saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook =
  ({ type, value, dispatch }) => {
    const k: CustomerOrderParams = `_save_${type}_to_customer_address_book`
    const v = `${value}`
    setCustomerOrderParam(k, v)
    dispatch &&
      dispatch({
        type: 'setSaveAddressToCustomerAddressBook',
        payload: {
          [k]: v,
        },
      })
  }

export type SetGiftCardOrCouponCode = (args: {
  code: string
  codeType: OrderCodeType
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  order?: Order
  include?: string[]
  state?: OrderState
}) => Promise<{ success: boolean }>

export const setGiftCardOrCouponCode: SetGiftCardOrCouponCode = async ({
  code,
  codeType,
  dispatch,
  config,
  order,
  include,
  state,
}) => {
  try {
    if (config && order && code && dispatch) {
      const attributes: Omit<OrderUpdate, 'id'> = {
        [codeType]: code,
      }
      const { success, error } = await updateOrder({
        id: order.id,
        attributes,
        config,
        include,
        dispatch,
        state,
      })
      if (!success) throw error
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
      return { success }
    }
    return { success: false }
  } catch (error: any) {
    const errors = getErrors(error, 'orders', codeType)
    dispatch && setOrderErrors({ errors, dispatch })
    return { success: false }
  }
}

export type CodeType = 'coupon' | 'gift_card' | 'gift_card_or_coupon'
export type OrderCodeType = `${CodeType}_code`

export type RemoveGiftCardOrCouponCode = (args: {
  codeType: OrderCodeType
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  order?: Order
  include?: string[]
  state?: OrderState
}) => Promise<{ success: boolean }>

export const removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode = async ({
  codeType,
  dispatch,
  config,
  order,
  include,
  state,
}) => {
  try {
    if (config && order && dispatch) {
      const attributes: Omit<OrderUpdate, 'id'> = {
        [codeType]: '',
      }
      await updateOrder({
        id: order.id,
        attributes,
        config,
        include,
        dispatch,
        state,
      })
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
      return { success: true }
    }
    return { success: false }
  } catch (error: any) {
    const errors = getErrors(error, 'orders', codeType)
    console.error('Remove gift card o coupon code', errors)
    dispatch && setOrderErrors({ errors, dispatch })
    return { success: false }
  }
}

export const orderInitialState: Partial<OrderState> = {
  loading: false,
  orderId: '',
  order: undefined,
  errors: [],
  include: [],
}

const orderReducer = (state: OrderState, reducer: OrderActions): OrderState =>
  baseReducer<OrderState, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType
  )

export default orderReducer

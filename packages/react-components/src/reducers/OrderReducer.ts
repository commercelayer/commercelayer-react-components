import type { Dispatch } from "react"
import {
  type SetLocalOrder,
  type DeleteLocalOrder,
  setCustomerOrderParam,
  type CustomerOrderParams,
} from "#utils/localStorage"
import type { CommerceLayerConfig } from "#context/CommerceLayerContext"
import baseReducer from "#utils/baseReducer"
import isEmpty from "lodash/isEmpty"
import type { BaseMetadataObject } from "#typings/index"
import type { BaseError } from "#typings/errors"
import getSdk from "#utils/getSdk"
import getErrors, { setErrors } from "../utils/getErrors"
import type { AddressResource } from "./AddressReducer"
import type {
  Order,
  LineItemCreate,
  LineItemOptionCreate,
  OrderUpdate,
  QueryParamsRetrieve,
  CommerceLayerClient,
  ResourceUpdate,
  AdyenPaymentUpdate,
} from "@commercelayer/sdk"
import { getOrganizationConfig } from "#utils/organization"
import type { LooseAutocomplete } from "#typings/globals"
import { publish } from "#utils/events"
import { getDomain } from "#utils/getDomain"
import { getApplicationLink } from "#utils/getApplicationLink"

export type GetOrderParams = Partial<{
  clearWhenPlaced: boolean
  config: CommerceLayerConfig
  deleteLocalOrder: DeleteLocalOrder
  dispatch: Dispatch<OrderActions>
  id: string
  persistKey: string
  state: OrderState
}>

export type GetOrder = (params: GetOrderParams) => Promise<undefined | Order>

type CreateOrderParams = Pick<
  AddToCartParams,
  | "config"
  | "dispatch"
  | "persistKey"
  | "state"
  | "orderMetadata"
  | "orderAttributes"
  | "setLocalOrder"
>

export interface AddToCartImportParams
  extends Omit<
    AddToCartParams,
    "skuCode" | "skuId" | "quantity" | "option" | "lineItem"
  > {
  lineItems: CustomLineItem[]
}

export type AddToCartReturn = Promise<{
  success: boolean
  orderId: string | undefined
}>

export type AddToCartImport = (params: AddToCartImportParams) => AddToCartReturn

export type UnsetOrderState = (dispatch: Dispatch<OrderActions>) => void

export type ResourceIncluded =
  | "billing_address"
  | "shipping_address"
  | "line_items.line_item_options.sku_option"
  | "line_items.item"
  | "available_customer_payment_sources.payment_source"
  | "available_customer_payment_sources.payment_method"
  | "shipments.available_shipping_methods"
  | "shipments.stock_transfers"
  | "shipments.stock_transfers.line_item"
  | "shipments.stock_line_items.line_item"
  | "shipments.shipping_method"
  | "shipments.stock_location"
  | "shipments.parcels"
  | "shipments.parcels.parcel_line_items"
  | "payment_source"
  | "available_payment_methods"
  | "payment_method"

type ResourceIncludedLoaded = Partial<Record<ResourceIncluded, boolean>>

export interface OrderPayload {
  loading?: boolean
  orderId?: string
  order?: Order
  errors?: BaseError[]
  include?: ResourceIncluded[] | undefined
  includeLoaded?: ResourceIncludedLoaded
  withoutIncludes?: boolean
  manageAdyenGiftCard?: boolean
}

export type AddToCartImportValues = Pick<AddToCartImportParams, "lineItems">

export type getOrderContext = (id: string) => Promise<undefined | Order>

export type OrderState = Partial<OrderPayload>

export interface OrderActions {
  type: OrderActionType
  payload: OrderPayload
}

export type OrderActionType =
  | "setLoading"
  | "setOrderId"
  | "setOrder"
  | "setSingleQuantity"
  | "setCurrentSkuCodes"
  | "setCurrentSkuPrices"
  | "setCurrentItem"
  | "setErrors"
  | "setSaveAddressToCustomerAddressBook"
  | "setGiftCardOrCouponCode"
  | "setIncludesResource"

const actionType: OrderActionType[] = [
  "setLoading",
  "setOrderId",
  "setOrder",
  "setSingleQuantity",
  "setCurrentSkuCodes",
  "setCurrentSkuPrices",
  "setErrors",
  "setCurrentItem",
  "setSaveAddressToCustomerAddressBook",
  "setIncludesResource",
]

export async function createOrder(params: CreateOrderParams): Promise<string> {
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
    const sdk = config != null ? getSdk(config) : undefined
    try {
      if (sdk == null) return ""
      const o = await sdk?.orders.create({ metadata, ...orderAttributes })
      if (dispatch) {
        dispatch({
          type: "setOrderId",
          payload: {
            orderId: o?.id,
          },
        })
      }
      persistKey && setLocalOrder && setLocalOrder(persistKey, o.id)
      return o.id
    } catch (error: any) {
      const errors = getErrors({
        error,
        resource: "orders",
      })
      console.error("Create order", errors)
      if (dispatch)
        setErrors({
          currentErrors: state?.errors,
          newErrors: errors,
          dispatch,
        })
    }
  }
  return ""
}

export const getApiOrder: GetOrder = async (
  params,
): Promise<Order | undefined> => {
  const {
    id,
    dispatch,
    config,
    clearWhenPlaced,
    persistKey,
    deleteLocalOrder,
    state,
  } = params
  const sdk = config != null ? getSdk(config) : undefined
  try {
    if (sdk == null) return undefined
    const options: QueryParamsRetrieve = {}
    if (state?.include && state.include.length > 0) {
      options.include = state.include
    }
    const order = await sdk.orders.retrieve(id ?? "", options)
    if (clearWhenPlaced && order.editable === false) {
      persistKey && deleteLocalOrder && deleteLocalOrder(persistKey)
      if (dispatch) {
        dispatch({
          type: "setOrder",
          payload: {
            order: undefined,
            orderId: "",
          },
        })
      }
    } else {
      if (dispatch) {
        dispatch({
          type: "setOrder",
          payload: {
            order,
            orderId: order.id,
          },
        })
      }
    }
    return order
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: "orders",
    })
    console.error("Retrieve order", errors)
    if (dispatch)
      setErrors({
        currentErrors: state?.errors,
        newErrors: errors,
        dispatch,
      })
    return undefined
  }
}

export interface UpdateOrderArgs {
  id: string
  attributes: Omit<OrderUpdate, "id">
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
}: UpdateOrderArgs): Promise<{
  success: boolean
  error?: unknown
  order?: Order
}> {
  const sdk = config != null ? getSdk(config) : undefined
  try {
    if (sdk == null) return { success: false }
    const resource = { ...attributes, id }
    // const order = await sdk.orders.update(resource, { include })
    await sdk.orders.update(resource, { include })
    // NOTE: Retrieve doesn't response with attributes updated
    const order = await getApiOrder({ id, config, dispatch, state })
    dispatch && order && dispatch({ type: "setOrder", payload: { order } })
    return { success: true, order }
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: "orders",
    })
    if (dispatch) {
      setOrderErrors({ errors, dispatch })
      dispatch({
        type: "setErrors",
        payload: {
          errors,
        },
      })
    }
    return { success: false, error }
  }
}

interface TResourceRequest {
  resource: Extract<keyof CommerceLayerClient, "adyen_payments">
  requestType: "update"
  attributes: TResourceRequest["resource"] extends "adyen_payments"
    ? AdyenPaymentUpdate
    : ResourceUpdate
  order: Order
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  state?: OrderState
}

export async function paymentSourceRequest({
  resource,
  requestType,
  dispatch,
  attributes,
  config,
  order,
  state,
}: TResourceRequest): Promise<{ success: boolean; order?: Order }> {
  const sdk = config != null ? getSdk(config) : undefined
  try {
    if (sdk == null) return { success: false }
    const sdkResource = sdk[resource]
    await sdkResource[requestType](attributes)
    const orderUpdated = await updateOrder({
      id: order.id,
      attributes: {},
      config,
      include: state?.include,
      dispatch,
      state,
    })
    return { success: true, order: orderUpdated?.order }
  } catch (error: any) {
    console.error("Resource request", error)
    const errors = getErrors({ error, resource: "orders" })
    console.error("Remove gift card o coupon code", errors)
    dispatch && setOrderErrors({ errors, dispatch })
    return { success: false }
  }
}

export const setOrder = (
  order: Order,
  dispatch?: Dispatch<OrderActions>,
): void => {
  if (dispatch) {
    dispatch({
      type: "setOrder",
      payload: {
        order,
      },
    })
  }
}

export interface AddResourceToInclude {
  resourcesIncluded?: ResourceIncluded[]
  dispatch?: Dispatch<OrderActions>
  newResource?: ResourceIncluded | ResourceIncluded[]
  resourceIncludedLoaded?: ResourceIncludedLoaded
  newResourceLoaded?: ResourceIncludedLoaded
}

interface IncludesType {
  include: ResourceIncluded[] | undefined
  includeLoaded:
    | {
        [K in ResourceIncluded]?: boolean
      }
    | undefined
}

export function addResourceToInclude({
  resourcesIncluded = [],
  dispatch,
  newResource,
  newResourceLoaded,
  resourceIncludedLoaded,
}: AddResourceToInclude): void {
  const payload: IncludesType = {
    include: undefined,
    includeLoaded: undefined,
  }
  if (newResource) {
    const resources =
      typeof newResource === "string" ? [newResource] : newResource
    payload.include = [...new Set([...resourcesIncluded, ...resources])]
    resources.forEach((resource) => {
      const includeLoaded = {
        ...payload.includeLoaded,
        ...{ [resource]: true },
      }
      payload.includeLoaded = includeLoaded
    })
  } else {
    delete payload.include
  }
  const payloadIncludeLoaded = {
    ...resourceIncludedLoaded,
    ...newResourceLoaded,
    ...(payload.includeLoaded && payload.includeLoaded),
  }
  payload.includeLoaded = payloadIncludeLoaded
  if (dispatch)
    dispatch({
      type: "setIncludesResource",
      payload: {
        ...payload,
        withoutIncludes: false,
      },
    })
}

export interface LineItemOption {
  /**
   * SKU Option ID. Ex: mNJEgsJwBn
   */
  skuOptionId: string
  /**
   * Set of key-value pairs that represent the selected options. Ex: { message: 'This is a option message' }
   */
  options: Record<string, string>
  quantity?: number
}

type TFrequency =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "two-month"
  | "three-month"
  | "four-month"
  | "six-month"
  | "yearly"

export interface CustomLineItem {
  name?: string
  imageUrl?: string | null
  metadata?: Record<string, string>
  frequency?: LooseAutocomplete<TFrequency>
  externalPrice?: boolean
  _update_quantity?: boolean
}

export type AddToCartParams = Partial<{
  bundleCode: string
  skuCode: string
  persistKey: string
  config: CommerceLayerConfig
  dispatch: Dispatch<OrderActions>
  state: Partial<OrderState>
  quantity: number
  lineItemOption: LineItemOption
  lineItem: CustomLineItem
  orderMetadata: BaseMetadataObject
  orderAttributes: Record<string, any>
  errors: BaseError[]
  setLocalOrder: SetLocalOrder
  buyNowMode: boolean
  checkoutUrl: string
  openMiniCart: boolean
}>

export async function addToCart(
  params: AddToCartParams,
): Promise<{ success: boolean; orderId?: string }> {
  const {
    skuCode,
    bundleCode,
    quantity,
    config,
    dispatch,
    lineItem,
    state,
    errors = [],
    buyNowMode,
    checkoutUrl,
    lineItemOption,
    openMiniCart = true,
  } = params
  try {
    if (config) {
      const sdk = getSdk(config)
      const id = await createOrder(params)
      if (id) {
        const order = sdk.orders.relationship(id)
        const name = lineItem?.name
        const imageUrl = lineItem?.imageUrl
        const metadata = lineItem?.metadata
        const frequency = lineItem?.frequency
        const externalPrice = lineItem?.externalPrice
        if (buyNowMode) {
          if (!state?.order?.line_items) {
            const { line_items: lineItems } = await sdk.orders.retrieve(id, {
              fields: ["line_items"],
              include: ["line_items"],
            })
            if (lineItems && lineItems?.length > 0) {
              await Promise.all(
                lineItems.map(async (lineItem) => {
                  await sdk.line_items.delete(lineItem.id)
                }),
              )
            }
          } else {
            await Promise.all(
              state?.order?.line_items.map(async (lineItem) => {
                await sdk.line_items.delete(lineItem.id)
              }),
            )
          }
        }
        const attrs: LineItemCreate = {
          order,
          sku_code: skuCode,
          name,
          image_url: imageUrl,
          quantity: quantity ?? 1,
          _update_quantity: lineItem?._update_quantity ?? true,
          bundle_code: bundleCode,
          metadata,
          frequency: frequency as string,
        }
        if (externalPrice === true) {
          attrs._external_price = externalPrice
        }
        const newLineItem = await sdk.line_items.create(attrs)
        if (lineItemOption != null) {
          const { skuOptionId, options, quantity } = lineItemOption
          const skuOption = sdk.sku_options.relationship(skuOptionId)
          const lineItemRel = sdk.line_items.relationship(newLineItem.id)
          const lineItemOptionsAttributes: LineItemOptionCreate = {
            quantity: quantity ?? 1,
            options,
            sku_option: skuOption,
            line_item: lineItemRel,
          }
          await sdk.line_item_options.create(lineItemOptionsAttributes)
          await getApiOrder({ id, ...params })
        } else {
          await getApiOrder({ id, ...params, state })
        }
        if (!isEmpty(errors) && dispatch) {
          dispatch({
            type: "setErrors",
            payload: {
              errors: [],
            },
          })
        }
        if (
          buyNowMode &&
          id &&
          config?.accessToken != null &&
          config?.endpoint != null
        ) {
          const params = `${id}?accessToken=${config.accessToken ?? ""}`
          const { domain, slug } = getDomain(config.endpoint)
          const href = getApplicationLink({
            slug,
            orderId: id,
            accessToken: config.accessToken,
            applicationType: "checkout",
            domain,
          })
          const organizationConfig = await getOrganizationConfig({
            accessToken: config.accessToken,
            endpoint: config.endpoint,
            params: {
              accessToken: config.accessToken,
              orderId: order?.id,
              slug,
            },
          })
          const redirectUrl = checkoutUrl
            ? `${checkoutUrl}/${params}`
            : (organizationConfig?.links?.checkout ?? href)
          location.href = redirectUrl
        } else if (openMiniCart) {
          publish("open-cart")
        }
        return { success: true, orderId: id }
      }
    }
    return { success: false }
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: "orders",
    })
    console.error("Add to cart", errors)
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
    type: "setOrderId",
    payload: {
      orderId: "",
    },
  })
  dispatch({
    type: "setOrder",
    payload: {
      order: undefined,
    },
  })
}

interface OrderErrors {
  dispatch?: Dispatch<OrderActions>
  errors: BaseError[]
}

export function setOrderErrors({ dispatch, errors = [] }: OrderErrors): {
  success: boolean
} {
  if (dispatch)
    dispatch({
      type: "setErrors",
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
    const v = `${value.toString()}`
    setCustomerOrderParam(k, v)
    if (dispatch)
      dispatch({
        type: "setSaveAddressToCustomerAddressBook",
        payload: {
          [k]: v,
        },
      })
  }

interface TSetGiftCardOrCouponCodeParams {
  code: string
  codeType: OrderCodeType
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  order?: Order
  include?: string[]
  state?: OrderState
}

export async function setGiftCardOrCouponCode({
  code,
  codeType,
  dispatch,
  config,
  order,
  include,
  state,
}: TSetGiftCardOrCouponCodeParams): Promise<{
  success: boolean
  order?: Order
}> {
  try {
    if (config && order && code && dispatch) {
      const attributes: Omit<OrderUpdate, "id"> = {
        [codeType]: code,
      }
      const {
        success,
        order: currentOrder,
        error,
      } = await updateOrder({
        id: order.id,
        attributes,
        config,
        include,
        dispatch,
        state,
      })
      if (!success) throw error
      dispatch({
        type: "setErrors",
        payload: {
          errors: [],
        },
      })
      return { success, order: currentOrder }
    }
    return { success: false }
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: "orders",
      field: codeType,
    })
    dispatch && setOrderErrors({ errors, dispatch })
    return { success: false }
  }
}

export type CodeType = "coupon" | "gift_card"
export type OrderCodeType = `${CodeType}_code`

interface TRemoveGiftCardOrCouponCodeParams {
  codeType: OrderCodeType
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
  order?: Order
  include?: string[]
  state?: OrderState
}

export async function removeGiftCardOrCouponCode({
  codeType,
  dispatch,
  config,
  order,
  include,
  state,
}: TRemoveGiftCardOrCouponCodeParams): Promise<{
  success: boolean
  order?: Order
}> {
  try {
    if (config && order && dispatch) {
      const attributes: Omit<OrderUpdate, "id"> = {
        [codeType]: "",
      }
      const orderUpdated = await updateOrder({
        id: order.id,
        attributes,
        config,
        include,
        dispatch,
        state,
      })
      dispatch({
        type: "setErrors",
        payload: {
          errors: [],
        },
      })
      return { success: true, order: orderUpdated?.order }
    }
    return { success: false }
  } catch (error: any) {
    const errors = getErrors({ error, resource: "orders", field: codeType })
    console.error("Remove gift card o coupon code", errors)
    dispatch && setOrderErrors({ errors, dispatch })
    return { success: false }
  }
}

export const orderInitialState: Partial<OrderState> = {
  loading: true,
  orderId: "",
  order: undefined,
  errors: [],
  include: undefined,
  withoutIncludes: true,
}

const orderReducer = (state: OrderState, reducer: OrderActions): OrderState =>
  baseReducer<OrderState, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType,
  )

export default orderReducer

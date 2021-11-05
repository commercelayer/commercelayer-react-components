import baseReducer from '#utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import { isEmpty } from 'lodash'
import { LoaderType } from '#typings'
import { BaseError } from '#typings/errors'
import Sdk, { Order, LineItem } from '@commercelayer/sdk'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'

export type UpdateLineItemParams = {
  lineItemId: string
  quantity?: number
  dispatch: Dispatch<LineItemAction>
  config: CommerceLayerConfig
  getOrder: getOrderContext | undefined
  orderId: string
  errors: BaseError[] | undefined
}

export interface UpdateLineItem {
  (params: UpdateLineItemParams): void
}

export type DeleteLineItemParam = Record<string, any> & UpdateLineItemParams

export interface DeleteLineItem {
  (params: DeleteLineItemParam): void
}

export type GetLineItemsParams = {
  dispatch: Dispatch<LineItemAction>
  config: CommerceLayerConfig
  order: Order | null
  filters: Record<string, any>
}

export interface GetLineItems {
  (params: GetLineItemsParams): void
}

export interface LineItemPayload {
  loading?: boolean
  loader?: LoaderType
  lineItems?: LineItem[]
  errors?: BaseError[]
}

export interface LineItemState extends LineItemPayload {
  updateLineItem?: (lineItemId: string, quantity?: number) => void
  deleteLineItem?: (lineItemId: string) => void
}

export interface LineItemAction {
  type: LineItemActionType
  payload: LineItemPayload
}

export const getLineItems: GetLineItems = (params) => {
  const { order, dispatch, config } = params
  const sdk = getSdk(config)
  let allLineItems: LineItem[] = []
  order &&
    sdk.orders
      .retrieve(order?.id, {
        include: ['line_items', 'line_items.line_item_options.sku_option'],
        fields: {
          orders: ['line_items'],
        },
      })
      .then((response) => {
        dispatch({
          type: 'setLoading',
          payload: {
            loading: false,
          },
        })
        const items = response.line_items || []
        allLineItems = [...allLineItems, ...items]
        dispatch({
          type: 'setLineItems',
          payload: {
            lineItems: allLineItems,
          },
        })
      })
      .catch((error) => {
        const errors = getErrors(error, 'line_items')
        dispatch({
          type: 'setErrors',
          payload: {
            errors,
          },
        })
      })
}

export const updateLineItem: UpdateLineItem = async (params) => {
  const { config, lineItemId, quantity, getOrder, orderId, dispatch } = params
  const sdk = getSdk(config)
  try {
    await sdk.line_items.update({ id: lineItemId, quantity })
    getOrder && (await getOrder(orderId))
    dispatch({
      type: 'setErrors',
      payload: {
        errors: [],
      },
    })
  } catch (error) {
    const errors = getErrors(error, 'line_items')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  }
}

export const deleteLineItem: DeleteLineItem = async (params) => {
  const { config, lineItemId, getOrder, orderId, dispatch } = params
  const sdk = getSdk(config)
  try {
    await sdk.line_items.delete(lineItemId)
    getOrder && (await getOrder(orderId))
    dispatch({
      type: 'setErrors',
      payload: {
        errors: [],
      },
    })
  } catch (error) {
    const errors = getErrors(error, 'line_items')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  }
}

export const lineItemInitialState: LineItemState = {
  loading: false,
  lineItems: [],
  errors: [],
}

export type LineItemActionType = 'setLineItems' | 'setErrors' | 'setLoading'

const actionType: LineItemActionType[] = [
  'setLineItems',
  'setErrors',
  'setLoading',
]

const lineItemReducer = (
  state: LineItemState,
  reducer: LineItemAction
): LineItemState =>
  baseReducer<LineItemState, LineItemAction, LineItemActionType[]>(
    state,
    reducer,
    actionType
  )

export default lineItemReducer

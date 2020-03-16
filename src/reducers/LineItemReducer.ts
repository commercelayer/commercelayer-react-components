import CLayer, {
  LineItemCollection,
  OrderCollection
} from '@commercelayer/js-sdk'
import baseReducer from '../utils/baseReducer'
import { BaseError } from '../components/Errors'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import _ from 'lodash'

export type UpdateLineItemParams = {
  lineItemId: string
  quantity?: number
  dispatch: Dispatch<LineItemAction>
  config: CommerceLayerConfig
  getOrder: getOrderContext
  orderId: string
  errors: BaseError[]
}

export interface UpdateLineItem {
  (params: UpdateLineItemParams): void
}

export type DeleteLineItemParam = {} & UpdateLineItemParams

export interface DeleteLineItem {
  (params: DeleteLineItemParam): void
}

export type GetLineItemsParams = {
  dispatch: Dispatch<LineItemAction>
  config: CommerceLayerConfig
  order: OrderCollection
}

export interface GetLineItems {
  (params: GetLineItemsParams): void
}

export interface LineItemPayload {
  lineItems?: LineItemCollection[]
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

export const getLineItems: GetLineItems = params => {
  const { order, dispatch, config } = params
  let allLineItems: LineItemCollection[] = []
  order
    .withCredentials(config)
    .lineItems()
    .includes('lineItemOptions')
    .all()
    .then(async res => {
      const items = res.toArray()
      allLineItems = [...allLineItems, ...items]
      dispatch({
        type: 'setLineItems',
        payload: {
          lineItems: allLineItems
        }
      })
      let colResp = res
      const pageCount = res.pageCount()
      if (colResp.hasNextPage() && pageCount) {
        for (let index = 1; index < pageCount; index++) {
          colResp = await colResp.withCredentials(config).nextPage()
          const nextItems = colResp.toArray()
          allLineItems = [...allLineItems, ...nextItems]
          dispatch({
            type: 'setLineItems',
            payload: {
              lineItems: allLineItems
            }
          })
        }
      }
    })
}

export const updateLineItem: UpdateLineItem = async params => {
  const {
    config,
    lineItemId,
    quantity,
    getOrder,
    orderId,
    dispatch,
    errors
  } = params
  try {
    const lineItem = await CLayer.LineItem.withCredentials(config).find(
      lineItemId
    )
    const update = await lineItem.withCredentials(config).update({ quantity })
    if (!update.errors().empty()) {
      throw update
    }
    await getOrder(orderId)
    if (!_.isEmpty(errors)) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors: []
        }
      })
    }
  } catch (c) {
    const errors = getErrorsByCollection(c, 'lineItem')
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

export const deleteLineItem: DeleteLineItem = async params => {
  const { config, lineItemId, getOrder, orderId, dispatch, errors } = params
  try {
    const lineItem = await CLayer.LineItem.withCredentials(config).find(
      lineItemId
    )
    const destroyLineItem = await lineItem.withCredentials(config).destroy()
    if (!destroyLineItem.errors().empty()) {
      throw destroyLineItem
    }
    await getOrder(orderId)
    if (!_.isEmpty(errors)) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors: []
        }
      })
    }
  } catch (c) {
    const errors = getErrorsByCollection(c, 'lineItem')
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

export const lineItemInitialState: LineItemState = {
  lineItems: [],
  errors: []
}

export type LineItemActionType = 'setLineItems' | 'setErrors'

const actionType: LineItemActionType[] = ['setLineItems', 'setErrors']

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

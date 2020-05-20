import CLayer, {
  LineItemCollection,
  OrderCollection,
} from '@commercelayer/js-sdk'
import baseReducer from '../utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { getOrderContext } from './OrderReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import _ from 'lodash'
import { LoaderType } from '../@types'
import { BaseError } from '../@types/errors'

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

export type DeleteLineItemParam = {} & UpdateLineItemParams

export interface DeleteLineItem {
  (params: DeleteLineItemParam): void
}

export type GetLineItemsParams = {
  dispatch: Dispatch<LineItemAction>
  config: CommerceLayerConfig
  order: OrderCollection | null
  filters: object
}

export interface GetLineItems {
  (params: GetLineItemsParams): void
}

export interface LineItemPayload {
  loading?: boolean
  loader?: LoaderType
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

export const getLineItems: GetLineItems = (params) => {
  const { order, dispatch, config, filters } = params
  let allLineItems: LineItemCollection[] = []
  order &&
    order
      .withCredentials(config)
      .lineItems()
      .where(filters)
      .includes('lineItemOptions.skuOption')
      .all()
      .then(async (res) => {
        dispatch({
          type: 'setLoading',
          payload: {
            loading: false,
          },
        })
        const items = res.toArray()
        allLineItems = [...allLineItems, ...items]
        dispatch({
          type: 'setLineItems',
          payload: {
            lineItems: allLineItems,
          },
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
                lineItems: allLineItems,
              },
            })
          }
        }
      })
      .catch((c: any) => {
        const errors = getErrorsByCollection(c, 'lineItem')
        dispatch({
          type: 'setErrors',
          payload: {
            errors,
          },
        })
      })
}

export const updateLineItem: UpdateLineItem = async (params) => {
  const {
    config,
    lineItemId,
    quantity,
    getOrder,
    orderId,
    dispatch,
    errors,
  } = params
  try {
    const lineItem = await CLayer.LineItem.withCredentials(config).find(
      lineItemId
    )
    const update = await lineItem.withCredentials(config).update({ quantity })
    if (!update.errors().empty()) {
      throw update
    }
    getOrder && (await getOrder(orderId))
    if (!_.isEmpty(errors)) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
    }
  } catch (c) {
    const errors = getErrorsByCollection<LineItemCollection>(c, 'lineItem')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
  }
}

export const deleteLineItem: DeleteLineItem = async (params) => {
  const { config, lineItemId, getOrder, orderId, dispatch, errors } = params
  try {
    const lineItem = await CLayer.LineItem.withCredentials(config).find(
      lineItemId
    )
    const destroyLineItem = await lineItem.withCredentials(config).destroy()
    if (!destroyLineItem.errors().empty()) {
      throw destroyLineItem
    }
    getOrder && (await getOrder(orderId))
    if (!_.isEmpty(errors)) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
    }
  } catch (c) {
    const errors = getErrorsByCollection(c, 'lineItem')
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

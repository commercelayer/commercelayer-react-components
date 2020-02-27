import { BaseUnsetState } from '../@types/index'
import { SkuCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import baseReducer from '../utils/baseReducer'

export interface Items {
  [skuCode: string]: SkuCollection
}

export interface ItemQuantity {
  [skuCode: string]: number
}

export interface ItemOption {
  skuOptionId: string
  options: {
    [key: string]: string
  }
}

export interface ItemOptions {
  [skuCode: string]: ItemOption
}

type ItemParams = {
  type: ItemActionType
  key: 'items' | 'item' | 'quantity' | 'option'
}

export interface SetItemState {
  (
    data: Items | ItemQuantity | ItemOptions,
    params: ItemParams,
    dispatch: Dispatch<ItemAction>
  ): void
}

// TODO: Set to other reducer files
export const setItemState: SetItemState = (data, params, dispatch) => {
  dispatch({
    type: params.type,
    payload: {
      [`${params.key}`]: data
    }
  })
}

export const unsetItemState: BaseUnsetState<ItemAction> = dispatch => {
  dispatch({
    type: 'setItem',
    payload: {
      item: null
    }
  })
  dispatch({
    type: 'setItems',
    payload: {
      items: null
    }
  })
  dispatch({
    type: 'setQuantity',
    payload: {
      quantity: {}
    }
  })
  dispatch({
    type: 'setOption',
    payload: {
      option: {}
    }
  })
}

export interface ItemState {
  items?: Items
  item?: Items
  quantity?: ItemQuantity
  option?: ItemOptions
  setItems?: (items: Items) => void
  setItem?: (item: Items) => void
  setQuantity?: (quantity: ItemQuantity) => void
  setOption?: (option: ItemOptions) => void
}

type ItemActionType = 'setItem' | 'setItems' | 'setQuantity' | 'setOption'

const actionType: ItemActionType[] = [
  'setItem',
  'setItems',
  'setQuantity',
  'setOption'
]

export interface ItemAction {
  type: ItemActionType
  payload: ItemState
}

export const itemInitialState: ItemState = {
  items: {},
  item: {},
  quantity: {},
  option: {}
}

const itemReducer = (state: ItemState, reducer: ItemAction): ItemState =>
  baseReducer<ItemState, ItemAction, ItemActionType[]>(
    state,
    reducer,
    actionType
  )

export default itemReducer

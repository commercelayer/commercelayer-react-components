import {
  GeneralReducer,
  GeneralActions,
  GeneralUnsetState
} from '../@types/index'
import { SkuCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'

export interface Items {
  [skuCode: string]: SkuCollection
}

export interface ItemQuantity {
  [skuCode: string]: number
}

type ItemParams = {
  type: ItemActionType
  key: 'items' | 'item' | 'quantity'
}

export interface SetItemState {
  (
    data: Items | ItemQuantity,
    params: ItemParams,
    dispatch: Dispatch<ItemActions>
  )
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

export const unsetItemState: GeneralUnsetState<ItemActions> = dispatch => {
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
}

export interface ItemState {
  items?: Items
  item?: Items
  quantity?: ItemQuantity
  setItems?: (items: Items) => SetItemState
  setItem?: (item: Items) => SetItemState
  setQuantity?: (quantity: ItemQuantity) => SetItemState
}

type ItemActionType = 'setItem' | 'setItems' | 'setQuantity'

export interface ItemActions extends GeneralActions {
  type: ItemActionType
  payload: ItemState
}

export const itemInitialState: ItemState = {
  items: {},
  item: {},
  quantity: {}
}

const itemReducer: GeneralReducer<ItemState, ItemActions> = (state, action) => {
  const actions: ItemActionType[] = ['setItem', 'setItems', 'setQuantity']
  if (actions.indexOf(action.type) !== -1) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default itemReducer
